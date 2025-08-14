import { getServiceBySlug } from '@/lib/providers';
import { notFound } from 'next/navigation';
import SubscribeButton from '@/components/features/subscribe-button';

export default async function ServiceLandingPage({ params }: any) {
  const service = await getServiceBySlug(
    params.providerSlug,
    params.serviceSlug
  );
  if (!service) {
    notFound();
  }
  const s = service;
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-secondary">
                {s.provider?.user?.name?.charAt(0).toUpperCase() || 'P'}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {s.provider?.businessName}
              </p>
              <p className="text-sm text-gray-600">{s.provider?.user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Service Details */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {s.name}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {s.description}
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                What&apos;s Included
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">Professional service</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">Quality guaranteed</span>
                </li>
              </ul>
            </div>

            {/* Availability */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Availability
                </span>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Subscribe */}
          <div>
            <div className="bg-card border border-border rounded-xl p-8 sticky top-8">
              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    {formatPrice(s.price)}
                  </span>
                  <span className="text-lg text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-gray-600">Billed monthly</p>
              </div>

              {/* Subscribe Button */}
              <div className="mb-6">
                <SubscribeButton
                  service={{
                    id: s.id,
                    name: s.name,
                    price: s.price,
                    currency: 'BRL',
                    billingCycle: 'monthly',
                  }}
                />
              </div>

              {/* Trust Indicators */}
              <div className="text-center space-y-2 text-sm text-gray-600">
                <p className="flex items-center justify-center">
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secure payment
                </p>
                <p className="flex items-center justify-center">
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
