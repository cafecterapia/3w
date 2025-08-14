import { getProviderBySlug, getServicesByProviderId } from '@/lib/providers';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ServicesPage({ params }: any) {
  const provider = await getProviderBySlug(params.providerSlug);

  if (!provider) {
    notFound();
  }

  const services = await getServicesByProviderId(provider.id);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-gray-600">
            Create and manage your service offerings
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-accent transition-colors">
          Create Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No services yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first service to offer to your customers.
            </p>
            <button className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-accent transition-colors">
              Create Your First Service
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Active
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(service.price)}
                  </p>
                  <p className="text-sm text-gray-600">/month</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">0</p>
                  <p className="text-sm text-gray-600">subscribers</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                  Edit
                </button>
                <Link
                  href={`/providers/${params.providerSlug}/${service.slug}`}
                  className="flex-1 px-3 py-2 text-sm bg-primary text-secondary rounded-lg hover:bg-accent transition-colors text-center"
                >
                  View Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
