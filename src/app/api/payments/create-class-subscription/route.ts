import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { PlanSelection } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // If user is not authenticated, return success with redirect info
    // The client will handle redirecting to registration/login
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        requiresAuth: true,
        message: 'Authentication required to complete purchase'
      });
    }

    const planSelection: PlanSelection = await request.json();
    
    // Validate the plan selection
    if (!planSelection.classCount || planSelection.classCount < 1 || planSelection.classCount > 8) {
      return NextResponse.json(
        { success: false, error: 'Invalid class count' },
        { status: 400 }
      );
    }

    if (!['recurring', 'on-demand'].includes(planSelection.schedulingOption)) {
      return NextResponse.json(
        { success: false, error: 'Invalid scheduling option' },
        { status: 400 }
      );
    }

    // Recalculate pricing server-side to ensure integrity
    const BASE_PRICE_PER_CLASS = 45.00;
    const DISCOUNT_THRESHOLD = 4;
    const DISCOUNT_PERCENTAGE = 10;
    
    const baseTotal = planSelection.classCount * BASE_PRICE_PER_CLASS;
    const discountApplied = planSelection.classCount >= DISCOUNT_THRESHOLD ? DISCOUNT_PERCENTAGE : 0;
    const schedulingDiscount = planSelection.schedulingOption === 'recurring' ? 5 : 0;
    const totalDiscount = discountApplied + schedulingDiscount;
    const expectedPrice = baseTotal * (1 - totalDiscount / 100);

    // Verify the price matches what was calculated client-side (with small tolerance for floating point)
    if (Math.abs(expectedPrice - planSelection.totalPrice) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Price calculation mismatch' },
        { status: 400 }
      );
    }

    // TODO: Integrate with payment provider (EFI)
    // For now, we'll create a mock payment URL
    // In a real implementation, you would:
    // 1. Create a charge/subscription with your payment provider
    // 2. Store the pending subscription in your database
    // 3. Return the payment URL from the provider

    const mockPaymentUrl = `https://payment-provider.com/pay?amount=${expectedPrice}&userId=${session.user.id}&classes=${planSelection.classCount}&scheduling=${planSelection.schedulingOption}`;

    // In production, you would also:
    // 1. Create a record in your database for the pending subscription
    // 2. Set up webhooks to handle payment completion
    // 3. Update user's class balance when payment is confirmed

    return NextResponse.json({
      success: true,
      paymentUrl: mockPaymentUrl,
      planDetails: {
        classCount: planSelection.classCount,
        schedulingOption: planSelection.schedulingOption,
        totalPrice: expectedPrice,
        discountApplied: totalDiscount
      }
    });

  } catch (error) {
    console.error('Error creating class subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
