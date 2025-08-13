'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { StatusBar } from './ui';
import type { CardPaymentData } from '../types';

// Dynamically import CardInlineForm with SSR disabled
const CardInlineForm = dynamic(
  () => import('./CardInlineForm').then((mod) => mod.CardInlineForm),
  {
    ssr: false,
    loading: () => (
      <div className="py-10 text-center text-sm text-gray-500">
        Carregando formulário de pagamento...
      </div>
    ),
  }
);

export function CardPaymentPanel({
  paymentData,
  onCancel,
  paymentStatus,
  onCreated,
}: {
  paymentData: CardPaymentData | null;
  onCancel: () => void;
  paymentStatus: 'pending' | 'paid' | 'expired' | 'cancelled';
  onCreated: (args: { chargeId: string; paymentUrl?: string }) => void;
}) {
  return (
    <div className="space-y-6">
      <StatusBar text="Pague com cartão (checkout interno)" />

      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs underline text-gray-900 hover:opacity-80"
        >
          Cancelar pagamento
        </button>
        <span className="text-xs text-gray-600">
          Dados criptografados via Efí
        </span>
      </div>

      {paymentData ? (
        <div className="rounded-md border bg-gray-50 p-4 text-sm">
          <div className="text-xs text-gray-600">
            ID da cobrança: {paymentData.chargeId}
          </div>
          <p className="mt-2 text-gray-700">
            Estamos aguardando a confirmação do emissor. Este painel será
            atualizado automaticamente.
          </p>
          {paymentData.paymentUrl && (
            <div className="mt-3">
              <a
                href={paymentData.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-secondary hover:opacity-90"
              >
                Abrir checkout Efí
              </a>
              <p className="mt-2 text-[11px] text-gray-600">
                Se preferir, finalize o pagamento no checkout hospedado da Efí.
              </p>
            </div>
          )}
        </div>
      ) : (
        <CardInlineForm onCancel={onCancel} onSuccess={onCreated} />
      )}

      <div className="text-center">
        <p className="text-xs text-gray-600">
          Após a confirmação pelo emissor, atualizaremos o status
          automaticamente.
        </p>
      </div>
    </div>
  );
}
