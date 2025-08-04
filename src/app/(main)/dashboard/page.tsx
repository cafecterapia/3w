// app/dashboard/page.tsx

import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDashboardData } from '@/lib/data'; // Import our new function
import { format } from 'date-fns'; // A great library for date formatting
import { ptBR } from 'date-fns/locale';
import { PricingWidget } from '@/components/features/pricing-widget';

export const metadata: Metadata = {
  title: 'Painel — Portal do Aluno',
  description: 'Resumo da sua assinatura, faturas e avisos.',
};

export default async function DashboardPage() {
  const session = await auth();
  // Ensure we have a user ID before proceeding
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch real data from the database in parallel
  const { subscription, invoices, notices } = await getDashboardData(
    session.user.id
  );

  const userName = session.user?.name || session.user?.email || 'Aluno';

  // --- Helper functions for formatting data ---
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return format(date, 'd MMM yyyy', { locale: ptBR });
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Page header */}
        <header className="mb-10 sm:mb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Olá, {userName}
            </h1>
            <p className="text-accent">
              Aqui está um resumo rápido da sua assinatura e das últimas
              atualizações.
            </p>
          </div>
        </header>

        {/* Show pricing widget for users without active subscription */}
        {(!subscription || subscription.status === 'inactive' || subscription.status === 'cancelled') ? (
          <section className="mb-10 sm:mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Comece Sua Jornada de Bem-Estar
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Você ainda não possui um plano ativo. Escolha quantas aulas você quer por mês 
                  e comece hoje mesmo!
                </p>
              </div>
              <PricingWidget 
                showHeader={false}
                className="max-w-md mx-auto"
                redirectToPayment={true}
              />
              <div className="text-center mt-4">
                <Link 
                  href="/plans"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Ver todas as opções de agendamento
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-10 sm:mb-12">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  🎉 Sua assinatura está ativa!
                </h2>
                <p className="text-gray-600 mb-4">
                  Aproveite suas aulas e mantenha sua rotina de bem-estar em dia.
                </p>
                <Link 
                  href="/billing/manage"
                  className="inline-flex items-center justify-center rounded-md bg-green-600 text-white px-6 py-2 text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Gerenciar Plano
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Top grid: Status + Próximo pagamento + Ações rápidas */}
        <section aria-labelledby="resumo-assinatura" className="mb-10 sm:mb-12">
          <h2 id="resumo-assinatura" className="sr-only">
            Resumo da assinatura
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            {/* Status */}
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Assinatura</CardTitle>
                  <p className="mt-1 text-sm text-accent">
                    {subscription?.plan || 'Nenhum plano ativo'}
                  </p>
                </div>
                {/* We pass the status, or a default string if no subscription */}
                <StatusPill status={subscription?.status || 'inactive'} />
              </div>
              <div className="mt-4">
                <Link
                  href="/billing/manage"
                  className="text-sm font-medium hover:underline underline-offset-4"
                >
                  Gerenciar pagamentos
                </Link>
              </div>
            </Card>

            {/* Próximo faturamento */}
            <Card>
              <CardTitle>Próximo pagamento</CardTitle>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-accent">Data</p>
                  <p className="text-base mt-1">
                    {formatDate(subscription?.nextBillingDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-accent">Valor</p>
                  <p className="text-base mt-1">
                    {formatCurrency(subscription?.nextAmount)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/billing"
                  className="text-sm font-medium hover:underline underline-offset-4"
                >
                  Ver opções de pagamento
                </Link>
              </div>
            </Card>

            {/* Ações rápidas */}
            <Card>
              <CardTitle>Ações rápidas</CardTitle>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <QuickAction href="/billing">Ver faturas</QuickAction>
                <QuickAction href="/settings">Notificações</QuickAction>
                <QuickAction href="/settings#perfil">
                  Atualizar perfil
                </QuickAction>
                <QuickAction href="/support">Suporte</QuickAction>
              </div>
            </Card>
          </div>
        </section>

        {/* Middle grid: Faturas recentes + Avisos */}
        <section
          aria-labelledby="financeiro-e-avisos"
          className="mb-10 sm:mb-12"
        >
          <h2 id="financeiro-e-avisos" className="sr-only">
            Financeiro e avisos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            {/* Faturas recentes */}
            <Card className="md:col-span-2">
              <div className="flex items-center justify-between">
                <CardTitle>Faturas recentes</CardTitle>
                <Link
                  href="/billing"
                  className="text-sm text-accent hover:underline underline-offset-4"
                >
                  Ver todas
                </Link>
              </div>

              {invoices.length > 0 ? (
                <ul className="mt-4 divide-y divide-border">
                  {invoices.map((inv: any) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {formatDate(inv.date)}
                        </p>
                        <p className="text-xs text-accent">
                          ID: {inv.invoiceId}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          {formatCurrency(inv.amount)}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs">
                          {inv.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-accent">
                  Nenhuma fatura encontrada.
                </p>
              )}
            </Card>

            {/* Avisos */}
            <Card>
              <CardTitle>Últimos avisos</CardTitle>
              {notices.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {notices.map((n: any) => (
                    <li
                      key={n.id}
                      className="rounded-md border border-border p-3"
                    >
                      <p className="text-sm">{n.text}</p>
                      <p className="mt-1 text-xs text-accent">
                        {formatDate(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-accent">
                  Nenhum aviso recente.
                </p>
              )}
              <div className="mt-4">
                <Link
                  href="/settings"
                  className="text-sm text-accent hover:underline underline-offset-4"
                >
                  Gerenciar notificações
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Bottom section (remains the same) */}
        <section aria-labelledby="suporte-acessibilidade">
          <h2 id="suporte-acessibilidade" className="sr-only">
            Suporte e acessibilidade
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardTitle>Precisa de ajuda?</CardTitle>
              <p className="mt-2 text-sm text-accent">
                Encontre respostas rápidas ou fale diretamente com a equipe.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <QuickAction href="/support">Central de ajuda</QuickAction>
                <QuickAction href="/support#contato">
                  Falar com suporte
                </QuickAction>
                <QuickAction href="/support#pagamentos">Pagamentos</QuickAction>
              </div>
            </Card>

            <Card>
              <CardTitle>Acessibilidade</CardTitle>
              <ul className="mt-3 space-y-2 text-sm text-accent">
                <li>Navegação por teclado suportada</li>
                <li>Contraste otimizado para leitura</li>
                <li>Rótulos e regiões ARIA</li>
              </ul>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

/* UI primitives (Update StatusPill to handle more cases) */
function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-border bg-secondary/50 p-4 sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base sm:text-lg font-semibold tracking-tight">
      {children}
    </h3>
  );
}

function StatusPill({ status }: { status: string }) {
  const statusInfo: { label: string; tone: string } = {
    active: { label: 'Ativa', tone: 'bg-green-500/20 text-green-700' },
    trialing: {
      label: 'Em avaliação',
      tone: 'bg-yellow-500/20 text-yellow-700',
    },
    past_due: { label: 'Em atraso', tone: 'bg-red-500/20 text-red-700' },
    canceled: {
      label: 'Cancelada',
      tone: 'bg-muted-foreground/20 text-muted-foreground',
    },
    inactive: {
      label: 'Inativa',
      tone: 'bg-muted-foreground/20 text-muted-foreground',
    },
  }[status] || { label: 'Desconhecido', tone: 'bg-muted' };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.tone}`}
    >
      {statusInfo.label}
    </span>
  );
}

function QuickAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-3 py-2 text-sm hover:bg-muted"
    >
      {children}
    </Link>
  );
}
