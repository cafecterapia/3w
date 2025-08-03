'use client';

import { Button } from '../ui/button';

interface BillingPortalProps {
  userId: string;
  isLoading?: boolean;
}

export function BillingPortal({
  userId,
  isLoading = false,
}: BillingPortalProps) {
  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/payments/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success && data.portalUrl) {
        // Redirect to the billing portal
        window.location.href = data.portalUrl;
      } else {
        throw new Error(data.error || 'Failed to create billing portal');
      }
    } catch (error) {
      console.error('Error creating billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Manage Your Billing
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Update payment methods, view invoices, and manage your subscription
          through our secure billing portal.
        </p>

        <Button
          onClick={handleManageBilling}
          isLoading={isLoading}
          size="lg"
          className="w-full sm:w-auto"
        >
          Open Billing Portal
        </Button>

        <div className="mt-4 text-xs text-gray-500">
          <p>Powered by Efi • Secure & Encrypted</p>
        </div>
      </div>
    </div>
  );
}
