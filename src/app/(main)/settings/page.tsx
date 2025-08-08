// app/(main)/settings/page.tsx
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import SettingsClient from './settings-client';

export const metadata: Metadata = {
  title: 'Configurações — Portal do Aluno',
  description: 'Gerencie sua conta, preferências e assinatura.',
};

export default async function SettingsPage() {
  const session = await auth();

  let user: {
    id: string;
    name: string | null;
    email: string | null;
    cpf: string | null;
    subscriptionStatus: string | null;
  } | null = null;

  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        subscriptionStatus: true,
      },
    });
  }

  return <SettingsClient user={user} />;
}
