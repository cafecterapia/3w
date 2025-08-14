import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { efiService, validateEfiCoreConfig } from '@/lib/efi';
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user || !user.classCount || !user.schedulingOption) {
      return NextResponse.json(
        { success: false, message: 'Missing payment details.' },
        { status: 400 }
      );
    }

    if (!user.name || !user.cpf || !user.email) {
      return NextResponse.json(
        { success: false, message: 'Complete profile required.' },
        { status: 400 }
      );
    }

    const pricing = calculatePricing(
      user.classCount,
      user.schedulingOption as 'recurring' | 'on-demand'
    );
    const amountCents = Math.round(pricing.finalPrice * 100);

    const description =
      user.schedulingOption === 'recurring'
        ? `Plano Recorrente - ${user.classCount} aulas`
        : `Pacote Avulso - ${user.classCount} aulas`;

    const expireAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // For boleto/card flows we don't need PIX certificate, but we need core creds and payee code
    const efiCfg = validateEfiCoreConfig();
    if (!efiCfg.ok) {
      console.error(
        'EFI Payment system not configured for boleto:',
        efiCfg.issues
      );
      return NextResponse.json(
        {
          success: false,
          message:
            'Payment system not configured. Please contact support or try again later.',
        },
        { status: 503 }
      );
    }

    // Reuse existing pending boleto (avoid creating multiple identical charges)
    const existing = await (prisma as any).payment.findFirst({
      where: {
        userId: user.id,
        method: 'boleto',
        status: 'PENDING',
        amount: amountCents,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      console.log('[API][create-boleto] Reusing existing pending boleto', {
        paymentId: existing.id,
        externalId: existing.externalId,
      });

      // Refresh user payment linkage if missing
      try {
        if (user.efiSubscriptionId !== existing.externalId) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              efiSubscriptionId: existing.externalId,
              subscriptionStatus: 'PENDING',
              paymentCreatedAt: existing.createdAt ?? new Date(),
            },
          });
        }
      } catch (linkErr) {
        console.warn(
          '[API][create-boleto] Failed to refresh user linkage for reused boleto',
          linkErr
        );
      }

      return NextResponse.json({
        success: true,
        chargeId: existing.externalId,
        billetLink: existing.boletoLink,
        billetPdfUrl: existing.boletoPdfUrl,
        barcode: existing.boletoBarcode,
        reused: true,
      });
    }

    const created = await efiService.createBoletoCharge({
      description,
      amountCents,
      customer: { name: user.name, email: user.email, cpf: user.cpf },
      expireAtISODate: expireAt,
      notificationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/efi`,
    });

    const chargeId: string = String(created.charge_id);
    const billetLink: string | undefined = created.billet_link || created.link;
    // SDK may return pdf as object { charge: string } or as string
    const rawPdf = (created as any)?.pdf || (created as any)?.billet_pdf;
    const billetPdfUrl: string | undefined =
      typeof rawPdf === 'string' ? rawPdf : rawPdf?.charge || undefined;
    const barcode: string | undefined =
      (created as any)?.barcode ||
      (created as any)?.billet_barcode ||
      undefined;

    await (prisma as any).payment.create({
      data: {
        userId: user.id,
        provider: 'efi',
        method: 'boleto',
        externalId: chargeId,
        status: 'PENDING',
        amount: amountCents,
        currency: 'BRL',
        boletoLink: billetLink,
        boletoPdfUrl: billetPdfUrl,
        boletoBarcode: barcode,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        efiSubscriptionId: chargeId,
        subscriptionStatus: 'PENDING',
        paymentCreatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      chargeId,
      billetLink,
      billetPdfUrl,
      barcode,
      reused: false,
    });
  } catch (error) {
    const err: any = error;
    console.error('Error creating boleto charge:', err);
    try {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const headers = err?.response?.headers;
      console.error('[API][create-boleto] Detailed error context:', {
        at: new Date().toISOString(),
        httpStatus: status,
        efipayRequestId:
          headers?.['x-efipay-request-id'] || headers?.['x-request-id'] || null,
        mensagem: data?.mensagem,
        nome: data?.nome,
        error: data?.erro || data?.error,
        error_description: data?.error_description,
        code: data?.code || err?.code,
        hasClientId: !!process.env.EFI_CLIENT_ID,
        hasClientSecret: !!process.env.EFI_CLIENT_SECRET,
        hasPayeeCode: !!process.env.EFI_PAYEE_CODE,
        payeeCodePrefix: process.env.EFI_PAYEE_CODE?.slice(0, 6) + '***',
        environment: process.env.EFI_ENVIRONMENT,
      });
      if (data) {
        try {
          console.error(
            '[API][create-boleto] Raw response snippet:',
            typeof data === 'string'
              ? data.slice(0, 500)
              : JSON.stringify(data, null, 2).slice(0, 1000)
          );
        } catch {}
      }
    } catch {}
    const statusCode = (error as any)?.response?.status as number | undefined;
    const apiMsg = (error as any)?.response?.data?.mensagem as
      | string
      | undefined;
    const msg = (error as any)?.message as string | undefined;
    const message = apiMsg || msg || 'Internal error creating boleto payment.';
    const isAuth =
      statusCode === 401 ||
      /unauthorized|authentication failed|invalid token/i.test(message);
    return NextResponse.json(
      {
        success: false,
        message: isAuth
          ? 'Payment gateway authentication failed. Please contact support.'
          : message,
      },
      { status: isAuth ? 503 : statusCode || 500 }
    );
  }
}
