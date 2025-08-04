// app/billing/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Faturamento — Portal do Aluno',
  description: 'Gerencie sua assinatura, faturas e forma de pagamento.',
};

export default function BillingPage() {
  // Replace with real data from your billing provider
  const plan = {
    name: 'Plano Premium',
    description: '10.000 requisições/mês',
    price: 'R$ 29,99',
    cadence: 'por mês',
    status: 'Ativa',
    renewal: '15 Mar 2025',
  };

  const history = [
    { id: 'inv_003', month: 'Fevereiro 2025', plan: 'Premium', amount: 'R$ 29,99', status: 'Pago' },
    { id: 'inv_002', month: 'Janeiro 2025', plan: 'Premium', amount: 'R$ 29,99', status: 'Pago' },
    { id: 'inv_001', month: 'Dezembro 2024', plan: 'Premium', amount: 'R$ 29,99', status: 'Pago' },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
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
                <h2 className="text-lg font-semibold tracking-tight">Plano atual</h2>
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
              <ActionButton href="/billing/manage">Gerenciar assinatura</ActionButton>
              <ActionButton href="/billing/invoices" variant="secondary">
                Ver faturas
              </ActionButton>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-tight">Formas de pagamento</h3>
              <p className="mt-2 text-sm text-accent">
                Atualize seu cartão ou adicione métodos alternativos com segurança.
              </p>
              <div className="mt-4">
                <ActionButton href="/billing/payment-methods" variant="ghost">
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
                <dd>Ativa</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-accent">Próxima cobrança</dt>
                <dd>{plan.renewal}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-accent">Valor</dt>
                <dd>{plan.price}</dd>
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
            <h2 className="text-lg font-semibold tracking-tight">Histórico de faturas</h2>
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
                <tr className="text-left">
                  <Th>Data</Th>
                  <Th>Plano</Th>
                  <Th>Valor</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Ação</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/60">
                    <Td>{row.month}</Td>
                    <Td>{row.plan}</Td>
                    <Td>{row.amount}</Td>
                    <Td>
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs">
                        {row.status}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={`/billing/invoices/${row.id}`}
                        className="text-foreground hover:underline underline-offset-4"
                      >
                        Baixar PDF
                      </Link>
                    </Td>
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

/* Primitives */
function ActionButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const base =
    'inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';
  const styles =
    variant === 'primary'
      ? 'bg-primary text-secondary hover:opacity-90'
      : variant === 'secondary'
      ? 'border border-border bg-secondary hover:bg-muted'
      : 'text-foreground hover:underline underline-offset-4';
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th scope="col" className={`px-4 py-3 text-xs font-medium text-accent ${className}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}