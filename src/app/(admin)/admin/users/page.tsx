import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import UsersClient from './users-client';

export default async function UsersPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscriptionStatus: true,
      efiSubscriptionId: true,
      currentPeriodEnd: true,
    },
    orderBy: {
      email: 'asc',
    },
  });

  // Filter out users without email (shouldn't happen but just in case)
  const validUsers = users.filter(user => user.email !== null) as Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    subscriptionStatus: string | null;
    efiSubscriptionId?: string | null;
    currentPeriodEnd?: Date | null;
  }>;

  return <UsersClient users={validUsers} />;
}
