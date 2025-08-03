import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard - 3W App',
  description: 'Your subscription dashboard',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to your Dashboard, {session.user?.name || 'User'}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Manage your subscription and account settings from here.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Subscription Status
              </h3>
              <p className="text-sm text-gray-600">Active Premium Plan</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Next Billing
              </h3>
              <p className="text-sm text-gray-600">March 15, 2025</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">$29.99</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Usage This Month
              </h3>
              <p className="text-sm text-gray-600">API Calls</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                2,847 / 10,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
