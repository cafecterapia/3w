import { getProviderBySlug, getServicesByProviderId } from '@/lib/providers';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProviderDashboard({ params }: any) {
  const provider = await getProviderBySlug(params.providerSlug);

  if (!provider) {
    notFound();
  }

  const services = await getServicesByProviderId(provider.id);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-gray-600">
          Manage your services and track your subscribers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Services
          </h3>
          <p className="text-3xl font-bold text-foreground">
            {services.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Active Services
          </h3>
          <p className="text-3xl font-bold text-foreground">
            {services.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Subscribers
          </h3>
          <p className="text-3xl font-bold text-foreground">0</p>
        </div>
      </div>

      {/* Recent Services */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Your Services
            </h2>
            <Link
              href={`/providers/${params.providerSlug}/services`}
              className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-accent transition-colors"
            >
              Manage Services
            </Link>
          </div>
        </div>
        <div className="p-6">
          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You haven&apos;t created any services yet.
              </p>
              <Link
                href={`/providers/${params.providerSlug}/services`}
                className="inline-flex items-center px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-accent transition-colors"
              >
                Create Your First Service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {services.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-foreground">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                      Active
                      <span className="mx-2">•</span>0 subscribers
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(service.price)}
                    </p>
                    <p className="text-sm text-gray-600">/month</p>
                  </div>
                </div>
              ))}
              {services.length > 3 && (
                <div className="text-center pt-4">
                  <Link
                    href={`/providers/${params.providerSlug}/services`}
                    className="text-primary hover:text-accent"
                  >
                    View all {services.length} services →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
