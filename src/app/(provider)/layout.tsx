import { notFound } from 'next/navigation';
import { getProviderBySlug } from '@/lib/providers';
import ProviderHeader from '@/components/provider/provider-header';
import ProviderNav from '@/components/provider/provider-nav';

export default async function ProviderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { providerSlug: string };
}) {
  const provider = await getProviderBySlug(params.providerSlug);

  if (!provider) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <ProviderHeader provider={provider} />
      <ProviderNav providerSlug={params.providerSlug} />
      <main className="py-8">{children}</main>
    </div>
  );
}
