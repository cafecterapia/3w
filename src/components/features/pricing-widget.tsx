'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';

const BASE_PRICE_PER_CLASS = 50.00;
const DISCOUNT_THRESHOLD = 4;
const DISCOUNT_PERCENTAGE = 10;

interface PricingWidgetProps {
  className?: string;
  showHeader?: boolean;
  maxClasses?: number;
  redirectToPayment?: boolean; // New prop for authenticated users
}

export function PricingWidget({ 
  className = '',
  showHeader = true,
  maxClasses = 8,
  redirectToPayment = false
}: PricingWidgetProps) {
  const [classCount, setClassCount] = useState(4);

  const calculatePrice = (classes: number) => {
    const baseTotal = classes * BASE_PRICE_PER_CLASS;
    const discountApplied = classes >= DISCOUNT_THRESHOLD ? DISCOUNT_PERCENTAGE : 0;
    const discountAmount = baseTotal * (discountApplied / 100);
    return {
      baseTotal,
      discountAmount,
      finalPrice: baseTotal - discountAmount,
      discountPercentage: discountApplied
    };
  };

  const pricing = calculatePrice(classCount);

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {showHeader && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Escolha Seu Plano
          </h3>
          <p className="text-gray-600">
            Mais aulas = mais desconto
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Quantidade de aulas</div>
            <div className="text-3xl font-bold text-blue-600">
              {classCount}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>1</span>
              <span>{maxClasses}</span>
            </div>
            <input
              type="range"
              min="1"
              max={maxClasses}
              value={classCount}
              onChange={(e) => setClassCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((classCount - 1) / (maxClasses - 1)) * 100}%, #e5e7eb ${((classCount - 1) / (maxClasses - 1)) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm">R$ {pricing.baseTotal.toFixed(2)}</span>
            </div>
            
            {pricing.discountPercentage > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm">Desconto ({pricing.discountPercentage}%):</span>
                <span className="text-sm">- R$ {pricing.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <hr className="border-gray-300" />
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-green-600">
                R$ {pricing.finalPrice.toFixed(2)}
              </span>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              R$ {(pricing.finalPrice / classCount).toFixed(2)} por aula
            </div>
          </div>

          {classCount < DISCOUNT_THRESHOLD && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
              <p className="text-sm text-blue-700">
                💡 Adicione {DISCOUNT_THRESHOLD - classCount} aula{DISCOUNT_THRESHOLD - classCount > 1 ? 's' : ''} e ganhe {DISCOUNT_PERCENTAGE}% de desconto!
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {redirectToPayment ? (
            <Button 
              size="lg" 
              className="w-full"
              onClick={async () => {
                try {
                  // Call the payment API directly for authenticated users
                  const response = await fetch('/api/payments/create-class-subscription', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      classCount,
                      schedulingOption: 'recurring', // Default to recurring for quick selection
                      totalPrice: pricing.finalPrice,
                      discountApplied: pricing.discountPercentage
                    }),
                  });

                  const data = await response.json();

                  if (data.success && data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                  } else if (data.success) {
                    // Redirect to detailed plan selection
                    window.location.href = `/plans?classes=${classCount}`;
                  } else {
                    alert('Erro ao processar pagamento. Tente novamente.');
                  }
                } catch (error) {
                  console.error('Error:', error);
                  alert('Erro ao processar pagamento. Tente novamente.');
                }
              }}
            >
              Comprar Agora
            </Button>
          ) : (
            <Link
              href={`/plans?classes=${classCount}`}
              className="w-full"
            >
              <Button size="lg" className="w-full">
                Escolher Este Plano
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
