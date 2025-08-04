import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, paymentMethodId } = body;

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        efiSubscriptionId: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'create_portal_session':
        // For now, redirect to the billing manage page
        return NextResponse.json({
          success: true,
          portalUrl: '/billing/manage',
          message: 'Payment management portal accessed successfully',
        });

      case 'update_payment_method':
        // TODO: Implement EFI payment method update
        console.log('Updating payment method for user:', user.id);
        return NextResponse.json({
          success: true,
          message: 'Payment method update initiated',
        });

      case 'cancel_subscription':
        // TODO: Implement subscription cancellation via EFI
        console.log('Cancelling subscription for user:', user.id);
        
        // Update user status in database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'CANCELED',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Subscription cancelled successfully',
        });

      default:
        // Default action - create portal session
        return NextResponse.json({
          success: true,
          portalUrl: '/billing/manage',
          message: 'Payment management portal created successfully',
        });
    }
  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}
