import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AnalyticsClient from './analytics-client';

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch analytics data
  // Passing an explicit empty args object avoids overload ambiguity introduced by Accelerate extension
  // Accelerate adds overloads; pass explicit args object to avoid union call ambiguity
  const totalUsers = await prisma.user.count();
  const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } });
  const regularUsers = totalUsers - adminUsers;

  const activeSubscriptions = await prisma.user.count({
    where: { subscriptionStatus: 'active' },
  });

  const canceledSubscriptions = await prisma.user.count({
    where: { subscriptionStatus: 'canceled' },
  });

  const usersWithSubscriptions = await prisma.user.count({
    where: {
      OR: [
        { subscriptionStatus: 'active' },
        { subscriptionStatus: 'canceled' },
        { efiSubscriptionId: { not: null } },
      ],
    },
  });

  const analyticsData = {
    totalUsers,
    adminUsers,
    regularUsers,
    activeSubscriptions,
    canceledSubscriptions,
    usersWithSubscriptions,
  };

  return <AnalyticsClient data={analyticsData} />;
}
