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

    const { name, cpf } = await request.json();

    if (!name || !cpf) {
      return NextResponse.json(
        { success: false, message: 'Name and CPF are required.' },
        { status: 400 }
      );
    }

    // Validate CPF format (simple check)
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      return NextResponse.json(
        { success: false, message: 'CPF must have 11 digits.' },
        { status: 400 }
      );
    }

    // Check if CPF is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        cpf: cpfNumbers,
        id: { not: session.user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'This CPF is already registered to another account.',
        },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        cpf: cpfNumbers,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        cpf: updatedUser.cpf,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
