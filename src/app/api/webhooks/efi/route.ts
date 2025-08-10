import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
// import { efiService } from '@/lib/efi'; // Temporarily disabled for testing
import prisma from '@/lib/prisma';
import { calculatePricing } from '@/lib/pricing-constants';

export async function POST(request: NextRequest) {
  try {
    // Temporarily disabled for testing - EFI webhook processing
    console.log(
      'EFI webhook endpoint called but temporarily disabled for testing'
    );

    return NextResponse.json({
      success: true,
      message: 'EFI webhook processing temporarily disabled',
    });

    /* Temporarily commented out for testing
    const signature = request.headers.get('efi-signature') || '';
    const body = await request.text();

    // Verify webhook signature
    if (!efiService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook event
    const event = JSON.parse(body);
    console.log('Received EFI webhook event:', event);

    // Extract charge/subscription ID from the event
    const chargeId = event.data?.charge_id || event.charge_id;

    if (!chargeId) {
      console.error('No charge ID found in webhook event');
      return NextResponse.json(
        { error: 'No charge ID found' },
        { status: 400 }
      );
    }

    // Find user by EFI subscription ID
    const user = await prisma.user.findUnique({
      where: { efiSubscriptionId: chargeId.toString() },
    });

    if (!user) {
      console.error('User not found for charge ID:', chargeId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Process different event types
    switch (event.event) {
      case 'charge:paid':
      case 'payment.succeeded': {
        const newPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'ACTIVE',
            currentPeriodEnd: newPeriodEnd,
          },
        });

        // Create invoice record
        try {
          const amountRaw = event.data?.total || event.data?.value; // cents if provided
          let amountCents: number | undefined =
            typeof amountRaw === 'number' ? Math.round(amountRaw) : undefined;

          if (!amountCents) {
            const classCount = user.classCount || 0;
            const scheduling =
              (user.schedulingOption as 'recurring' | 'on-demand') ||
              'on-demand';
            const calc =
              classCount > 0 ? calculatePricing(classCount, scheduling) : null;
            amountCents = calc ? Math.round(calc.finalPrice * 100) : 0;
          }

          await (prisma as any).invoice.create({
            data: {
              userId: user.id,
              externalId: chargeId.toString(),
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
          console.error('Failed to create invoice record:', invErr);
        }

        // Optional: push notification omitted for brevity
        console.log('Payment succeeded for user:', user.id);
        break;
      }

      case 'charge:unpaid':
      case 'payment.failed':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'PAST_DUE',
          },
        });
        console.log('Payment failed for user:', user.id);
        break;

      case 'charge:canceled':
      case 'subscription.cancelled':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'CANCELED',
          },
        });
        console.log('Subscription cancelled for user:', user.id);
        break;

      default:
        console.log('Unhandled webhook event type:', event.event);
    }

    return NextResponse.json({ received: true });
    */ // End of temporarily commented out code
  } catch (error) {
    console.error('Error processing EFI webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
