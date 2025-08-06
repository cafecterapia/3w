import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user settings from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        // Add other billing-related fields as they're added to the schema
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mock additional billing information
    const billingInfo = {
      name: user.name || '',
      email: user.email || '',
      cpf: user.cpf || '000.000.000-00',
      phone: '', // TODO: Add phone field to user schema
      address: {
        street: '',
        number: '',
        complement: '',
        zipCode: '',
        city: '',
        state: '',
      },
    };

    const paymentSettings = {
      emailNotifications: true,
      autoRenewal: true,
      emailReceipts: false,
    };

    return NextResponse.json({
      success: true,
      billingInfo,
      paymentSettings,
    });
  } catch (error) {
    console.error('Error fetching billing settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { billingInfo, paymentSettings } = body;

    // Update user billing information
    if (billingInfo) {
      const updateData: any = {};

      if (billingInfo.name) updateData.name = billingInfo.name;
      if (billingInfo.email) updateData.email = billingInfo.email;
      if (billingInfo.cpf) updateData.cpf = billingInfo.cpf;

      // TODO: Add phone and address fields to user schema
      // if (billingInfo.phone) updateData.phone = billingInfo.phone;

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: updateData,
        });
      }
    }

    // TODO: Store payment settings in database
    // For now, we'll just acknowledge the update
    if (paymentSettings) {
      console.log(
        'Updating payment settings for user:',
        session.user.id,
        paymentSettings
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Billing settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating billing settings:', error);
    return NextResponse.json(
      { error: 'Failed to update billing settings' },
      { status: 500 }
    );
  }
}
