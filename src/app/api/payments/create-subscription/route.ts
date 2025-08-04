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

    // Fetch complete user details from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For now, we'll use a default CPF until user profile is completed
    // In production, you should require users to complete their profile
    const defaultCpf = '00000000000';

    // Validate required user information for Efí
    if (!user.name || !user.email) {
      return NextResponse.json(
        { 
          error: 'Missing required user information. Please complete your profile with name and email.' 
        },
        { status: 400 }
      );
    }

    // Create subscription via EFI with real user data
    const subscription = await efiService.createSubscription({
      customerId: session.user.id,
      planId,
      amount: amount * 100, // Convert to cents
      description,
      customerName: user.name,
      customerEmail: user.email,
      customerCpf: defaultCpf, // TODO: Replace with user.cpf when profile system is implemented
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
