'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import type { SubscriptionPlan } from '../../types';

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_basic',
    name: 'Basic',
    description: 'Perfect for getting started',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    maxApiCalls: 1000,
    features: [
      '1,000 API calls per month',
      'Basic support',
      'Standard integrations',
      'Email notifications',
    ],
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    description: 'Most popular choice',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    maxApiCalls: 10000,
    isPopular: true,
    features: [
      '10,000 API calls per month',
      'Priority support',
      'Advanced integrations',
      'Push notifications',
      'Custom webhooks',
      'Analytics dashboard',
    ],
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'For large scale operations',
    price: 99.99,
    currency: 'USD',
    interval: 'month',
    maxApiCalls: 100000,
    features: [
      '100,000 API calls per month',
      '24/7 dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'SLA guarantee',
      'Custom branding',
      'Team management',
    ],
  },
];

interface PricingTableProps {
  currentPlanId?: string;
  onSelectPlan?: (planId: string) => void;
}

export function PricingTable({
  currentPlanId,
  onSelectPlan,
}: PricingTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlanId) return;

    setLoading(planId);
    try {
      if (onSelectPlan) {
        await onSelectPlan(planId);
      } else {
        // Find the selected plan
        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
        if (!plan) {
          throw new Error('Plan not found');
        }

        // Call the API to create subscription
        const response = await fetch('/api/payments/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
            amount: plan.price,
            description: `${plan.name} Plan - ${plan.description}`,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create subscription');
        }

        if (data.success && data.paymentUrl) {
          // Redirect to payment URL
          window.location.href = data.paymentUrl;
        } else {
          alert('Subscription created successfully!');
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {SUBSCRIPTION_PLANS.map((plan) => (
        <Card key={plan.id} className="relative">
          {plan.isPopular && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-indigo-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                Most Popular
              </span>
            </div>
          )}

          <CardHeader className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">
                ${plan.price}
              </span>
              <span className="text-gray-600">/{plan.interval}</span>
            </div>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              variant={
                plan.id === currentPlanId
                  ? 'secondary'
                  : plan.isPopular
                    ? 'primary'
                    : 'outline'
              }
              size="lg"
              className="w-full"
              onClick={() => handleSelectPlan(plan.id)}
              isLoading={loading === plan.id}
              disabled={plan.id === currentPlanId}
            >
              {plan.id === currentPlanId
                ? 'Current Plan'
                : loading === plan.id
                  ? 'Processing...'
                  : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
