// src/lib/data.ts

import prisma from './prisma';

// Types for our dashboard data
interface DashboardSubscription {
  id: string;
  plan: string;
  status: string;
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
  // Fetch user data from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      efiSubscriptionId: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });

  // Create subscription data based on user fields
  const subscription: DashboardSubscription | null = user?.efiSubscriptionId
    ? {
        id: user.efiSubscriptionId,
        plan: 'Plano Básico', // You can expand this based on your subscription logic
        status: user.subscriptionStatus || 'inactive',
        nextBillingDate: user.currentPeriodEnd,
        nextAmount: 49.9, // You can make this dynamic based on plan
      }
    : null;

  // For now, create mock data for invoices and notices
  // You can replace this with actual database queries when you have these models
  const invoices: DashboardInvoice[] = [];
  const notices: DashboardNotice[] = [];

  // Mock some recent invoices if user has subscription
  if (user?.efiSubscriptionId) {
    const today = new Date();
    invoices.push(
      {
        id: '1',
        invoiceId: 'INV-2025-001',
        date: new Date(today.getFullYear(), today.getMonth() - 1, 15),
        amount: 49.9,
        status: 'paid',
      },
      {
        id: '2',
        invoiceId: 'INV-2025-002',
        date: new Date(today.getFullYear(), today.getMonth() - 2, 15),
        amount: 49.9,
        status: 'paid',
      }
    );
  }

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

  return {
    subscription,
    invoices,
    notices,
  };
}
