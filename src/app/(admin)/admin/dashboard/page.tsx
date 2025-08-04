import { auth } from '@/lib/auth';
import { AdminDashboardClient } from './dashboard-client';
import prisma from '@/lib/prisma';

async function getAdminStats() {
  try {
    const [totalUsers, totalSubscribers, activeSubscriptions] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { subscriptionStatus: { not: null } },
        }),
        prisma.user.count({
          where: { subscriptionStatus: 'active' },
        }),
      ]);

    return { totalUsers, totalSubscribers, activeSubscriptions };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return { totalUsers: 0, totalSubscribers: 0, activeSubscriptions: 0 };
  }
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const stats = await getAdminStats();

  const nameOrEmail = session?.user?.name || session?.user?.email || 'Admin';

  return <AdminDashboardClient stats={stats} nameOrEmail={nameOrEmail} />;
}
