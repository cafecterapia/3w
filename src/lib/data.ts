// src/lib/data.ts

import prisma from './prisma';
import { calculatePricing } from './pricing-constants';

// Types for our dashboard data
interface DashboardSubscription {
  id: string;
  type: 'mensal' | 'avulsa';
  status: string;
  creditsRemaining: number;
  totalCredits: number;
  nextBillingDate: Date | null;
  nextAmount: number | null;
}

interface DashboardInvoice {
  id: string;
  invoiceId: string;
  date: Date;
  amount: number;
  status: string;
}

interface DashboardNotice {
  id: string;
  text: string;
  createdAt: Date;
}

/**
 * Fetches all necessary data for the user dashboard.
 *
 * @param userId - The ID of the authenticated user.
 * @returns An object containing the user's subscription, recent invoices, and latest notices.
 */
export async function getDashboardData(userId: string) {
  // Fetch user data from the database including the new class tracking fields
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      efiSubscriptionId: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      paymentCreatedAt: true,
      classCount: true,
      schedulingOption: true,
      classesUsed: true,
    },
  });

  // For now, create mock data for invoices and notices
  // You can replace this with actual database queries when you have these models
  const invoices: DashboardInvoice[] = [];
  const notices: DashboardNotice[] = [];

  // Mock some notices
  notices.push(
    {
      id: '1',
      text: 'Nova funcionalidade disponível no portal do aluno.',
      createdAt: new Date(2025, 7, 1), // August 1, 2025
    },
    {
      id: '2',
      text: 'Manutenção programada para este fim de semana.',
      createdAt: new Date(2025, 6, 28), // July 28, 2025
    }
  );

  // Create subscription data based on real user payment data
  const subscription: DashboardSubscription | null = user?.efiSubscriptionId
    ? await createSubscriptionFromUserData(user)
    : null;

  // Helper function to create subscription object from real user data
  async function createSubscriptionFromUserData(userData: any): Promise<DashboardSubscription> {
    const normalizedStatus = normalizeStatus(userData.subscriptionStatus);
    
    // Use the real data stored in the database
    const classCount = userData.classCount || 0;
    const classesUsed = userData.classesUsed || 0;
    const schedulingOption = userData.schedulingOption || 'on-demand';
    
    // Determine subscription type based on actual purchase data
    const subscriptionType: 'mensal' | 'avulsa' = schedulingOption === 'recurring' ? 'mensal' : 'avulsa';
    
    // Calculate remaining credits using real data
    const creditsRemaining = Math.max(0, classCount - classesUsed);
    
    // Calculate next amount based on actual subscription type and class count
    const nextAmount = subscriptionType === 'mensal' && classCount > 0 
      ? calculatePricing(classCount, 'recurring').finalPrice 
      : null;
    
    return {
      id: userData.efiSubscriptionId,
      type: subscriptionType,
      status: normalizedStatus,
      creditsRemaining,
      totalCredits: classCount,
      nextBillingDate: subscriptionType === 'mensal' ? userData.currentPeriodEnd : null,
      nextAmount,
    };
  }

  // Helper function to normalize status
  function normalizeStatus(status: string | null): string {
    if (!status) return 'inactive';
    
    // Convert various possible status values to consistent format
    const normalizedStatus = status.toUpperCase();
    
    // Map EFI payment statuses to our internal statuses
    switch (normalizedStatus) {
      case 'PAID':
      case 'CONFIRMED':
      case 'ACTIVE':
        return 'active';
      case 'PENDING':
      case 'WAITING':
        return 'pending';
      case 'EXPIRED':
      case 'PAST_DUE':
        return 'past_due';
      case 'CANCELED':
      case 'CANCELLED':
        return 'canceled';
      default:
        return 'inactive';
    }
  }

  // Only show subscription as active if payment is actually confirmed
  // Don't show pending payments as active subscriptions
  if (
    subscription &&
    (subscription.status === 'pending' || subscription.status === 'past_due')
  ) {
    return {
      subscription: null, // Don't show subscription if payment isn't confirmed
      invoices: [],
      notices,
    };
  }

  // Mock some recent invoices if user has subscription
  if (user?.efiSubscriptionId && subscription && user.classCount) {
    const today = new Date();
    const schedulingOption = user.schedulingOption || 'on-demand';
    const actualAmount = calculatePricing(user.classCount, schedulingOption as 'recurring' | 'on-demand').finalPrice;
    
    invoices.push(
      {
        id: '1',
        invoiceId: 'INV-2025-001',
        date: user.paymentCreatedAt || new Date(today.getFullYear(), today.getMonth() - 1, 15),
        amount: actualAmount,
        status: 'paid',
      }
    );
  }

  return {
    subscription,
    invoices,
    notices,
  };
}
