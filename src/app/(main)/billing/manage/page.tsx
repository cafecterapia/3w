// app/(main)/billing/manage/page.tsx
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { PaymentManagementProvider } from './payment-management-provider';
import { PaymentManagementContent } from './payment-management-content';

export const metadata: Metadata = {
  title: 'Gerenciar Pagamentos — Portal do Aluno',
  description: 'Gerencie métodos de pagamento, cartões e informações de cobrança.',
};

export default async function PaymentManagementPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Header */}
        <header className="mb-10 sm:mb-12">
          <div className="flex items-center gap-4 mb-4">
            <a
              href="/billing"
              className="inline-flex items-center text-sm text-accent hover:text-foreground"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Voltar ao Faturamento
            </a>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Gerenciar Pagamentos
          </h1>
          <p className="mt-2 text-accent">
            Controle seus métodos de pagamento, informações de cobrança e dados do cartão com segurança.
          </p>
        </header>

        {/* Payment Management Interface */}
        <PaymentManagementProvider userId={session.user.id}>
          <PaymentManagementContent userName={session.user.name} userEmail={session.user.email} />
        </PaymentManagementProvider>
      </div>
    </main>
  );
}
