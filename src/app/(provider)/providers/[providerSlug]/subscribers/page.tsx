import {
  getProviderBySlug,
  getServicesByProviderId,
  getSubscribersByServiceId,
} from '@/lib/providers';
import { notFound } from 'next/navigation';
import { Subscription } from '@/types/provider';

type SubscriberWithService = Subscription & {
  serviceName: string;
};

export default async function SubscribersPage({ params }: any) {
  const provider = await getProviderBySlug(params.providerSlug);

  if (!provider) {
    notFound();
  }

  const services = await getServicesByProviderId(provider.id);

  const allSubscribers: SubscriberWithService[] = await Promise.all(
    services.map(async (service) => {
      const subscribers = await getSubscribersByServiceId(service.id);
      return subscribers.map((sub: any) => ({
        ...sub,
        serviceName: service.name,
      }));
    })
  ).then((results) => results.flat());

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Subscribers</h1>
        <p className="text-muted-foreground">
          View and manage your service subscribers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Subscribers
          </h3>
          <p className="text-3xl font-bold text-foreground">
            {allSubscribers.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Active Subscriptions
          </h3>
          <p className="text-3xl font-bold text-foreground">
            {
              allSubscribers.filter(
                (s: SubscriberWithService) => s.status === 'active'
              ).length
            }
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            This Month
          </h3>
          <p className="text-3xl font-bold text-foreground">0</p>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            All Subscribers
          </h2>
        </div>

        {allSubscribers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No subscribers yet
              </h3>
              <p className="text-muted-foreground">
                Your subscribers will appear here once people start subscribing
                to your services.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Subscribed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allSubscribers.map((subscriber: SubscriberWithService) => (
                  <tr key={subscriber.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {subscriber.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {subscriber.user?.email || 'No email'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-foreground">
                        {subscriber.serviceName}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscriber.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {(() => {
                        // Approximate start date as 30 days before currentPeriodEnd since model lacks createdAt
                        const end = new Date(subscriber.currentPeriodEnd);
                        const start = new Date(
                          end.getTime() - 30 * 24 * 60 * 60 * 1000
                        );
                        return start.toLocaleDateString();
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="font-medium text-primary hover:text-primary/80">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
