import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { pushSubscription: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to clear push subscription' },
      { status: 500 }
    );
  }
}
