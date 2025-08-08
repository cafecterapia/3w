// app/billing/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBillingOverview, getInvoices } from '@/lib/billing';

export const metadata: Metadata = {
  title: 'Faturamento — Portal do Aluno',
  description: 'Gerencie sua assinatura, faturas e forma de pagamento.',
};

function SuccessMessage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  if (searchParams.success === 'true') {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-green-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Pagamento confirmado!
            </h3>
            <p className="text-sm text-green-600 mt-1">
              Sua assinatura foi ativada com sucesso. Bem-vindo!
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

interface BillingPageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { success } = await searchParams;

  const overview = await getBillingOverview(session.user.id);
  const history = await getInvoices(session.user.id);

  const plan = overview?.plan ?? {
    name: 'Sem plano ativo',
    description: 'Escolha um plano para começar',
    price: '-',
    cadence: '-',
    status: 'Inativa',
    renewal: '-',
  };

  // Decide primary actions
  const isPendingOrInactive =
    overview?.status === 'pending' || overview?.status === 'inactive';
  const hasTxid = Boolean(overview?.txid);
  const continuePaymentHref = hasTxid
    ? `/billing/pay?txid=${overview?.txid}`
    : '/billing/plan';

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Success Message */}
        <Suspense fallback={null}>
          <SuccessMessage searchParams={{ success }} />
        </Suspense>

        {/* Header */}
        <header className="mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Faturamento e Assinatura
          </h1>
          <p className="mt-2 text-accent">
            Veja detalhes do plano, próximas cobranças e histórico de faturas.
          </p>
        </header>

        {/* Layout grid */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Plano atual */}
          <section className="lg:col-span-2 rounded-lg border border-border bg-secondary/50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Plano atual
                </h2>
                <p className="mt-1 text-sm text-accent">{plan.description}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs">
                {plan.status}
              </span>
            </div>

            <div className="mt-6 rounded-md border border-border bg-secondary p-4">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-base font-medium">{plan.name}</p>
                  <p className="mt-1 text-sm text-accent">
                    Renova em {plan.renewal}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{plan.price}</p>
                  <p className="text-sm text-accent">{plan.cadence}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {isPendingOrInactive ? (
                <ActionButton href={continuePaymentHref}>
                  {hasTxid ? 'Continuar pagamento' : 'Iniciar pagamento'}
                </ActionButton>
              ) : (
                <ActionButton href="/billing/plan">
                  Atualizar plano
                </ActionButton>
              )}
              <ActionButton href="/billing/invoices" variant="secondary">
                Ver faturas
              </ActionButton>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-tight">
                Formas de pagamento
              </h3>
              <p className="mt-2 text-sm text-accent">
                Atualize seu cartão ou adicione métodos alternativos com
                segurança.
              </p>
              <div className="mt-4">
                <ActionButton href="/billing/manage" variant="ghost">
                  Gerenciar métodos de pagamento
                </ActionButton>
              </div>
            </div>
          </section>

          {/* Resumo rápido */}
          <aside className="rounded-lg border border-border bg-secondary/50 p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">Resumo</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-accent">Status</dt>
                <dd>
                  {overview?.status === 'active'
                    ? 'Ativa'
                    : overview?.status === 'pending'
                      ? 'Pendente'
                      : 'Inativa'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-accent">Próxima cobrança</dt>
                <dd>
                  {overview?.nextChargeAt
                    ? new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).format(new Date(overview.nextChargeAt))
                    : '-'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-accent">Valor</dt>
                <dd>
                  {overview?.amountCents
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(overview.amountCents / 100)
                    : '-'}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <ActionButton href="/support#pagamentos" variant="ghost">
                Precisa de ajuda?
              </ActionButton>
            </div>
          </aside>
        </div>

        {/* Histórico de faturas */}
        <section className="mt-10 sm:mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Histórico de faturas
            </h2>
            <Link
              href="/billing/invoices"
              className="text-sm text-accent hover:underline underline-offset-4"
            >
              Ver todas
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-accent">
                    Mês
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-accent">
                    Plano
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-accent">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-accent">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3 capitalize">{item.month}</td>
                    <td className="px-4 py-3">{item.plan}</td>
                    <td className="px-4 py-3">{item.amount}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/billing/invoices/${item.id}`}
                        className="text-accent hover:underline underline-offset-4"
                      >
                        Ver fatura
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function ActionButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const classes = {
    primary:
      'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90',
    secondary:
      'inline-flex items-center justify-center rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80',
    ghost:
      'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-secondary',
  }[variant];

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
