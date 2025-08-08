import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getInvoiceById } from '@/lib/billing';

export const metadata: Metadata = {
  title: 'Detalhe da Fatura — Portal do Aluno',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;
  const invoice = await getInvoiceById(session.user.id, id);
  if (!invoice) redirect('/billing/invoices');

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-6">
          <Link
            href="/billing/invoices"
            className="text-sm text-accent hover:underline"
          >
            ← Voltar para faturas
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-secondary/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Fatura #{invoice.id.slice(0, 8)}
              </h1>
              <p className="mt-1 text-accent">
                {invoice.description || 'Assinatura'}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs capitalize">
              {invoice.status}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div className="rounded-md border bg-secondary p-4">
              <dt className="text-accent">Valor</dt>
              <dd className="mt-1 text-base font-medium">{invoice.amount}</dd>
            </div>
            <div className="rounded-md border bg-secondary p-4">
              <dt className="text-accent">Criada em</dt>
              <dd className="mt-1">
                {new Intl.DateTimeFormat('pt-BR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(invoice.createdAt))}
              </dd>
            </div>
            {invoice.periodStart && (
              <div className="rounded-md border bg-secondary p-4">
                <dt className="text-accent">Período</dt>
                <dd className="mt-1">
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'medium',
                  }).format(new Date(invoice.periodStart))}{' '}
                  —{' '}
                  {invoice.periodEnd
                    ? new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'medium',
                      }).format(new Date(invoice.periodEnd))
                    : '-'}
                </dd>
              </div>
            )}
            {invoice.externalId && (
              <div className="rounded-md border bg-secondary p-4">
                <dt className="text-accent">ID Externo</dt>
                <dd className="mt-1 font-mono text-xs">{invoice.externalId}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex gap-2">
            <Link
              href="/billing/invoices"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
