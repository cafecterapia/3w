import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { efiService } from '@/lib/efi';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user payment methods from database
    // For now, return mock data as EFI doesn't store payment methods directly
    const mockPaymentMethods = [
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
        isActive: true,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'pm_2',
        type: 'card',
        brand: 'mastercard',
        last4: '1234',
        expiryMonth: 8,
        expiryYear: 2025,
        isDefault: false,
        isActive: false,
        createdAt: new Date('2023-08-10'),
      },
    ];

    return NextResponse.json({
      success: true,
      paymentMethods: mockPaymentMethods,
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, paymentMethodId, paymentMethodData } = body;

    switch (action) {
      case 'add_payment_method':
        // TODO: Integrate with EFI to add payment method
        console.log('Adding payment method for user:', session.user.id);

        return NextResponse.json({
          success: true,
          paymentMethod: {
            id: `pm_${Date.now()}`,
            ...paymentMethodData,
            createdAt: new Date(),
          },
          message: 'Payment method added successfully',
        });

      case 'update_payment_method':
        // TODO: Integrate with EFI to update payment method
        console.log('Updating payment method:', paymentMethodId);

        return NextResponse.json({
          success: true,
          message: 'Payment method updated successfully',
        });

      case 'remove_payment_method':
        // TODO: Integrate with EFI to remove payment method
        console.log('Removing payment method:', paymentMethodId);

        return NextResponse.json({
          success: true,
          message: 'Payment method removed successfully',
        });

      case 'set_default_payment_method':
        // TODO: Integrate with EFI to set default payment method
        console.log('Setting default payment method:', paymentMethodId);

        return NextResponse.json({
          success: true,
          message: 'Default payment method updated successfully',
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing payment method:', error);
    return NextResponse.json(
      { error: 'Failed to manage payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate with EFI to delete payment method
    console.log('Deleting payment method:', paymentMethodId);

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
