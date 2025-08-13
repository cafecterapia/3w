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

    const body = await request.json();
    const paymentToken: string | undefined = body?.payment_token;
    const installments: number | undefined = body?.installments;
    const billingAddress = body?.billing_address;
    if (!paymentToken) {
      return NextResponse.json(
        { success: false, message: 'Missing payment_token.' },
        { status: 400 }
      );
    }

    // Require coherent environment and payee code (client token context)
    const payeeCode = process.env.EFI_PAYEE_CODE || '';
    if (!payeeCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment system misconfigured (missing Payee Code).',
        },
        { status: 503 }
      );
    }
    const rawEnv = (process.env.EFI_ENVIRONMENT || 'sandbox').toLowerCase();
    const normalizedEnv: 'sandbox' | 'production' = [
      'prod',
      'producao',
      'production',
      'live',
    ].includes(rawEnv)
      ? 'production'
      : 'sandbox';

    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone_number: true,
        classCount: true,
        schedulingOption: true,
      },
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

    // Efí requires phone_number for credit card transactions
    if (!user.phone_number) {
      return NextResponse.json(
        { success: false, message: 'Phone number required.' },
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

    const coreCfg = validateEfiCoreConfig();
    if (!coreCfg.ok) {
      console.error('EFI core config invalid:', coreCfg.issues);
      return NextResponse.json(
        { success: false, message: 'Payment system unavailable.' },
        { status: 503 }
      );
    }

    // First try the transparent card flow; on auth issues, fallback to hosted link
    let created: any;
    try {
      created = await efiService.createTransparentCardCharge({
        description,
        amountCents,
        customer: {
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          phone_number: user.phone_number,
        },
        paymentToken: paymentToken,
        installments,
        billingAddress,
        notificationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/efi`,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.mensagem || err?.message || '';
      if (
        status === 401 ||
        /unauthorized/i.test(String(msg)) ||
        /invalid[_ ]token/i.test(String(msg))
      ) {
        // Hosted checkout fallback
        const hosted = await efiService.createHostedCardCharge({
          description,
          amountCents,
          customer: { name: user.name, email: user.email, cpf: user.cpf },
          notificationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/efi`,
        });
        created = hosted;
      } else {
        throw err;
      }
    }

    const chargeId: string = String(created.charge_id);
    await (prisma as any).payment.create({
      data: {
        userId: user.id,
        provider: 'efi',
        method: 'card',
        externalId: chargeId,
        status: 'PENDING',
        amount: amountCents,
        currency: 'BRL',
        paymentUrl: (created?.payment_url || created?.link) ?? null,
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
      status: created.status,
      paymentUrl: created?.payment_url || created?.link || undefined,
    });
  } catch (error) {
    console.error('Error paying with card:', error);
    const message =
      (error as any)?.message ||
      (error as any)?.response?.data?.mensagem ||
      'Internal error creating card payment.';
    const status = /authentication failed|invalid token/i.test(message)
      ? 503
      : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
