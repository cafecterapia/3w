import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { efi } from '@/lib/efi';
import { calculatePricing } from '@/lib/pricing-constants';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { txid, name, cpf } = await request.json();

    if (!txid || !name || !cpf) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Validate CPF format
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      return NextResponse.json(
        { success: false, message: 'Invalid CPF format.' },
        { status: 400 }
      );
    }

    // Get user and validate temp transaction
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.efiSubscriptionId !== txid || !txid.startsWith('temp_')) {
      return NextResponse.json(
        { success: false, message: 'Invalid transaction.' },
        { status: 404 }
      );
    }

    if (!user.classCount || !user.schedulingOption) {
      return NextResponse.json(
        { success: false, message: 'Missing payment details.' },
        { status: 400 }
      );
    }

    // Calculate pricing based on stored plan selection
    const expectedPricing = calculatePricing(
      user.classCount,
      user.schedulingOption as 'recurring' | 'on-demand'
    );

    // Update user profile first
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        cpf,
      },
    });

    // Check if EFI payment system is configured
    if (
      !process.env.EFI_CLIENT_ID ||
      !process.env.EFI_CLIENT_SECRET ||
      !process.env.EFI_PIX_KEY
    ) {
      console.error('EFI Payment system not configured.');
      return NextResponse.json(
        {
          success: false,
          message: 'Payment system is currently unavailable.',
        },
        { status: 503 }
      );
    }

    // Create EFI charge
    const chargePayload = {
      calendario: {
        expiracao: 360, // 6 minutes
      },
      devedor: {
        cpf: cpfNumbers,
        nome: name,
      },
      valor: {
        original: expectedPricing.finalPrice.toFixed(2),
      },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: `Plano de ${user.classCount} aulas.`,
    };

    let efiResponse;
    try {
      efiResponse = await efi.pixCreateImmediateCharge({}, chargePayload);
    } catch (efiError) {
      console.error('EFI payment creation error:', efiError);
      const errorMessage = (efiError as any)?.response?.data?.mensagem || 'Payment system temporarily unavailable';
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 503 }
      );
    }

    // Generate QR code
    let qrCodeResponse;
    try {
      qrCodeResponse = await efi.pixGenerateQRCode({
        id: efiResponse.loc.id,
      });
    } catch (qrError) {
      console.error('QR Code generation error:', qrError);
      return NextResponse.json({
        success: false,
        message: 'QR code generation failed. Please try again.',
      });
    }

    // Update user with real EFI data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        efiSubscriptionId: efiResponse.txid,
        subscriptionStatus: 'PENDING',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentCreatedAt: new Date(),
        efiLocationId: efiResponse.loc?.id || null,
        qrCodeImage: qrCodeResponse.imagemQrcode,
        qrCodeText: qrCodeResponse.qrcode,
        classesUsed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      paymentData: {
        qrcodeImage: qrCodeResponse.imagemQrcode,
        qrcodeText: qrCodeResponse.qrcode,
        txid: efiResponse.txid,
      },
      newTxid: efiResponse.txid,
    });
  } catch (error) {
    console.error('Error creating payment from profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
