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

    // Validate core EFI configuration (client credentials, environment)
    const coreCfg = validateEfiCoreConfig();
    if (!coreCfg.ok) {
      console.error('EFI core config invalid:', coreCfg.issues);
      return NextResponse.json(
        {
          success: false,
          message:
            'Payment system not configured. Please contact support or try again later.',
        },
        { status: 503 }
      );
    }

    const created = await efiService
      .createHostedCardCharge({
        description,
        amountCents,
        customer: { name: user.name, email: user.email, cpf: user.cpf },
        notificationUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/efi`,
      })
      .catch((err: any) => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.mensagem || err?.message;
        if (status === 401 || /invalid[_ ]token/i.test(String(msg))) {
          return Promise.reject(
            new Error('Payment authentication failed (EFI invalid token).')
          );
        }
        return Promise.reject(err);
      });

    const chargeId: string = String(created.charge_id);
    const paymentUrl: string | undefined = created.payment_url || created.link;
    const status: string = created.status || 'new';

    await (prisma as any).payment.create({
      data: {
        userId: user.id,
        provider: 'efi',
        method: 'card',
        externalId: chargeId,
        status: 'PENDING',
        amount: amountCents,
        currency: 'BRL',
        paymentUrl,
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

    return NextResponse.json({ success: true, chargeId, paymentUrl, status });
  } catch (error) {
    console.error('Error creating card charge:', error);
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
