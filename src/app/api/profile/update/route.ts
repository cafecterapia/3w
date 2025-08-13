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

    const { name, cpf, phone_number } = await request.json();

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

    // Normalize phone
    let normalizedPhone: string | undefined;
    if (typeof phone_number === 'string') {
      const digits = phone_number.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) {
        return NextResponse.json(
          { success: false, message: 'Phone number must have 10-11 digits.' },
          { status: 400 }
        );
      }
      normalizedPhone = digits;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        cpf: cpfNumbers,
        ...(normalizedPhone ? { phone_number: normalizedPhone } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: (updatedUser as any).id,
        name: (updatedUser as any).name,
        cpf: (updatedUser as any).cpf,
        phone_number: (updatedUser as any).phone_number ?? null,
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
