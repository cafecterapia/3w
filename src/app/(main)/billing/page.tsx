import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing - 3W App',
  description: 'Manage your subscription and billing',
};

export default function BillingPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Billing & Subscription
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Plan
            </h2>
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Premium Plan
                  </h3>
                  <p className="text-sm text-gray-600">
                    10,000 API calls per month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">$29.99</p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Manage Subscription
              </button>
              <button className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                View Invoices
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Billing History
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">February 2025</p>
                  <p className="text-sm text-gray-600">Premium Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.99</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">January 2025</p>
                  <p className="text-sm text-gray-600">Premium Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.99</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">December 2024</p>
                  <p className="text-sm text-gray-600">Premium Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.99</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
