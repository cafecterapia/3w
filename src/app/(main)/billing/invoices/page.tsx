import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getInvoices } from '@/lib/billing';

export const metadata: Metadata = {
  title: 'Faturas — Portal do Aluno',
  description: 'Visualize todas as suas faturas e recibos.',
};

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const invoices = await getInvoices(session.user.id);

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
            Faturas
          </h1>
          <p className="mt-2 text-accent">Histórico completo de cobranças.</p>
        </header>

        <div className="overflow-hidden rounded-lg border border-border">
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
              {invoices.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-3 capitalize">{item.month}</td>
                  <td className="px-4 py-3">{item.plan}</td>
                  <td className="px-4 py-3">{item.amount}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/billing/invoices/${item.id}`}
                      className="text-accent hover:underline"
                    >
                      Ver fatura
                    </Link>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-accent">
                    Nenhuma fatura encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
