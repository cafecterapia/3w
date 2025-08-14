'use client';

import React, { useEffect, useMemo, useState } from 'react';

export interface IdentifyFormValues {
  name: string;
  cpf: string;
  phone_number: string;
}

export function IdentifyForm({
  initialName,
  initialCpf,
  initialPhone,
  disabled,
  error,
  isPending,
  onSubmit,
  showHeader = true,
}: {
  initialName: string;
  initialCpf: string;
  initialPhone?: string;
  disabled?: boolean;
  error?: string | null;
  isPending?: boolean;
  onSubmit: (values: IdentifyFormValues) => void;
  showHeader?: boolean;
}) {
  const [formData, setFormData] = useState({
    name: initialName,
    cpf: initialCpf,
    phone_number: initialPhone || '',
  });
  const [touched, setTouched] = useState({
    name: false,
    cpf: false,
    phone: false,
  });

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

  // Keep phone in sync if provided later
  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev } as any;
      if (
        !touched.phone &&
        typeof initialPhone === 'string' &&
        prev.phone_number !== initialPhone
      ) {
        next.phone_number = initialPhone || '';
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPhone]);

  // Format CPF as 000.000.000-00 while typing (allow partial formatting)
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    let result = numbers;
    if (numbers.length > 9) {
      result = numbers.replace(
        /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
        (_m, a, b, c, d) => (d ? `${a}.${b}.${c}-${d}` : `${a}.${b}.${c}`)
      );
    } else if (numbers.length > 6) {
      result = numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, (_m, a, b, c) =>
        c ? `${a}.${b}.${c}` : `${a}.${b}`
      );
    } else if (numbers.length > 3) {
      result = numbers.replace(/(\d{3})(\d{0,3})/, (_m, a, b) =>
        b ? `${a}.${b}` : a
      );
    }
    return result;
  };

  // Format phone number as (00) 00000-0000 (or (00) 0000-0000 for 10 digits) while typing
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      // Landline pattern (2+4+4)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    // Mobile pattern (2+5+4)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const isValid = useMemo(() => {
    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    const phoneDigits = formData.phone_number.replace(/\D/g, '');
    // Accept 10 or 11 digits (landline or mobile with DDD), common BR formats
    return (
      formData.name.trim().length >= 2 &&
      cpfNumbers.length === 11 &&
      phoneDigits.length >= 10 &&
      phoneDigits.length <= 11
    );
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

        <div className="space-y-1">
          <label htmlFor="phone" className="text-xs font-medium text-gray-700">
            Telefone (com DDD) *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            disabled={!!disabled || !!isPending}
            value={formData.phone_number}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                phone_number: formatPhone(e.target.value),
              }))
            }
            onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
            placeholder="(11) 91234-5678"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {touched.phone &&
            (formData.phone_number.replace(/\D/g, '').length < 10 ||
              formData.phone_number.replace(/\D/g, '').length > 11) && (
              <p className="text-xs text-red-600">
                Informe um telefone válido com DDD (10 a 11 dígitos).
              </p>
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
