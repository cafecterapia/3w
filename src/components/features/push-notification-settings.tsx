'use client';

import { usePushManager } from '@/hooks/use-push-manager';
import { Button } from '@/components/ui/button';

export function PushNotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    loading,
    error,
    subscribeToPush,
    unsubscribeFromPush,
  } = usePushManager();

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Push Notifications
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {isSubscribed
              ? 'You will receive push notifications for important updates.'
              : 'Enable push notifications to stay updated on your subscription status.'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Status: {isSubscribed ? 'Enabled' : 'Disabled'}
          </p>
        </div>

        <Button
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          variant={isSubscribed ? 'outline' : 'primary'}
          isLoading={loading}
          disabled={loading}
        >
          {loading
            ? 'Processing...'
            : isSubscribed
              ? 'Disable'
              : 'Enable Notifications'}
        </Button>
      </div>
    </div>
  );
}
