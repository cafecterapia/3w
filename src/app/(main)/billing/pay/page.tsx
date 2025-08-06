import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import PaymentConfirmation from './payment-confirmation';

export const metadata: Metadata = {
  title: 'Confirmar Pagamento — Portal do Aluno',
  description: 'Confirme seu pagamento via PIX para ativar sua assinatura.',
};

interface PaymentPageProps {
  searchParams: {
    txid?: string;
  };
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const session = await auth();
  if (!session) redirect('/login');

  const { txid } = searchParams;

  if (!txid) {
    redirect('/billing');
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <PaymentConfirmation txid={txid} />
      </div>
    </main>
  );
}
