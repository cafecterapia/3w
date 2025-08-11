import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { efi } from '@/lib/efi';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.name || !user.cpf) {
      return NextResponse.json(
        {
          error: 'User profile incomplete',
          user: { name: user?.name, cpf: user?.cpf },
        },
        { status: 400 }
      );
    }

    if (!process.env.EFI_PIX_KEY) {
      return NextResponse.json(
        { error: 'EFI PIX key not configured' },
        { status: 503 }
      );
    }

    const chargePayload = {
      calendario: { expiracao: 3600 },
      devedor: {
        cpf: user.cpf.replace(/\D/g, ''),
        nome: user.name,
      },
      valor: { original: '1.00' },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: 'Teste de pagamento - DEBUG',
    };

    console.log('Creating test charge with payload:', chargePayload);
    const efiResponse = await efi.pixCreateImmediateCharge({}, chargePayload);
    console.log('EFI Response:', efiResponse);

    let qrCodeData = null as { qrcodeImage: string; qrcodeText: string } | null;
    if (efiResponse.loc?.id) {
      try {
        const qrCodeResponse = await efi.pixGenerateQRCode({
          id: efiResponse.loc.id,
        });
        qrCodeData = {
          qrcodeImage: qrCodeResponse.imagemQrcode,
          qrcodeText: qrCodeResponse.qrcode,
        };
      } catch (qrError) {
        console.error('QR Code generation error:', qrError);
      }
    }

    return NextResponse.json({
      success: true,
      efiResponse,
      qrCodeData,
      chargePayload,
    });
  } catch (error) {
    console.error('Debug payment test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
