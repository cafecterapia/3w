'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui/card';
import type { ClassPlan, SchedulingOption, PlanSelection } from '../../../types';

const BASE_PRICE_PER_CLASS = 45.00; // Base price in reais
const DISCOUNT_THRESHOLD = 4;
const DISCOUNT_PERCENTAGE = 10;
const MAX_CLASSES = 8;
const EXPIRATION_DAYS = 30;

const SCHEDULING_OPTIONS: SchedulingOption[] = [
  {
    id: 'recurring',
    name: 'Aula Fixa Semanal',
    description: 'Mesmo dia e horário toda semana',
    icon: '📅',
    benefits: [
      'Consistência na sua rotina',
      'Horário garantido',
      'Melhor progressão',
      'Desconto de 5% adicional'
    ]
  },
  {
    id: 'on-demand',
    name: 'Aulas Sob Demanda',
    description: 'Agende quando quiser',
    icon: '🎯',
    benefits: [
      'Flexibilidade total',
      'Agende até 24h antes',
      'Cancele sem multa',
      'Ideal para agenda variada'
    ]
  }
];

interface PlanSelectionClientProps {
  initialClassCount?: number;
}

export function PlanSelectionClient({ initialClassCount = 1 }: PlanSelectionClientProps) {
  const [classCount, setClassCount] = useState(initialClassCount);
  const [selectedScheduling, setSelectedScheduling] = useState<'recurring' | 'on-demand'>('recurring');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Calculate pricing with real-time updates
  const pricingDetails = useMemo(() => {
    const baseTotal = classCount * BASE_PRICE_PER_CLASS;
    const discountApplied = classCount >= DISCOUNT_THRESHOLD ? DISCOUNT_PERCENTAGE : 0;
    const schedulingDiscount = selectedScheduling === 'recurring' ? 5 : 0;
    const totalDiscount = discountApplied + schedulingDiscount;
    const discountAmount = baseTotal * (totalDiscount / 100);
    const finalPrice = baseTotal - discountAmount;

    return {
      baseTotal,
      discountPercentage: totalDiscount,
      discountAmount,
      finalPrice,
      pricePerClass: finalPrice / classCount,
      savings: discountAmount
    };
  }, [classCount, selectedScheduling]);

  // Generate recommendations based on selection
  const recommendation = useMemo(() => {
    if (classCount === 1) {
      return "Experimente uma aula para conhecer nossa metodologia!";
    }
    if (classCount < DISCOUNT_THRESHOLD) {
      return `Adicione ${DISCOUNT_THRESHOLD - classCount} aula${DISCOUNT_THRESHOLD - classCount > 1 ? 's' : ''} e ganhe 10% de desconto!`;
    }
    if (classCount >= 6) {
      return "Excelente escolha! Ideal para ver resultados consistentes.";
    }
    return "Ótima quantidade para estabelecer uma rotina saudável!";
  }, [classCount]);

  const handleClassCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setClassCount(parseInt(e.target.value));
  }, []);

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    
    try {
      const planSelection: PlanSelection = {
        classCount,
        schedulingOption: selectedScheduling,
        totalPrice: pricingDetails.finalPrice,
        discountApplied: pricingDetails.discountPercentage
      };

      // Call API to create payment session
      const response = await fetch('/api/payments/create-class-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planSelection),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // Redirect to login if user is not authenticated
        router.push(`/register?plan=${classCount}&scheduling=${selectedScheduling}&price=${pricingDetails.finalPrice}`);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Escolha Seu Plano de Aulas
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Defina quantas aulas você quer por mês e veja o preço atualizar em tempo real. 
          Mais aulas = mais desconto!
        </p>
      </div>

      {/* Class Count Slider */}
      <Card className="p-6">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">
            Quantas aulas você quer por mês?
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>1 aula</span>
              <span>{MAX_CLASSES} aulas</span>
            </div>
            <input
              type="range"
              min="1"
              max={MAX_CLASSES}
              value={classCount}
              onChange={handleClassCountChange}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((classCount - 1) / (MAX_CLASSES - 1)) * 100}%, #e5e7eb ${((classCount - 1) / (MAX_CLASSES - 1)) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-center">
              <div className="bg-blue-100 rounded-full px-6 py-3">
                <span className="text-2xl font-bold text-blue-800">
                  {classCount} aula{classCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Preço base:</span>
              <span className="text-lg">R$ {pricingDetails.baseTotal.toFixed(2)}</span>
            </div>
            
            {pricingDetails.discountPercentage > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Desconto ({pricingDetails.discountPercentage}%):</span>
                <span className="text-lg">- R$ {pricingDetails.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <hr className="border-gray-300" />
            
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Total:</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  R$ {pricingDetails.finalPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  R$ {pricingDetails.pricePerClass.toFixed(2)} por aula
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  💡 {recommendation}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Options */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">
          Como você prefere agendar suas aulas?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {SCHEDULING_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedScheduling === option.id
                  ? 'ring-2 ring-blue-500'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedScheduling(option.id)}
            >
              <Card
                className={selectedScheduling === option.id ? 'bg-blue-50' : ''}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {option.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Expiration Policy */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⏰</span>
            <div>
              <h3 className="font-semibold text-amber-800">Política de Validade</h3>
              <p className="text-sm text-amber-700 mt-1">
                Suas aulas são válidas por {EXPIRATION_DAYS} dias a partir da data de compra. 
                Aulas não utilizadas expiram automaticamente. Agende com antecedência para 
                garantir sua vaga!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary and CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Resumo do Seu Plano
              </h3>
              <div className="mt-4 space-y-2">
                <p className="text-lg">
                  <span className="font-semibold">{classCount}</span> aula{classCount > 1 ? 's' : ''} por mês
                </p>
                <p className="text-lg">
                  Modalidade: <span className="font-semibold">
                    {SCHEDULING_OPTIONS.find(opt => opt.id === selectedScheduling)?.name}
                  </span>
                </p>
                {pricingDetails.savings > 0 && (
                  <p className="text-green-600 font-semibold">
                    Você economiza R$ {pricingDetails.savings.toFixed(2)}!
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">
                R$ {pricingDetails.finalPrice.toFixed(2)}
              </div>
              <div className="text-gray-600">
                Valor total do seu plano mensal
              </div>
            </div>

            <Button
              size="lg"
              className="w-full max-w-md text-lg py-6"
              onClick={handleProceedToPayment}
              isLoading={isLoading}
            >
              {isLoading ? 'Processando...' : 'Continuar para Pagamento'}
            </Button>
            
            <p className="text-sm text-gray-500">
              Pagamento 100% seguro • Cancele quando quiser
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
