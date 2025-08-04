import prisma from '@/lib/prisma';
import { SubscribersClient } from './subscribers-client';

async function getSubscribers() {
  const subscribers = await prisma.user.findMany({
    where: { subscriptionStatus: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      efiSubscriptionId: true,
    },
    orderBy: { email: 'asc' },
  });

  return subscribers;
}

export default async function SubscribersPage() {
  const subscribers = await getSubscribers();

  return <SubscribersClient subscribers={subscribers} />;
}
