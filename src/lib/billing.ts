import prisma from './prisma';
import { calculatePricing } from './pricing-constants';

export type BillingStatus =
  | 'active'
  | 'pending'
  | 'past_due'
  | 'cancelled'
  | 'inactive'
  | 'paid'
  | 'expired';

export function normalizeStatus(status?: string | null): BillingStatus {
  const s = (status || '').toUpperCase();
  switch (s) {
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
      return 'cancelled';
    default:
      return 'inactive';
  }
}

export function formatBRL(amountCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountCents / 100);
}

export async function getBillingOverview(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      efiSubscriptionId: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      classCount: true,
      schedulingOption: true,
      paymentCreatedAt: true,
    },
  });

  if (!user) return null;

  const status = normalizeStatus(user.subscriptionStatus);

  const classCount = user.classCount || 0;
  const scheduling =
    (user.schedulingOption as 'recurring' | 'on-demand') || 'on-demand';
  const price =
    classCount > 0 ? calculatePricing(classCount, scheduling).finalPrice : 0;
  const amountCents = Math.round(price * 100);

  const plan =
    classCount > 0
      ? {
          name:
            scheduling === 'recurring' ? 'Plano Recorrente' : 'Pacote Avulso',
          description: `${classCount} aulas${scheduling === 'recurring' ? ' por mês' : ''}`,
          price: formatBRL(amountCents),
          cadence: scheduling === 'recurring' ? 'por mês' : 'avulso',
          status:
            status === 'active'
              ? 'Ativa'
              : status === 'pending'
                ? 'Pendente'
                : 'Inativa',
          renewal: user.currentPeriodEnd
            ? new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }).format(new Date(user.currentPeriodEnd))
            : '-',
        }
      : null;

  return {
    plan,
    status,
    nextChargeAt: user.currentPeriodEnd || null,
    amountCents,
    txid: user.efiSubscriptionId || null,
  };
}

export type InvoiceListItem = {
  id: string;
  month: string;
  plan: string;
  amount: string;
  status: string;
};

export async function getInvoices(userId: string): Promise<InvoiceListItem[]> {
  const invoices = await (prisma as any).invoice?.findMany?.({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      id: true,
      description: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  });

  if (!invoices) return [];

  return (invoices as any[]).map((inv: any) => ({
    id: inv.id,
    month: new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(inv.createdAt),
    plan: inv.description || 'Assinatura',
    amount: formatBRL(inv.amount),
    status:
      inv.status === 'paid'
        ? 'Pago'
        : inv.status === 'pending'
          ? 'Pendente'
          : inv.status,
  }));
}

export async function getInvoiceById(userId: string, id: string) {
  const inv = await (prisma as any).invoice?.findFirst?.({
    where: { id, userId },
  });
  if (!inv) return null;
  return {
    id: inv.id,
    externalId: inv.externalId,
    description: inv.description,
    status: inv.status,
    amount: formatBRL(inv.amount),
    currency: inv.currency,
    periodStart: inv.periodStart,
    periodEnd: inv.periodEnd,
    createdAt: inv.createdAt,
  };
}
