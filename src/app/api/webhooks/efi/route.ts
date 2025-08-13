import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculatePricing } from '@/lib/pricing-constants';
import { efiService } from '@/lib/efi';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('efi-signature') || '';
    const body = await request.text();

    if (!efiService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const chargeIdRaw =
      event.data?.charge_id ?? event.charge_id ?? event?.data?.id;
    const chargeId = chargeIdRaw ? String(chargeIdRaw) : undefined;

    if (!chargeId) {
      return NextResponse.json({ error: 'No charge ID' }, { status: 400 });
    }

    // Link to Payment first, else fallback to User legacy
    const payment = await (prisma as any).payment.findFirst({
      where: { externalId: chargeId },
    });
    const user = payment
      ? await prisma.user.findUnique({ where: { id: payment.userId } })
      : await prisma.user.findUnique({
          where: { efiSubscriptionId: chargeId },
        });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const evt = String(event.event || '').toLowerCase();

    if (evt.includes('paid') || evt.includes('payment.succeeded')) {
      const newPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'ACTIVE', currentPeriodEnd: newPeriodEnd },
      });
      if (payment) {
        await (prisma as any).payment.update({
          where: { id: payment.id },
          data: { status: 'PAID' },
        });
      }

      try {
        const amountRaw = event.data?.total || event.data?.value;
        let amountCents: number | undefined =
          typeof amountRaw === 'number' ? Math.round(amountRaw) : undefined;
        if (!amountCents) {
          const classCount = user.classCount || 0;
          const scheduling =
            (user.schedulingOption as 'recurring' | 'on-demand') || 'on-demand';
          const calc =
            classCount > 0 ? calculatePricing(classCount, scheduling) : null;
          amountCents = calc ? Math.round(calc.finalPrice * 100) : 0;
        }
        await (prisma as any).invoice.create({
          data: {
            userId: user.id,
            externalId: chargeId,
            description:
              user.schedulingOption === 'recurring'
                ? `Plano Recorrente - ${user.classCount || 0} aulas`
                : `Pacote Avulso - ${user.classCount || 0} aulas`,
            status: 'paid',
            amount: amountCents,
            currency: 'BRL',
            periodStart: new Date(),
            periodEnd: newPeriodEnd,
          },
        });
      } catch (invErr) {
        console.error('Invoice create failed:', invErr);
      }
    } else if (evt.includes('unpaid') || evt.includes('payment.failed')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'PAST_DUE' },
      });
      if (payment) {
        await (prisma as any).payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
      }
    } else if (evt.includes('canceled') || evt.includes('cancelled')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'CANCELED' },
      });
      if (payment) {
        await (prisma as any).payment.update({
          where: { id: payment.id },
          data: { status: 'CANCELLED' },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('EFI webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
