'use client';

import React, { useEffect, useMemo, useState } from 'react';
import EfiPay from 'payment-token-efi';

export type CardFormValues = {
  number: string;
  cvv: string;
  expiry: string; // MM/AA
  holderName?: string;
};

export function CardInlineForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (args: { chargeId: string; paymentUrl?: string }) => void;
  onCancel: () => void;
}) {
  const [cfg, setCfg] = useState<{
    payeeCode: string;
    environment: 'sandbox' | 'production';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [form, setForm] = useState<CardFormValues>({
    number: '',
    cvv: '',
    expiry: '',
    holderName: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/payments/token-config', {
          cache: 'no-store',
        });
        const data = await res.json();
        if (!cancelled && data.ok) {
          setCfg({ payeeCode: data.payeeCode, environment: data.environment });
        } else if (!cancelled) {
          setError(data.message || 'Configuração de token indisponível.');
        }
      } catch (err) {
        if (!cancelled) setError('Erro ao carregar configuração.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const detect = async () => {
      if (!form.number || form.number.replace(/\s|\./g, '').length < 6) return;
      try {
        const detected = await EfiPay.CreditCard.setCardNumber(
          form.number.replace(/\s|\./g, '')
        ).verifyCardBrand();
        setBrand(detected);
      } catch (e) {
        setBrand(null);
      }
    };
    detect();
  }, [form.number]);

  function parseExpiry(value: string): { month: string; year: string } | null {
    const digits = value.replace(/\D/g, '').slice(0, 4); // MMYY
    if (digits.length < 4) return null;
    const mm = digits.slice(0, 2);
    const yy = digits.slice(2, 4);
    const mNum = Number(mm);
    if (mNum < 1 || mNum > 12) return null;
    return { month: mm.padStart(2, '0'), year: `20${yy}` };
  }

  const canSubmit = useMemo(() => {
    const parsed = parseExpiry(form.expiry);
    return !!cfg?.payeeCode && !!form.number && !!form.cvv && !!parsed;
  }, [cfg, form.expiry, form.number, form.cvv]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cfg) {
      setError('Configuração indisponível.');
      return;
    }
    setLoading(true);
    try {
      const parsed = parseExpiry(form.expiry);
      if (!parsed) {
        setError('Validade inválida. Use MM/AA.');
        return;
      }
      const ccData: any = {
        brand: (brand || 'visa') as any,
        number: form.number.replace(/\s|\./g, ''),
        cvv: form.cvv,
        expirationMonth: parsed.month,
        expirationYear: parsed.year,
        reuse: false,
      };
      if (form.holderName) ccData.holderName = form.holderName;

      const result: any = await EfiPay.CreditCard.setAccount(cfg.payeeCode)
        .setEnvironment(cfg.environment)
        .setCreditCardData(ccData as any)
        .getPaymentToken();

      const res = await fetch('/api/payments/pay-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_token: result.payment_token,
          installments: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || 'Falha ao processar pagamento.');
      onSuccess({ chargeId: data.chargeId, paymentUrl: data.paymentUrl });
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-gray-700">
            Número do cartão
          </label>
          <input
            className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={form.number}
            onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          />
          {brand && (
            <p className="mt-1 text-[10px] text-gray-500">Bandeira: {brand}</p>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-700">
            Validade (MM/AA)
          </label>
          <input
            className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={form.expiry}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
              const formatted =
                raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
              setForm((f) => ({ ...f, expiry: formatted }));
            }}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-700">CVV</label>
          <input
            className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="000"
            value={form.cvv}
            onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-700">
            Nome impresso (opcional)
          </label>
          <input
            className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
            autoComplete="cc-name"
            value={form.holderName}
            onChange={(e) =>
              setForm((f) => ({ ...f, holderName: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs underline text-gray-900 hover:opacity-80"
        >
          Cancelar pagamento
        </button>
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-secondary disabled:opacity-60"
        >
          {loading ? 'Processando...' : 'Pagar com cartão'}
        </button>
      </div>
    </form>
  );
}
