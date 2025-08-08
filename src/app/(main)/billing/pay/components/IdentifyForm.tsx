'use client';

import React, { useEffect, useMemo, useState } from 'react';

export interface IdentifyFormValues {
  name: string;
  cpf: string;
}

export function IdentifyForm({
  initialName,
  initialCpf,
  disabled,
  error,
  isPending,
  onSubmit,
  showHeader = true,
}: {
  initialName: string;
  initialCpf: string;
  disabled?: boolean;
  error?: string | null;
  isPending?: boolean;
  onSubmit: (values: IdentifyFormValues) => void;
  showHeader?: boolean;
}) {
  const [formData, setFormData] = useState({
    name: initialName,
    cpf: initialCpf,
  });
  const [touched, setTouched] = useState({ name: false, cpf: false });

  // Keep internal state in sync when initial values change (e.g., after profile check)
  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev };
      if (!touched.name && initialName && prev.name !== initialName) {
        next.name = initialName;
      }
      if (!touched.cpf && initialCpf && prev.cpf !== initialCpf) {
        next.cpf = initialCpf;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName, initialCpf]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const isValid = useMemo(() => {
    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    return formData.name.trim().length >= 2 && cpfNumbers.length === 11;
  }, [formData]);

  return (
    <div className="rounded-lg border bg-card p-4">
      {showHeader && (
        <div className="mb-3 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zM4 22a8 8 0 0116 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-sm font-medium">Informações pessoais</h2>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium text-gray-700">
            Nome completo *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={!!disabled || !!isPending}
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
            onBlur={() => setTouched((p) => ({ ...p, name: true }))}
            placeholder="Seu nome completo"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {touched.name && formData.name.trim().length < 2 && (
            <p className="text-xs text-red-600">
              Nome deve ter pelo menos 2 caracteres.
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="cpf" className="text-xs font-medium text-gray-700">
            CPF *
          </label>
          <input
            id="cpf"
            name="cpf"
            type="text"
            required
            disabled={!!disabled || !!isPending}
            value={formData.cpf}
            onChange={(e) =>
              setFormData((p) => ({ ...p, cpf: formatCPF(e.target.value) }))
            }
            onBlur={() => setTouched((p) => ({ ...p, cpf: true }))}
            placeholder="000.000.000-00"
            maxLength={14}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {touched.cpf && formData.cpf.replace(/\D/g, '').length !== 11 && (
            <p className="text-xs text-red-600">CPF deve ter 11 dígitos.</p>
          )}
        </div>

        <button
          disabled={!!disabled || !isValid || !!isPending}
          onClick={() => isValid && onSubmit(formData)}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-secondary transition-opacity disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90"
        >
          {isPending ? 'Salvando...' : 'Continuar'}
        </button>
        <p className="text-[11px] leading-4 text-gray-500">
          Seus dados são utilizados apenas para emissão e validação fiscal.
        </p>
      </div>
    </div>
  );
}
