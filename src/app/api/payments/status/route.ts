import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { efi, efiService } from '@/lib/efi';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const txid = searchParams.get('txid');

    if (!txid) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required.' },
        { status: 400 }
      );
    }

    // Get payment data from database
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        efiSubscriptionId: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        paymentCreatedAt: true,
        qrCodeImage: true,
        qrCodeText: true,
        efiLocationId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    // Try to resolve payment either via legacy user field or Payment record
    const paymentRecord = await (prisma as any).payment.findFirst({
      where: { userId: user.id, externalId: txid },
    });

    // If neither legacy field nor payment record match, 404
    if (user.efiSubscriptionId !== txid && !paymentRecord) {
      return NextResponse.json(
        { success: false, message: 'Payment not found for this user.' },
        { status: 404 }
      );
    }

    // Handle temporary transaction IDs (profile completion needed)
    if (
      txid.startsWith('temp_') &&
      user.subscriptionStatus === 'PENDING_PROFILE'
    ) {
      return NextResponse.json({
        success: true,
        status: 'pending_profile',
        paymentData: null,
        subscriptionStatus: user.subscriptionStatus,
        requiresProfileCompletion: true,
      });
    }

    // If payment was cancelled (no efiSubscriptionId) and no record, return cancelled status
    if (!user.efiSubscriptionId && !paymentRecord) {
      return NextResponse.json({
        success: true,
        status: 'cancelled',
        paymentData: null,
        subscriptionStatus: null,
        message: 'Payment was cancelled.',
      });
    }

    // Check if payment has expired (6 minutes after creation)
    // Only applies to PIX immediate charges; do not auto-expire boleto/card
    if (
      user.paymentCreatedAt &&
      (!paymentRecord || paymentRecord.method === 'pix')
    ) {
      const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
      if (
        user.paymentCreatedAt < sixMinutesAgo &&
        user.subscriptionStatus === 'PENDING'
      ) {
        // Payment has expired, clean it up
        await prisma.user.update({
          where: { id: user.id },
          data: {
            efiSubscriptionId: null,
            subscriptionStatus: null,
            currentPeriodEnd: null,
            paymentCreatedAt: null,
            qrCodeImage: null,
            qrCodeText: null,
            efiLocationId: null,
          },
        });

        return NextResponse.json({
          success: true,
          status: 'expired',
          paymentData: null,
          subscriptionStatus: null,
        });
      }
    }

    // Check payment status with EFI (PIX vs generic)
    let efiStatus = 'pending';
    let paymentData: any = null;

    try {
      const isNumericId = /^\d+$/.test(txid);
      const isHexId = /^[a-f0-9]{32}$/.test(txid);

      // Determine if this is a PIX transaction:
      // 1. If payment record exists and method is 'pix'
      // 2. If txid is a 32-character hex string (PIX format)
      // 3. If no payment record exists but user has PIX-related data (qrCodeImage, efiLocationId)
      const isPix =
        paymentRecord?.method === 'pix' ||
        isHexId ||
        (!paymentRecord && (user.qrCodeImage || user.efiLocationId));

      if (!isPix && isNumericId) {
        // Card/Boleto generic detail (numeric charge IDs)
        const detail = await efiService.detailGenericCharge(txid);
        const status = (detail.status || '').toLowerCase();
        if (status === 'paid') efiStatus = 'paid';
        else if (status === 'canceled') efiStatus = 'cancelled';
        else efiStatus = 'pending';

        if (efiStatus === 'pending') {
          // Provide boleto/card metadata if available
          if (paymentRecord?.method === 'boleto') {
            const anyDetail: any = detail as any;
            paymentData = {
              kind: 'boleto',
              chargeId: txid,
              billetLink:
                paymentRecord.boletoLink ??
                anyDetail.billet_link ??
                anyDetail.link,
              billetPdfUrl: paymentRecord.boletoPdfUrl ?? anyDetail.pdf,
              barcode: paymentRecord.boletoBarcode ?? anyDetail.barcode,
            };
          } else if (paymentRecord?.method === 'card') {
            paymentData = {
              kind: 'card',
              chargeId: txid,
              paymentUrl: paymentRecord.paymentUrl ?? detail.link,
              cardBrand: paymentRecord.cardBrand,
              cardLast4: paymentRecord.cardLast4,
            };
          }
        }
      } else {
        // PIX detail (detected by hex ID, explicit method, or PIX-related user data)
        const efiResponse = await efi.pixDetailCharge({ txid });
        if (efiResponse.status === 'CONCLUIDA') {
          efiStatus = 'paid';
        } else if (efiResponse.status === 'EXPIRADA') {
          efiStatus = 'expired';
        } else if (efiResponse.status === 'ATIVA') {
          efiStatus = 'pending';
        }

        if (efiStatus === 'pending') {
          if (user.qrCodeImage && user.qrCodeText) {
            paymentData = {
              kind: 'pix',
              qrcodeImage: user.qrCodeImage,
              qrcodeText: user.qrCodeText,
              txid: txid,
            };
          } else {
            paymentData = null;
          }
        }
      }

      // On paid, mark user active
      if (efiStatus === 'paid' && user.subscriptionStatus !== 'ACTIVE') {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'ACTIVE',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    } catch (efiError) {
      console.error('Error checking EFI payment status:', efiError);
      // If we can't check with EFI, fall back to database status
      if (user.subscriptionStatus === 'ACTIVE') {
        efiStatus = 'paid';
      } else {
        // If we can't reach EFI and user is not active, assume pending
        efiStatus = 'pending';
      }
    }

    return NextResponse.json({
      success: true,
      status: efiStatus,
      paymentData,
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
