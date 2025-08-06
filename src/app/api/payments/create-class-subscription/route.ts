import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { efi } from '@/lib/efi';
import { PlanSelection } from '@/types';
import { calculatePricing } from '@/lib/pricing-constants';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        requiresAuth: true,
        message: 'Authentication required.',
      });
    }

    const planSelection: PlanSelection = await request.json();

    if (
      !planSelection.classCount ||
      planSelection.classCount < 1 ||
      planSelection.classCount > 8
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid class count.' },
        { status: 400 }
      );
    }
    if (!['recurring', 'on-demand'].includes(planSelection.schedulingOption)) {
      return NextResponse.json(
        { success: false, message: 'Invalid scheduling option.' },
        { status: 400 }
      );
    }

    const expectedPricing = calculatePricing(
      planSelection.classCount,
      planSelection.schedulingOption
    );
    if (
      Math.abs(expectedPricing.finalPrice - planSelection.totalPrice) > 0.01
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Price mismatch. Please refresh and try again.',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      });
    }

    // If user doesn't have name or CPF, create a payment intent without EFI charges
    // The payment page will collect this information and create the actual payment
    if (!user.name || !user.cpf) {
      // Generate a temporary transaction ID for the payment flow
      const tempTxid = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the payment intent in the database so we can retrieve it later
      await prisma.user.update({
        where: { id: user.id },
        data: {
          efiSubscriptionId: tempTxid,
          subscriptionStatus: 'PENDING_PROFILE',
          classCount: planSelection.classCount,
          schedulingOption: planSelection.schedulingOption,
          paymentCreatedAt: new Date(),
        },
      });
      
      return NextResponse.json({
        success: true,
        paymentConfirmationUrl: `/billing/pay?txid=${tempTxid}`,
      });
    }

    // Check if EFI payment system is configured
    if (
      !process.env.EFI_CLIENT_ID ||
      !process.env.EFI_CLIENT_SECRET ||
      !process.env.EFI_PIX_KEY
    ) {
      console.error(
        'EFI Payment system not configured. Missing environment variables:',
        {
          EFI_CLIENT_ID: !!process.env.EFI_CLIENT_ID,
          EFI_CLIENT_SECRET: !!process.env.EFI_CLIENT_SECRET,
          EFI_PIX_KEY: !!process.env.EFI_PIX_KEY,
          EFI_CERTIFICATE_PATH: !!process.env.EFI_CERTIFICATE_PATH,
        }
      );
      return NextResponse.json(
        {
          success: false,
          message:
            'Payment system is currently unavailable. Please contact support or try again later.',
          error: 'PAYMENT_SYSTEM_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    const chargePayload = {
      calendario: {
        expiracao: 360, // 6 minutes
      },
      devedor: {
        cpf: user.cpf?.replace(/\D/g, '') || '00000000000', // Use default CPF if not provided
        nome: user.name || 'Usuário', // Use default name if not provided
      },
      valor: {
        original: expectedPricing.finalPrice.toFixed(2),
      },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: `Plano de ${planSelection.classCount} aulas.`,
    };

    let efiResponse;
    try {
      efiResponse = await efi.pixCreateImmediateCharge({}, chargePayload);
    } catch (efiError) {
      console.error('EFI API Error:', efiError);
      
      // Check if it's an authentication error
      if ((efiError as any)?.response?.status === 401) {
        return NextResponse.json(
          { success: false, message: 'Payment system authentication failed. Please contact support.' },
          { status: 503 }
        );
      }
      
      // Check if it's a validation error
      if ((efiError as any)?.response?.status === 400) {
        const errorMessage = (efiError as any)?.response?.data?.mensagem || 'Invalid payment data';
        return NextResponse.json(
          { success: false, message: `Payment validation error: ${errorMessage}` },
          { status: 400 }
        );
      }
      
      // Generic error
      const errorMessage = (efiError as any)?.response?.data?.mensagem || 'Payment system temporarily unavailable';
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 503 }
      );
    }

    // Store payment data in database before generating QR code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        efiSubscriptionId: efiResponse.txid,
        subscriptionStatus: 'PENDING',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentCreatedAt: new Date(), // Track when payment was created
        efiLocationId: efiResponse.loc?.id || null, // Store location ID for QR regeneration
        classCount: planSelection.classCount, // Store the actual number of classes purchased
        schedulingOption: planSelection.schedulingOption, // Store the scheduling type ('recurring' or 'on-demand')
        classesUsed: 0, // Reset classes used count for new purchase
      },
    });

    let qrCodeResponse;
    try {
      qrCodeResponse = await efi.pixGenerateQRCode({
        id: efiResponse.loc.id,
      });
    } catch (qrError) {
      console.error('QR Code generation error:', qrError);
      
      // If QR code generation fails, we can still proceed with the payment
      // The user can try refreshing the page or the QR code can be regenerated later
      return NextResponse.json({
        success: true,
        paymentData: null, // No QR code data
        paymentConfirmationUrl: `/billing/pay?txid=${efiResponse.txid}`,
        message: 'Payment created but QR code generation failed. Please refresh the page.',
      });
    }

    // Update user with QR code data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        qrCodeImage: qrCodeResponse.imagemQrcode,
        qrCodeText: qrCodeResponse.qrcode,
      },
    });

    return NextResponse.json({
      success: true,
      paymentData: {
        qrcodeImage: qrCodeResponse.imagemQrcode,
        qrcodeText: qrCodeResponse.qrcode,
        txid: efiResponse.txid,
      },
      paymentConfirmationUrl: `/billing/pay?txid=${efiResponse.txid}`,
    });
  } catch (error) {
    console.error('Error creating EfiPay charge:', error);
    const errorMessage =
      (error as any)?.response?.data?.mensagem || 'Internal server error.';
    return NextResponse.json(
      { success: false, message: `Failed to create payment: ${errorMessage}` },
      { status: 500 }
    );
  }
}
