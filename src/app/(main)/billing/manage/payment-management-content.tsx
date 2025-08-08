'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { usePaymentManagement } from './payment-management-provider';

interface PaymentManagementContentProps {
  userName?: string | null;
  userEmail?: string | null;
}

type MethodTab = 'pix' | 'cards' | 'boleto';

export function PaymentManagementContent({
  userName,
  userEmail,
}: PaymentManagementContentProps) {
  const {
    paymentMethods,
    billingInfo,
    paymentSettings,
    paymentHistory,
    isLoading,
    isUpdating,
    error,
    setDefaultPaymentMethod,
    removePaymentMethod,
    updatePaymentSettings,
    clearError,
  } = usePaymentManagement();

  const [activeTab, setActiveTab] = useState<MethodTab>('pix');
  const [showAddCard, setShowAddCard] = useState(false);

  const defaultPaymentMethod = useMemo(
    () => paymentMethods.find((m) => m.isDefault),
    [paymentMethods]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount / 100);

  const formatMonth = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: 'long' }).format(
      date
    );

  const statusPill = (status: string) => {
    switch (status) {
      case 'paid':
        return { text: 'Pago', color: 'text-gray-900', dot: 'bg-gray-900' };
      case 'pending':
        return { text: 'Pendente', color: 'text-gray-600', dot: 'bg-gray-400' };
      case 'failed':
        return { text: 'Falhou', color: 'text-gray-600', dot: 'bg-gray-400' };
      case 'cancelled':
        return {
          text: 'Cancelado',
          color: 'text-gray-600',
          dot: 'bg-gray-400',
        };
      default:
        return { text: status, color: 'text-gray-600', dot: 'bg-gray-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 w-1/3 rounded bg-gray-100"></div>
                <div className="h-3 w-2/3 rounded bg-gray-100"></div>
                <div className="h-20 w-full rounded bg-gray-100"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert */}
      {error && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-gray-900"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86l-7.5 12.99A2 2 0 004.5 20h15a2 2 0 001.71-3.15l-7.5-12.99a2 2 0 00-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-gray-900">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-sm text-gray-900 hover:opacity-80"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Overview header */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-900"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3 7h18M3 12h18M3 17h18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Métodos de pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-2">
              <TabButton
                label="PIX"
                active={activeTab === 'pix'}
                onClick={() => setActiveTab('pix')}
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
              <TabButton
                label="Cartões"
                active={activeTab === 'cards'}
                onClick={() => setActiveTab('cards')}
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
                    <path
                      d="M3 10h18"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                }
              />
              <TabButton
                label="Boleto"
                active={activeTab === 'boleto'}
                onClick={() => setActiveTab('boleto')}
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

            <div className="mt-6">
              {activeTab === 'pix' && <PixPanel />}
              {activeTab === 'cards' && (
                <CardsPanel
                  methods={paymentMethods}
                  isUpdating={isUpdating}
                  setDefault={setDefaultPaymentMethod}
                  remove={removePaymentMethod}
                  defaultMethodId={defaultPaymentMethod?.id}
                  onAdd={() => setShowAddCard(true)}
                />
              )}
              {activeTab === 'boleto' && <BoletoPanel />}
            </div>
          </CardContent>
        </Card>

        {/* Primary method + quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-900"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20 7L9 18l-5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Método principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {defaultPaymentMethod ? (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BrandBadge brand={defaultPaymentMethod.brand} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        •••• •••• •••• {defaultPaymentMethod.last4}
                      </p>
                      <p className="text-xs text-gray-600">
                        Expira{' '}
                        {defaultPaymentMethod.expiryMonth
                          ?.toString()
                          .padStart(2, '0')}
                        /{defaultPaymentMethod.expiryYear?.toString().slice(-2)}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border px-2.5 py-1 text-xs text-gray-900">
                    Ativo
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">
                  Nenhum método principal definido.
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm text-gray-900 hover:opacity-80 disabled:opacity-50"
                disabled={isUpdating}
              >
                Atualizar cartão
              </button>
              <button
                onClick={() => setShowAddCard(true)}
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-secondary hover:opacity-90 disabled:opacity-50"
                disabled={isUpdating}
              >
                Adicionar novo cartão
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing and security */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-900"
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
              Informações de cobrança
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Nome no Cartão"
                value={billingInfo?.name || userName || 'Não informado'}
              />
              <Field
                label="E-mail de Cobrança"
                value={billingInfo?.email || userEmail || 'Não informado'}
              />
              <Field label="CPF" value={billingInfo?.cpf || '000.000.000-00'} />
              <Field
                label="Telefone"
                value={billingInfo?.phone || 'Não informado'}
              />
            </div>
            <div className="mt-6">
              <button
                className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm text-gray-900 hover:opacity-80 disabled:opacity-50"
                disabled={isUpdating}
              >
                Atualizar informações
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-900"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 3l8 4v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7l8-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              Segurança e configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              title="Notificações de pagamento"
              description="Receba alertas sobre cobranças e renovações"
              enabled={paymentSettings.emailNotifications}
              onToggle={() =>
                updatePaymentSettings({
                  emailNotifications: !paymentSettings.emailNotifications,
                })
              }
              disabled={isUpdating}
            />
            <ToggleRow
              title="Renovação automática"
              description="Renove automaticamente sua assinatura"
              enabled={paymentSettings.autoRenewal}
              onToggle={() =>
                updatePaymentSettings({
                  autoRenewal: !paymentSettings.autoRenewal,
                })
              }
              disabled={isUpdating}
            />
            <ToggleRow
              title="Recibos por e-mail"
              description="Receba seus comprovantes por e-mail"
              enabled={paymentSettings.emailReceipts}
              onToggle={() =>
                updatePaymentSettings({
                  emailReceipts: !paymentSettings.emailReceipts,
                })
              }
              disabled={isUpdating}
            />
          </CardContent>
        </Card>
      </div>

      {/* History and support */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-900"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M8 7h13M8 12h13M8 17h13M3 7h.01M3 12h.01M3 17h.01"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Histórico recente
              </CardTitle>
              <a
                href="/billing"
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline underline-offset-4"
              >
                Ver tudo
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {paymentHistory.slice(0, 5).map((p) => {
              const status = statusPill(p.status);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatMonth(p.date)}
                      </p>
                      <p className="text-xs text-gray-600">{p.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(p.amount)}
                    </p>
                    <p className={`text-xs ${status.color}`}>{status.text}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-white">
                <svg
                  className="h-5 w-5 text-gray-900"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 18h.01M12 6v8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Precisa de ajuda?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Suporte para pagamentos, cobranças e questões técnicas.
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href="/support"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-secondary hover:opacity-90"
                  >
                    Falar com suporte
                  </a>
                  <a
                    href="/support#faq-pagamentos"
                    className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm text-gray-900 hover:opacity-80"
                  >
                    FAQ pagamentos
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Card Modal (placeholder structure) */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Adicionar novo cartão
              </h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-sm text-gray-900 hover:opacity-80"
              >
                Fechar
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <Input placeholder="Nome no cartão" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input placeholder="Número do cartão" />
                <Input placeholder="CVC" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input placeholder="MM/AA" />
                <Input placeholder="CPF" />
              </div>
              <button className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-secondary hover:opacity-90">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Panels */

function PixPanel() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-gray-900"
            fill="none"
          >
            <path
              d="M7.05 7.05L12 2.1l4.95 4.95L12 12 7.05 7.05zM12 12l4.95 4.95L12 21.9l-4.95-4.95L12 12z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="text-sm font-medium text-gray-900">PIX</h3>
        </div>
        <span className="rounded-full border px-2.5 py-1 text-xs text-gray-900">
          Principal
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <p className="text-sm text-gray-600">
          Configure e gerencie pagamentos via PIX. Aprovação imediata e
          confirmação automática.
        </p>
        <div className="rounded-md border bg-gray-50 p-3 text-xs text-gray-700">
          Use PIX como forma padrão de pagamento para novas cobranças quando
          disponível.
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-secondary hover:opacity-90">
          Ver instruções PIX
        </button>
        <button className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm text-gray-900 hover:opacity-80">
          Gerenciar chaves
        </button>
      </div>
    </div>
  );
}

function CardsPanel({
  methods,
  isUpdating,
  setDefault,
  remove,
  defaultMethodId,
  onAdd,
}: {
  methods: Array<{
    id: string;
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    isActive: boolean;
  }>;
  isUpdating: boolean;
  setDefault: (id: string) => void;
  remove: (id: string) => void;
  defaultMethodId?: string;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3">
      {methods.length === 0 && (
        <div className="rounded-lg border p-4 text-sm text-gray-600">
          Nenhum cartão cadastrado.
        </div>
      )}
      {methods.map((m) => (
        <div
          key={m.id}
          className={`flex items-center justify-between rounded-lg border p-3 ${!m.isActive ? 'opacity-60' : ''}`}
        >
          <div className="flex items-center gap-3">
            <BrandBadge brand={m.brand} />
            <div>
              <p className="text-sm font-medium text-gray-900">
                •••• •••• •••• {m.last4}
              </p>
              <p className="text-xs text-gray-600">
                {m.expiryMonth && m.expiryYear
                  ? `Expira ${m.expiryMonth.toString().padStart(2, '0')}/${m.expiryYear.toString().slice(-2)}`
                  : 'Sem data de expiração'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {m.isDefault && (
              <span className="rounded-full border px-2.5 py-1 text-xs text-gray-900">
                Principal
              </span>
            )}
            {!m.isDefault && m.isActive && (
              <button
                onClick={() => setDefault(m.id)}
                className="text-xs text-gray-900 hover:opacity-80 disabled:opacity-50"
                disabled={isUpdating}
              >
                Tornar principal
              </button>
            )}
            <button
              onClick={() => remove(m.id)}
              className="text-xs text-gray-900 hover:opacity-80 disabled:opacity-50"
              disabled={isUpdating || m.id === defaultMethodId}
            >
              Remover
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-sm text-gray-900 hover:opacity-80 disabled:opacity-50"
        disabled={isUpdating}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 6v12M6 12h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Adicionar novo cartão
      </button>
    </div>
  );
}

function BoletoPanel() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-900" fill="none">
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
        <h3 className="text-sm font-medium text-gray-900">Boleto</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Pagamentos por boleto podem levar até 3 dias úteis para compensação.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-secondary hover:opacity-90">
          Gerar boleto
        </button>
        <button className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm text-gray-900 hover:opacity-80">
          Instruções
        </button>
      </div>
    </div>
  );
}

/* UI Elements */

function BrandBadge({ brand }: { brand?: string }) {
  const b = (brand || '').toLowerCase();
  if (b === 'visa') {
    return (
      <div className="inline-flex h-8 w-12 items-center justify-center rounded-md border bg-white text-gray-900">
        <svg viewBox="0 0 48 16" className="h-3" fill="none">
          <path d="M2 13h6l2-10H4L2 13z" fill="currentColor" />
          <rect x="12" y="3" width="8" height="10" rx="1" fill="currentColor" />
        </svg>
      </div>
    );
  }
  if (b === 'mastercard') {
    return (
      <div className="inline-flex h-8 w-12 items-center justify-center rounded-md border bg-white text-gray-900">
        <svg viewBox="0 0 48 16" className="h-3" fill="none">
          <circle cx="20" cy="8" r="4" fill="currentColor" />
          <circle cx="26" cy="8" r="4" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    );
  }
  return (
    <div className="inline-flex h-8 w-12 items-center justify-center rounded-md border bg-white text-gray-900">
      <svg viewBox="0 0 24 16" className="h-4" fill="none">
        <rect x="1" y="2" width="22" height="12" rx="2" stroke="currentColor" />
        <path d="M3 6h18" stroke="currentColor" />
      </svg>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
        active
          ? 'border-gray-900 bg-gray-50 text-gray-900'
          : 'border-gray-200 text-gray-700 hover:border-gray-900',
      ].join(' ')}
    >
      <span className="text-gray-900">{icon}</span>
      {label}
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs text-gray-600">{label}</div>
      <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
  disabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-gray-900' : 'bg-gray-200'
        } disabled:opacity-50`}
        disabled={disabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-md border bg-background px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
        'outline-none focus:border-gray-900',
        props.className || '',
      ].join(' ')}
    />
  );
}
