import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PricingWidget } from '@/components/features/pricing-widget';

export const metadata: Metadata = {
  title: 'Atualizar Plano — Portal do Aluno',
  description: 'Ajuste a quantidade de aulas e inicie um novo pagamento.',
};

export default async function PlanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8">
          <div className="mb-4">
            <Link
              href="/billing"
              className="text-sm text-accent hover:underline"
            >
              ← Voltar ao faturamento
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Atualizar plano
          </h1>
          <p className="mt-2 text-accent">
            Escolha o número de aulas por mês e prossiga para o pagamento.
          </p>
        </header>

        <div className="max-w-xl">
          <PricingWidget showHeader={false} redirectToPayment={true} />
        </div>
      </div>
    </main>
  );
}
