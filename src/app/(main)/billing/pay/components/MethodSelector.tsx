'use client';

import React from 'react';
import { MethodButton } from './ui';
import type { PaymentMethod } from '../types';

export function MethodSelector({
  selected,
  disabled,
  onSelect,
  children,
}: {
  selected: PaymentMethod;
  disabled?: boolean;
  onSelect: (m: PaymentMethod) => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border bg-card p-4 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      <div className="mb-3 flex items-start gap-2">
        <svg className="h-4 w-4 text-gray-900" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 7h18M3 12h18M3 17h18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <div>
          <h2 className="text-sm font-medium">Selecione o método</h2>
          <p className="mt-0.5 text-xs text-gray-600">
            Escolha como deseja realizar o pagamento para avançar.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <MethodButton
          label="PIX"
          desc="Aprovação instantânea"
          active={selected === 'pix'}
          onClick={() => onSelect('pix')}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M7.05 7.05L12 2.1l4.95 4.95L12 12 7.05 7.05zM12 12l4.95 4.95L12 21.9l-4.95-4.95L12 12z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <MethodButton
          label="Cartão"
          desc="Crédito ou débito"
          active={selected === 'credit'}
          onClick={() => onSelect('credit')}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          }
        />
        <MethodButton
          label="Boleto"
          desc="Até 3 dias úteis"
          active={selected === 'boleto'}
          onClick={() => onSelect('boleto')}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M8 7v10M12 7v10M16 7v10"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          }
        />
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
