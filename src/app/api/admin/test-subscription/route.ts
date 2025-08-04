import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { efiService } from '@/lib/efi';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount = 2990 } = await request.json(); // Default R$ 29.90

    // Get admin user details for test
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true
      }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Create test subscription
    const subscription = await efiService.createSubscription({
      customerId: adminUser.id,
      planId: 'test-plan',
      amount: amount,
      description: 'Test Subscription - Admin Panel',
      customerName: adminUser.name || 'Admin User',
      customerEmail: adminUser.email || 'admin@example.com',
      customerCpf: adminUser.cpf || '11144477735', // Test CPF for sandbox
    });

    // Save subscription to database
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        efiSubscriptionId: subscription.id,
        subscriptionStatus: 'PENDING'
      }
    });

    return NextResponse.json({ 
      success: true, 
      subscription,
      message: 'Test subscription created successfully'
    });
  } catch (error) {
    console.error('Test subscription creation failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create test subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
