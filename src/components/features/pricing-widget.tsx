'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import {
  calculatePricing,
  DISCOUNT_THRESHOLD,
  DISCOUNT_PERCENTAGE,
  SCHEDULING_DISCOUNT_PERCENTAGE,
} from '../../lib/pricing-constants';

interface PricingWidgetProps {
  className?: string;
  showHeader?: boolean;
  maxClasses?: number;
  redirectToPayment?: boolean;
  initialClassCount?: number;
}

export function PricingWidget({
  className = '',
  showHeader = true,
  maxClasses = 8,
  redirectToPayment = false,
  initialClassCount = 1,
}: PricingWidgetProps) {
  const [classCount, setClassCount] = useState(initialClassCount);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pricing = useMemo(() => {
    return calculatePricing(classCount, 'recurring');
  }, [classCount]);

  const fillPercent =
    maxClasses > 1 ? ((classCount - 1) / (maxClasses - 1)) * 100 : 100;

  const handlePayment = async () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(
          '/api/payments/create-class-subscription',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              classCount,
              schedulingOption: 'recurring',
              totalPrice: pricing.finalPrice,
              discountApplied: pricing.totalDiscountPercentage,
            }),
          }
        );

        if (!response.ok) {
          // Handle non-successful HTTP responses
          const errorData = await response
            .json()
            .catch(() => ({ message: 'An unexpected error occurred.' }));
          throw new Error(
            errorData.message || 'Failed to create subscription.'
          );
        }

        const data = await response.json();

        if (data.success && data.paymentConfirmationUrl) {
          window.location.href = data.paymentConfirmationUrl;
        } else {
          // Handle cases where the API returns a success but no payment URL
          setError('Could not retrieve payment URL. Please try again.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An unknown error occurred. Please try again.'
        );
      }
    });
  };

  return (
    <>
      <div className={`max-w-lg mx-auto text-foreground ${className}`}>
        {showHeader && (
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">Planos</h3>
            <p className="text-sm text-gray-600">Mais aulas, menor preço.</p>
          </div>
        )}

        <Card className="border border-gray-200 bg-white rounded-lg shadow-sm">
          <CardHeader>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1.5">Aulas por mês</div>
              <div className="text-3xl font-bold">{classCount}</div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>1</span>
                <span>{maxClasses}</span>
              </div>

              <input
                type="range"
                min={1}
                max={maxClasses}
                value={classCount}
                onChange={(e) => setClassCount(parseInt(e.target.value, 10))}
                aria-label="Selecionar quantidade de aulas"
                className="w-full appearance-none cursor-pointer h-1 rounded-full outline-none disabled:opacity-50 range-slider"
                disabled={isPending}
                style={{
                  background: `linear-gradient(to right, var(--color-gray-900) 0%, var(--color-gray-900) ${fillPercent}%, var(--color-gray-200) ${fillPercent}%, var(--color-gray-200) 100%)`,
                }}
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 grid gap-2">
              <Row
                label="Subtotal"
                value={`R$ ${pricing.baseTotal.toFixed(2)}`}
                muted
              />

              {pricing.totalDiscountPercentage > 0 && (
                <>
                  {pricing.discountPercentage > 0 && (
                    <Row
                      label={`Desconto volume (${pricing.discountPercentage}%)`}
                      value={`- R$ ${(pricing.baseTotal * (pricing.discountPercentage / 100)).toFixed(2)}`}
                      strong
                    />
                  )}
                  {pricing.schedulingDiscountPercentage > 0 && (
                    <Row
                      label={`Desconto agendamento fixo (${pricing.schedulingDiscountPercentage}%)`}
                      value={`- R$ ${(pricing.baseTotal * (pricing.schedulingDiscountPercentage / 100)).toFixed(2)}`}
                      strong
                    />
                  )}
                </>
              )}

              <div className="h-px bg-gray-200" />

              <Row
                label="Total"
                value={`R$ ${pricing.finalPrice.toFixed(2)}`}
                strong
                large
              />
              <div className="text-xs text-center text-gray-600">
                R$ {pricing.unitPrice.toFixed(2)} por aula
              </div>
            </div>

            {classCount < DISCOUNT_THRESHOLD && !isPending && (
              <div className="bg-gray-50 border-l-4 border-gray-400 p-2 rounded-lg text-sm text-gray-700">
                Falta(m) {DISCOUNT_THRESHOLD - classCount} aula(s) para{' '}
                {DISCOUNT_PERCENTAGE}% off.
                <br />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 p-2 rounded-lg text-sm text-red-700 text-center">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              variant="secondary"
              size="lg"
              className="w-full !bg-gray-900 !text-white rounded-lg h-11 !border-0"
              onClick={handlePayment}
              disabled={isPending}
            >
              {isPending ? 'Processing...' : 'Pagar agora'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  strong = false,
  muted = false,
  large = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span
        className={`${large ? 'text-sm' : 'text-xs'} ${
          muted ? 'text-gray-600' : 'text-foreground'
        } ${strong ? 'font-semibold' : 'font-medium'}`}
      >
        {label}
      </span>
      <span
        className={`${large ? 'text-lg' : 'text-xs'} text-foreground ${
          strong ? 'font-bold' : 'font-semibold'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
