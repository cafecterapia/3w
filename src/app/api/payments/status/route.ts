import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { efi } from '@/lib/efi';

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

    // Check if the txid matches the user's subscription ID
    if (user.efiSubscriptionId !== txid) {
      return NextResponse.json(
        { success: false, message: 'Payment not found for this user.' },
        { status: 404 }
      );
    }

    // Handle temporary transaction IDs (profile completion needed)
    if (txid.startsWith('temp_') && user.subscriptionStatus === 'PENDING_PROFILE') {
      return NextResponse.json({
        success: true,
        status: 'pending_profile',
        paymentData: null,
        subscriptionStatus: user.subscriptionStatus,
        requiresProfileCompletion: true,
      });
    }

    // If payment was cancelled (no efiSubscriptionId), return cancelled status
    if (!user.efiSubscriptionId) {
      return NextResponse.json({
        success: true,
        status: 'cancelled',
        paymentData: null,
        subscriptionStatus: null,
        message: 'Payment was cancelled.'
      });
    }

    // Check if payment has expired (6 minutes after creation)
    if (user.paymentCreatedAt) {
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

    // Check payment status with EFI
    let efiStatus = 'pending';
    let paymentData = null;

    try {
      // Get the charge details from EFI
      const efiResponse = await efi.pixDetailCharge({ txid });

      if (efiResponse.status === 'CONCLUIDA') {
        efiStatus = 'paid';

        // Update user subscription status if paid
        if (user.subscriptionStatus !== 'ACTIVE') {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'ACTIVE',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
          });
        }
      } else if (efiResponse.status === 'EXPIRADA') {
        efiStatus = 'expired';
      } else if (efiResponse.status === 'ATIVA') {
        efiStatus = 'pending';
      }

      // For pending payments, use stored QR code data from database
      if (efiStatus === 'pending') {
        if (user.qrCodeImage && user.qrCodeText) {
          paymentData = {
            qrcodeImage: user.qrCodeImage,
            qrcodeText: user.qrCodeText,
            txid: txid,
          };
        } else {
          // If no QR code data stored, return null (payment may need to be recreated)
          paymentData = null;
        }
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
