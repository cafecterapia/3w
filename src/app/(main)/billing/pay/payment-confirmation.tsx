'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { PaymentData, PaymentMethod, PaymentPhase } from './types';
import { StepDot, Divider, PlaceholderPanel } from './components/ui';
import {
  IdentifyForm,
  type IdentifyFormValues,
} from './components/IdentifyForm';
import { MethodSelector } from './components/MethodSelector';
import { PixPaymentPanel } from './components/PixPaymentPanel';

interface PaymentConfirmationProps {
  txid: string;
}

export default function PaymentConfirmation({
  txid,
}: PaymentConfirmationProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'paid' | 'expired' | 'cancelled'
  >('pending');

  const [phase, setPhase] = useState<PaymentPhase>('identify');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [copySuccess, setCopySuccess] = useState(false);

  // Track if this flow requires profile completion (txid is temp_ and backend returned pending_profile)
  const [requiresProfile, setRequiresProfile] = useState(false);

  // Initial values for Identify form
  const [initialName, setInitialName] = useState('');
  const [initialCpf, setInitialCpf] = useState('');
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  // Track current txid locally so we can update it after creating the real charge
  const [currentTxid, setCurrentTxid] = useState(txid);
  useEffect(() => {
    setCurrentTxid(txid);
  }, [txid]);

  // Initialize form with user data if available
  useEffect(() => {
    if (session?.user?.name) setInitialName(session.user.name || '');
  }, [session]);

  // Check if user already has complete profile info
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/profile/check');
        if (response.ok) {
          const data = await response.json();
          if (data.isComplete && data.profile) {
            // Prefill but only auto-advance if backend did NOT require profile completion
            setInitialName(data.profile.name || session.user.name || '');
            setInitialCpf(data.profile.cpf || '');
            if (data.profile.cpf && !requiresProfile) {
              setPhase('method');
            }
          }
        }
      } catch (err) {
        console.log('Profile check failed, proceeding with form:', err);
      }
    };

    if (session?.user && !loading) {
      checkUserProfile();
    }
  }, [session, loading, requiresProfile]);

  // Handle profile submit from IdentifyForm
  const onIdentifySubmit = async (values: IdentifyFormValues) => {
    // If backend did not signal a pending_profile flow, do not call create-from-profile
    if (!requiresProfile) {
      setError(null);
      try {
        await fetch('/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: values.name, cpf: values.cpf }),
        });
      } catch {
        // ignore non-critical
      }
      setInitialName(values.name);
      setInitialCpf(values.cpf);
      setPhase('method');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const response = await fetch('/api/payments/create-from-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txid, name: values.name, cpf: values.cpf }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Erro ao criar pagamento.' }));
          throw new Error(errorData.message || 'Erro ao criar pagamento.');
        }

        const data = await response.json();
        if (data.success && data.paymentData) {
          setPaymentData(data.paymentData);
          setPhase('method');
          setRequiresProfile(false);
          // Persist profile as well to ensure prefill on return
          try {
            await fetch('/api/profile/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: values.name, cpf: values.cpf }),
            });
          } catch {}
          // Update local initial values for immediate UI consistency
          setInitialName(values.name);
          setInitialCpf(values.cpf);
          if (data.newTxid) {
            setCurrentTxid(data.newTxid);
            const newUrl = `${window.location.pathname}?txid=${data.newTxid}`;
            window.history.replaceState({}, '', newUrl);
          }
        } else {
          throw new Error('Erro ao gerar pagamento.');
        }
      } catch (err) {
        console.error('Error creating payment:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Erro inesperado. Tente novamente.'
        );
      }
    });
  };

  useEffect(() => {
    // Pre-fetch payment data so it's ready when they enter "pay" phase
    fetchPaymentData();

    const handleBeforeUnload = () => {
      // Only attempt cancel if we are on the pay phase and still pending
      if (phase === 'pay' && paymentStatus === 'pending') {
        navigator.sendBeacon(
          '/api/payments/cancel',
          JSON.stringify({ txid: currentTxid })
        );
      }
    };

    const handlePopState = () => {
      if (phase === 'pay' && paymentStatus === 'pending') {
        cancelPayment();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      // Intentionally do not cancel on React effect cleanup to avoid false cancels on internal phase changes
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTxid, paymentStatus, phase]);

  // Poll status while pending
  useEffect(() => {
    // Only poll when user is in pay phase to avoid background polling during form/method
    if (phase !== 'pay' || paymentStatus !== 'pending') return;

    const interval = setInterval(checkPaymentStatus, 5000);
    const timeout = setTimeout(
      () => {
        clearInterval(interval);
        setPaymentStatus('expired');
        setError('Tempo limite excedido. O pagamento expirou.');
        cancelPayment();
      },
      5.5 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTxid, paymentStatus, phase]);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`/api/payments/status?txid=${currentTxid}`);

      if (!response.ok) {
        if (response.status === 404) {
          setPaymentStatus('cancelled');
          setError('Pagamento não encontrado, cancelado ou expirado.');
        } else if (response.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else {
          setError('Erro ao carregar informações do pagamento.');
        }
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Handle pending profile completion
        if (
          data.status === 'pending_profile' ||
          data.requiresProfileCompletion
        ) {
          setRequiresProfile(true);
          setPhase('identify');
          setLoading(false);
          return;
        }

        setRequiresProfile(false);
        setPaymentData(data.paymentData);
        setPaymentStatus(data.status || 'pending');

        if (data.status === 'paid') {
          // Stay on page and show thank-you state within the card
          setPaymentStatus('paid');
        } else if (data.status === 'cancelled') {
          setError('O pagamento foi cancelado.');
        }
      } else {
        setError(data.message || 'Failed to load payment information');
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/status?txid=${currentTxid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'paid') {
          setPaymentStatus('paid');
        } else if (data.status === 'expired') {
          setPaymentStatus('expired');
        } else if (data.status === 'cancelled') {
          setPaymentStatus('cancelled');
          setError('O pagamento foi cancelado.');
        }
      } else if (response.status === 404) {
        setPaymentStatus('cancelled');
        setError('Pagamento não encontrado ou foi cancelado.');
      } else {
        console.warn('Failed to check payment status:', response.status);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  const cancelPayment = async () => {
    try {
      const response = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: currentTxid }),
      });
      if (response.ok) {
        console.log('Payment cancelled successfully');
      }
    } catch (err) {
      console.error('Error cancelling payment:', err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert(
          'Não foi possível copiar automaticamente. Copie manualmente a chave PIX.'
        );
      }
      document.body.removeChild(textArea);
    }
  };

  // Phases UI

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <span className="absolute inset-0 rounded-full border-2 border-gray-200"></span>
          <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
        </div>
        <p className="text-sm text-gray-600">
          Carregando informações do pagamento...
        </p>
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border bg-gray-50 p-4">
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
            <div>
              <p className="text-sm text-gray-900">
                Sessão expirada. Faça login novamente para continuar.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (error && paymentStatus !== 'paid') {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border bg-gray-50 p-4">
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
            <div>
              <p className="text-sm text-gray-900">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.push('/billing')}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
          >
            Voltar para Faturamento
          </button>
        </div>
      </div>
    );
  }

  // Main layout
  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <StepDot active={phase === 'identify'} done={phase !== 'identify'}>
            Identificação
          </StepDot>
          <Divider />
          <StepDot active={phase === 'method'} done={phase === 'pay'}>
            Método
          </StepDot>
          <Divider />
          <StepDot active={phase === 'pay'} done={paymentStatus === 'paid'}>
            Pagamento
          </StepDot>
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Finalize seu pagamento
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete seus dados, escolha o método e confirme sua assinatura.
        </p>
      </div>

      {/* Card container */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: profile completion */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border bg-card p-4">
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
              {phase !== 'identify' && (
                <button
                  type="button"
                  onClick={() => setPhase('identify')}
                  className="text-xs underline text-gray-900 hover:opacity-80"
                >
                  Editar
                </button>
              )}
            </div>
            <IdentifyForm
              initialName={initialName}
              initialCpf={initialCpf}
              disabled={phase !== 'identify'}
              error={error}
              isPending={isPending}
              onSubmit={onIdentifySubmit}
              // hide duplicate header since we render one here
              showHeader={false}
            />
          </div>

          {/* Meta info with responsive txid */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="shrink-0 text-gray-600">ID da Transação</span>
              <span className="flex-1 font-mono text-gray-900 break-all text-right md:truncate">
                {currentTxid}
              </span>
            </div>
          </div>
        </div>

        {/* Right: unified card with method + pay + result */}
        <div className="lg:col-span-2">
          <MethodSelector
            selected={selectedMethod}
            disabled={phase === 'identify'}
            onSelect={(m) => {
              setSelectedMethod(m);
              setPhase('pay');
            }}
          >
            {/* Inner content area (compact, integrated) */}
            <div
              className={`mt-4 border-t pt-4 ${phase === 'method' ? 'opacity-60' : ''}`}
            >
              {/* Show contextual content depending on phase and status */}
              {phase === 'method' && (
                <div className="flex h-full flex-col items-center justify-center text-center py-10">
                  <svg
                    className="h-10 w-10 text-gray-900"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 6v12M6 12h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <h3 className="mt-3 text-base font-medium">
                    Selecione o método
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-gray-600">
                    Escolha como deseja realizar o pagamento para avançar.
                  </p>
                </div>
              )}

              {phase === 'pay' && paymentStatus === 'pending' && (
                <>
                  {selectedMethod === 'pix' && (
                    <PixPaymentPanel
                      paymentData={paymentData}
                      copySuccess={copySuccess}
                      onCopy={copyToClipboard}
                      onCancel={async () => {
                        await cancelPayment();
                        setPaymentStatus('cancelled');
                        router.push('/billing');
                      }}
                      paymentStatus={paymentStatus}
                    />
                  )}

                  {selectedMethod === 'credit' && (
                    <PlaceholderPanel
                      title="Pagamento com Cartão"
                      description="Em breve. Enquanto isso, você pode concluir via PIX para aprovação imediata."
                      cta="Usar PIX"
                      onClick={() => setSelectedMethod('pix')}
                      icon={
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6 text-gray-900"
                          fill="none"
                        >
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
                  )}

                  {selectedMethod === 'boleto' && (
                    <PlaceholderPanel
                      title="Pagamento com Boleto"
                      description="Em breve. Enquanto isso, você pode concluir via PIX para aprovação imediata."
                      cta="Usar PIX"
                      onClick={() => setSelectedMethod('pix')}
                      icon={
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6 text-gray-900"
                          fill="none"
                        >
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
                  )}
                </>
              )}

              {paymentStatus === 'paid' && (
                <div className="text-center py-10">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-8 w-8 text-gray-900"
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
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Obrigado pelo pagamento!
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Sua assinatura foi ativada com sucesso.
                  </p>
                  <div className="mt-4 rounded-lg border bg-gray-50 px-3 py-2 text-left w-full">
                    <div className="flex w-full items-start justify-between gap-3 text-sm">
                      <span className="shrink-0 text-gray-600">ID</span>
                      <span className="flex-1 font-mono text-gray-900 break-all md:truncate text-left">
                        {currentTxid}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/billing?success=true')}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {paymentStatus === 'expired' && (
                <div className="text-center py-10">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-8 w-8 text-gray-900"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Pagamento expirado
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    O tempo para concluir o pagamento foi excedido.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/billing')}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
                    >
                      Voltar ao faturamento
                    </button>
                  </div>
                </div>
              )}

              {paymentStatus === 'cancelled' && (
                <div className="text-center py-10">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-8 w-8 text-gray-900"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Pagamento cancelado
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Você pode tentar novamente quando desejar.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/billing')}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Non-immediate payments (fallback message when pending but user left card) */}
              {false &&
                phase === 'pay' &&
                paymentStatus === 'pending' &&
                selectedMethod !== 'pix' && (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium">Quase lá!</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Assim que confirmarmos o pagamento, você será notificado.
                      Você pode continuar.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/billing')}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </MethodSelector>
        </div>
      </div>
    </div>
  );
}
