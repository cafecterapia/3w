'use client';

import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';

interface SubscribeButtonProps {
  service: {
    id: string;
    name: string;
    price: number;
    currency: string;
    billingCycle: string;
  };
}

export default function SubscribeButton({ service }: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Mock subscription logic - replace with actual implementation
      console.log('Subscribing to service:', service.id);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      alert('Successfully subscribed!');
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`w-full py-3 px-6 rounded-lg font-medium text-center transition-colors ${
        isLoading
          ? 'bg-gray-400 text-secondary cursor-not-allowed'
          : 'bg-primary text-secondary hover:bg-accent'
      }`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Subscribing...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          {`Subscribe for ${formatPrice(service.price, service.currency)}/${service.billingCycle}`}
        </span>
      )}
    </button>
  );
}
