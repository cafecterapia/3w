import { Metadata } from 'next';
import { PlanSelectionClient } from './plan-selection-client';

export const metadata: Metadata = {
  title: 'Escolha Seu Plano de Aulas | Portal do Aluno',
  description: 'Selecione quantas aulas você quer por mês e escolha seu modelo de agendamento. Mais aulas = mais desconto!',
  keywords: ['aulas', 'planos', 'yoga', 'pilates', 'fitness', 'agendamento'],
  openGraph: {
    title: 'Escolha Seu Plano de Aulas',
    description: 'Planos flexíveis com desconto progressivo. De 1 a 8 aulas por mês.',
    type: 'website',
  },
};

interface PlanPageProps {
  searchParams: {
    classes?: string;
    scheduling?: string;
  };
}

export default function PlansPage({ searchParams }: PlanPageProps) {
  const initialClassCount = searchParams.classes 
    ? Math.min(Math.max(parseInt(searchParams.classes), 1), 8)
    : 1;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <PlanSelectionClient initialClassCount={initialClassCount} />
      </div>
    </main>
  );
}
