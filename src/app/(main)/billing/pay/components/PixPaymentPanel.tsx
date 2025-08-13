'use client';

import React from 'react';
import Image from 'next/image';
import { PlaceholderPanel, StatusBar } from './ui';
import type { PixPaymentData } from '../types';

export function PixPaymentPanel({
  paymentData,
  copySuccess,
  onCopy,
  onCancel,
  paymentStatus,
}: {
  paymentData: PixPaymentData | null;
  copySuccess: boolean;
  onCopy: (text: string) => void;
  onCancel: () => void;
  paymentStatus: 'pending' | 'paid' | 'expired' | 'cancelled';
}) {
  return (
    <div className="space-y-6">
      <StatusBar text="Aguardando pagamento via PIX" />

      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs underline text-gray-900 hover:opacity-80"
        >
          Cancelar pagamento
        </button>
        <span className="text-xs text-gray-600">Válido por ~6 minutos</span>
      </div>

      {paymentData ? (
        <>
          <div className="text-center">
            <div className="inline-block rounded-lg border bg-background p-4">
              {/**
               * Some backends return qrcodeImage as a raw base64 payload (iVBORw0...) while others
               * may already include the full data URL prefix (data:image/png;base64,...).
               * Normalize here to avoid duplicating the prefix and breaking the URL.
               */}
              <Image
                src={(function () {
                  const raw = (paymentData.qrcodeImage || '').trim();
                  if (
                    raw.startsWith('data:') ||
                    raw.startsWith('http://') ||
                    raw.startsWith('https://') ||
                    raw.startsWith('blob:')
                  ) {
                    return raw;
                  }
                  return `data:image/png;base64,${raw}`;
                })()}
                alt="QR Code PIX"
                width={256}
                height={256}
                className="h-64 w-64"
                unoptimized
              />
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Escaneie com o app do seu banco
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Ou copie a chave PIX
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paymentData.qrcodeText}
                readOnly
                className="flex-1 rounded-md border bg-gray-50 px-3 py-2 font-mono text-xs text-gray-900"
              />
              <button
                onClick={() => onCopy(paymentData.qrcodeText)}
                className={`rounded-md px-3 py-2 text-sm transition-opacity ${
                  copySuccess
                    ? 'bg-gray-900 text-white'
                    : 'bg-primary text-secondary hover:opacity-90'
                }`}
              >
                {copySuccess ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border bg-gray-50 p-6 text-center">
          <div className="relative h-8 w-8">
            <span className="absolute inset-0 rounded-full border-2 border-gray-200"></span>
            <span className="absolute inset-0 rounded-full border-2 border-gray-900 border-t-transparent animate-spin"></span>
          </div>
          <h3 className="mt-3 text-sm font-medium">Gerando seu QR Code</h3>
          <p className="mt-1 max-w-sm text-xs text-gray-600">
            Em caso de demora, recarregue a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-secondary hover:opacity-90"
          >
            Recarregar
          </button>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-600">
          A confirmação ocorre automaticamente assim que o pagamento for
          processado.
        </p>
      </div>
    </div>
  );
}
