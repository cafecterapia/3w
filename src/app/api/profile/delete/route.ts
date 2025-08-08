import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete: clear sensitive fields and mark as deleted
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: null,
        email: null,
        password: null,
        pushSubscription: null,
        efiSubscriptionId: null,
        subscriptionStatus: 'DELETED',
        cpf: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
