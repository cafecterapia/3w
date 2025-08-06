'use client';

import { useSubscription } from '../../hooks/use-subscription';
import type { Subscription } from '../../types';

interface SubscriptionStatusProps {
  userId: string;
  subscription?: Subscription;
}

export function SubscriptionStatus({
  userId,
  subscription: propSubscription,
}: SubscriptionStatusProps) {
  const {
    subscription: hookSubscription,
    loading,
    error,
  } = useSubscription(userId);

  // Use prop subscription if provided, otherwise use hook subscription
  const subscription = propSubscription || hookSubscription;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-800 font-medium">Error loading subscription</p>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            You don&apos;t have an active subscription. Choose a plan to get
            started.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Subscription Status
        </h3>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}
        >
          {subscription.status.charAt(0).toUpperCase() +
            subscription.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Plan Details
          </h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-600">Plan:</span>{' '}
              <span className="font-medium">
                {subscription.plan?.name || 'Unknown Plan'}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Price:</span>{' '}
              <span className="font-medium">
                ${subscription.plan?.price || 0}/
                {subscription.plan?.interval || 'month'}
              </span>
            </p>
            {subscription.plan?.maxApiCalls && (
              <p className="text-sm">
                <span className="text-gray-600">API Calls:</span>{' '}
                <span className="font-medium">
                  {subscription.plan.maxApiCalls.toLocaleString()}/month
                </span>
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Billing Cycle
          </h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-600">Current Period:</span>{' '}
              <span className="font-medium">
                {formatDate(subscription.currentPeriodStart)} -{' '}
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </p>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-yellow-600">
                <span className="font-medium">⚠️ Cancels at period end</span>
              </p>
            )}
            {subscription.trialEnd &&
              new Date(subscription.trialEnd) > new Date() && (
                <p className="text-sm text-blue-600">
                  <span className="font-medium">
                    Trial ends: {formatDate(subscription.trialEnd)}
                  </span>
                </p>
              )}
          </div>
        </div>
      </div>

      {subscription.status === 'past_due' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium">Payment Past Due</p>
              <p className="text-yellow-700 text-sm">
                Please update your payment method to continue using the service.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
