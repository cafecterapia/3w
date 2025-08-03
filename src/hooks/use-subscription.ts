import { useState, useEffect } from 'react';
import type {
  Subscription as BaseSubscription,
  SubscriptionPlan,
} from '../types';

export interface Subscription extends BaseSubscription {
  plan?: SubscriptionPlan;
}

export function useSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/subscriptions/${userId}`);
      // const data = await response.json();

      // Placeholder data
      const mockSubscription: Subscription = {
        id: 'sub_123456789',
        userId: 'user_123',
        status: 'active',
        planId: 'plan_premium',
        currentPeriodStart: new Date('2025-02-01'),
        currentPeriodEnd: new Date('2025-03-01'),
        cancelAtPeriodEnd: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-02-01'),
        trialEnd: undefined,
        plan: {
          id: 'plan_premium',
          name: 'Premium Plan',
          description: 'Most popular choice',
          price: 29.99,
          currency: 'USD',
          interval: 'month',
          maxApiCalls: 10000,
          features: ['10,000 API calls per month', 'Priority support'],
        },
      };

      setSubscription(mockSubscription);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      // TODO: Implement cancel subscription API call
      console.log('Cancelling subscription...');

      // Update local state
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to cancel subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  const resumeSubscription = async () => {
    try {
      setLoading(true);
      // TODO: Implement resume subscription API call
      console.log('Resuming subscription...');

      // Update local state
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: false,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to resume subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    cancelSubscription,
    resumeSubscription,
  };
}
