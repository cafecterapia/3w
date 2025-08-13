'use client';

import React from 'react';
import { StatusBar } from './ui';
import type { BoletoPaymentData } from '../types';

export function BoletoPaymentPanel({
  paymentData,
  onCancel,
  paymentStatus,
}: {
  paymentData: BoletoPaymentData | null;
  onCancel: () => void;
  paymentStatus: 'pending' | 'paid' | 'expired' | 'cancelled';
}) {
  return (
    <div className="space-y-6">
      <StatusBar text="Aguardando pagamento do boleto" />

      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs underline text-gray-900 hover:opacity-80"
        >
          Cancelar pagamento
        </button>
        <span className="text-xs text-gray-600">
          Pague até a data de vencimento
        </span>
      </div>

      {paymentData ? (
        <div className="rounded-md border bg-gray-50 p-4 text-sm space-y-3">
          {paymentData.billetLink && (
            <a
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-secondary hover:opacity-90"
              href={paymentData.billetLink}
              target="_blank"
            >
              Abrir boleto
            </a>
          )}
          {paymentData.billetPdfUrl && (
            <a
              className="ml-2 inline-flex items-center justify-center rounded-md border px-3 py-2 text-xs font-medium text-gray-900 hover:opacity-80"
              href={paymentData.billetPdfUrl}
              target="_blank"
            >
              Baixar PDF
            </a>
          )}
          {paymentData.barcode && (
            <div className="mt-2">
              <div className="text-xs text-gray-600">Linha digitável</div>
              <div className="rounded-md border bg-white p-2 font-mono text-xs text-gray-900">
                {paymentData.barcode}
              </div>
            </div>
          )}
          <div className="text-xs text-gray-600">
            ID da cobrança: {paymentData.chargeId}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border bg-gray-50 p-6 text-center">
          <div className="relative h-8 w-8">
            <span className="absolute inset-0 rounded-full border-2 border-gray-200"></span>
            <span className="absolute inset-0 rounded-full border-2 border-gray-900 border-t-transparent animate-spin"></span>
          </div>
          <h3 className="mt-3 text-sm font-medium">Gerando seu boleto</h3>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-600">
          A compensação pode levar até 1-2 dias úteis. Enviaremos confirmação
          automática.
        </p>
      </div>
    </div>
  );
}
