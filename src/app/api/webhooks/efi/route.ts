import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { efiService } from '@/lib/efi';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
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
      case 'payment.succeeded':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'ACTIVE',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        });

        // Send push notification for successful payment
        try {
          await fetch(
            `${process.env.NEXTAUTH_URL}/api/push/send-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.INTERNAL_API_KEY || 'internal'}`,
              },
              body: JSON.stringify({
                userId: user.id,
                title: 'Payment Successful!',
                message:
                  'Your subscription payment has been processed successfully.',
                data: { type: 'payment_success', chargeId },
              }),
            }
          );
        } catch (pushError) {
          console.error('Failed to send push notification:', pushError);
          // Don't fail the webhook if push notification fails
        }

        console.log('Payment succeeded for user:', user.id);
        break;

      case 'charge:unpaid':
      case 'payment.failed':
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'PAST_DUE',
          },
        });

        // Send push notification for failed payment
        try {
          await fetch(
            `${process.env.NEXTAUTH_URL}/api/push/send-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.INTERNAL_API_KEY || 'internal'}`,
              },
              body: JSON.stringify({
                userId: user.id,
                title: 'Payment Failed',
                message:
                  'There was an issue with your payment. Please update your payment method.',
                data: { type: 'payment_failed', chargeId },
              }),
            }
          );
        } catch (pushError) {
          console.error('Failed to send push notification:', pushError);
        }

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

        // Send push notification for cancelled subscription
        try {
          await fetch(
            `${process.env.NEXTAUTH_URL}/api/push/send-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.INTERNAL_API_KEY || 'internal'}`,
              },
              body: JSON.stringify({
                userId: user.id,
                title: 'Subscription Cancelled',
                message:
                  "Your subscription has been cancelled. We're sorry to see you go!",
                data: { type: 'subscription_cancelled', chargeId },
              }),
            }
          );
        } catch (pushError) {
          console.error('Failed to send push notification:', pushError);
        }

        console.log('Subscription cancelled for user:', user.id);
        break;

      default:
        console.log('Unhandled webhook event type:', event.event);
    }

    // Return 200 OK to acknowledge successful receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing EFI webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
