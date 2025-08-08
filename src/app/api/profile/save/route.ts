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

    const { name, email } = await request.json();

    const data: any = {};
    if (typeof name === 'string') data.name = name.trim();
    if (typeof email === 'string') data.email = email.trim();

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({
      success: true,
      user: { id: updated.id, name: updated.name, email: updated.email },
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
