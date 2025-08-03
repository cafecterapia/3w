import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify user session
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid push subscription' },
        { status: 400 }
      );
    }

    // Store push subscription in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: JSON.stringify(subscription),
      },
    });

    console.log('Push subscription saved for user:', session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully',
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}
