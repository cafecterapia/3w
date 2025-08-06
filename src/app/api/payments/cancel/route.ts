import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { txid } = await request.json();

    if (!txid) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required.' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    // Check if the txid matches the user's subscription ID
    if (user.efiSubscriptionId !== txid) {
      return NextResponse.json(
        { success: false, message: 'Payment not found for this user.' },
        { status: 404 }
      );
    }

    // Only cancel if the subscription is still pending
    if (user.subscriptionStatus === 'PENDING') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          efiSubscriptionId: null,
          subscriptionStatus: null,
          currentPeriodEnd: null,
          paymentCreatedAt: null,
          qrCodeImage: null,
          qrCodeText: null,
          efiLocationId: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment cancelled successfully.',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Payment cannot be cancelled.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
