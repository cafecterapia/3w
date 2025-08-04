'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { usePaymentManagement } from './payment-management-provider';

interface PaymentManagementContentProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function PaymentManagementContent({ userName, userEmail }: PaymentManagementContentProps) {
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

  const [showAddCard, setShowAddCard] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const defaultPaymentMethod = paymentMethods.find(method => method.isDefault);

  const getBrandIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return (
          <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">VISA</span>
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">MC</span>
          </div>
        );
      default:
        return (
          <div className="w-10 h-6 bg-gray-600 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Método de Pagamento Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {defaultPaymentMethod ? (
              <div className="border border-border rounded-lg p-4 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• {defaultPaymentMethod.last4}</p>
                      <p className="text-sm text-accent">
                        {defaultPaymentMethod.brand?.charAt(0).toUpperCase()}{defaultPaymentMethod.brand?.slice(1)} •{' '}
                        Expira {defaultPaymentMethod.expiryMonth?.toString().padStart(2, '0')}/{defaultPaymentMethod.expiryYear?.toString().slice(-2)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${
                    defaultPaymentMethod.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {defaultPaymentMethod.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-border rounded-lg p-4 bg-muted/20 text-center">
                <p className="text-accent">Nenhum método de pagamento principal configurado</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar Cartão'}
              </button>
              <button 
                onClick={() => setShowAddCard(true)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
                disabled={isUpdating}
              >
                Adicionar Novo Cartão
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className={`flex items-center justify-between p-4 border border-border rounded-lg ${!method.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                  {getBrandIcon(method.brand)}
                  <div>
                    <p className="font-medium">•••• {method.last4}</p>
                    <p className="text-sm text-accent">
                      {method.expiryMonth && method.expiryYear ? 
                        `Expira ${method.expiryMonth.toString().padStart(2, '0')}/${method.expiryYear.toString().slice(-2)}` :
                        'Sem data de expiração'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-800">
                      Principal
                    </span>
                  )}
                  {!method.isActive && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-800">
                      Expirado
                    </span>
                  )}
                  <div className="flex gap-2">
                    {!method.isDefault && method.isActive && (
                      <button 
                        onClick={() => setDefaultPaymentMethod(method.id)}
                        className="text-sm text-accent hover:text-foreground disabled:opacity-50"
                        disabled={isUpdating}
                      >
                        Tornar Principal
                      </button>
                    )}
                    <button 
                      onClick={() => removePaymentMethod(method.id)}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      disabled={isUpdating || method.isDefault}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new payment method */}
            <button 
              onClick={() => setShowAddCard(true)}
              className="w-full p-4 border-2 border-dashed border-border rounded-lg text-accent hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              disabled={isUpdating}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Adicionar Novo Método de Pagamento
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Cobrança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-accent mb-2">
                Nome no Cartão
              </label>
              <div className="p-3 border border-border rounded-md bg-muted text-sm">
                {billingInfo?.name || userName || 'Não informado'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-accent mb-2">
                E-mail de Cobrança
              </label>
              <div className="p-3 border border-border rounded-md bg-muted text-sm">
                {billingInfo?.email || userEmail || 'Não informado'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-accent mb-2">
                CPF
              </label>
              <div className="p-3 border border-border rounded-md bg-muted text-sm">
                {billingInfo?.cpf || '000.000.000-00'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-accent mb-2">
                Telefone
              </label>
              <div className="p-3 border border-border rounded-md bg-muted text-sm">
                {billingInfo?.phone || 'Não informado'}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50" disabled={isUpdating}>
              Atualizar Informações de Cobrança
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Security & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança e Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium">Notificações de Pagamento</p>
                <p className="text-sm text-accent">
                  Receba alertas sobre cobranças e renovações
                </p>
              </div>
              <button 
                onClick={() => updatePaymentSettings({ emailNotifications: !paymentSettings.emailNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  paymentSettings.emailNotifications ? 'bg-primary' : 'bg-muted'
                } disabled:opacity-50`}
                disabled={isUpdating}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  paymentSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium">Renovação Automática</p>
                <p className="text-sm text-accent">
                  Renove automaticamente sua assinatura
                </p>
              </div>
              <button 
                onClick={() => updatePaymentSettings({ autoRenewal: !paymentSettings.autoRenewal })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  paymentSettings.autoRenewal ? 'bg-primary' : 'bg-muted'
                } disabled:opacity-50`}
                disabled={isUpdating}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  paymentSettings.autoRenewal ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium">Recibos por E-mail</p>
                <p className="text-sm text-accent">
                  Envie recibos de pagamento por e-mail
                </p>
              </div>
              <button 
                onClick={() => updatePaymentSettings({ emailReceipts: !paymentSettings.emailReceipts })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  paymentSettings.emailReceipts ? 'bg-primary' : 'bg-muted'
                } disabled:opacity-50`}
                disabled={isUpdating}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  paymentSettings.emailReceipts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Quick View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico Recente</CardTitle>
            <a
              href="/billing"
              className="text-sm text-accent hover:text-foreground hover:underline underline-offset-4"
            >
              Ver tudo
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentHistory.slice(0, 3).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    payment.status === 'paid' ? 'bg-green-500' :
                    payment.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium">{formatDate(payment.date)}</p>
                    <p className="text-xs text-accent">{payment.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                  <p className={`text-xs ${getPaymentStatusColor(payment.status)}`}>
                    {getPaymentStatusText(payment.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support & Help */}
      <Card className="border border-border bg-secondary/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-2">Precisa de ajuda com pagamentos?</h3>
              <p className="text-sm text-accent mb-4">
                Nossa equipe de suporte está disponível para ajudar com questões de pagamento,
                cobrança e problemas técnicos.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/support"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-secondary hover:opacity-90"
                >
                  Falar com Suporte
                </a>
                <a
                  href="/support#faq-pagamentos"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  FAQ Pagamentos
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
