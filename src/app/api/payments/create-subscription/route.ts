import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { efiService } from '@/lib/efi';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify user session
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, amount, description } = body;

    if (!planId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, amount' },
        { status: 400 }
      );
    }

    // Create subscription via EFI
    const subscription = await efiService.createSubscription({
      customerId: session.user.id,
      planId,
      amount: amount * 100, // Convert to cents
      description,
    });

    // Update user record with EFI subscription ID
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        efiSubscriptionId: subscription.id,
        subscriptionStatus: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      paymentUrl: subscription.payment_url,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
