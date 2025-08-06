'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface PaymentData {
  qrcodeImage: string;
  qrcodeText: string;
  txid: string;
}

interface PaymentConfirmationProps {
  txid: string;
}

type PaymentMethod = 'pix' | 'credit' | 'boleto';

type PaymentPhase = 'identify' | 'method' | 'pay'; // identify -> collect profile info, method -> choose, pay -> execute

export default function PaymentConfirmation({ txid }: PaymentConfirmationProps) {
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

  // Profile completion form data
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
  });
  const [formTouched, setFormTouched] = useState({
    name: false,
    cpf: false,
  });
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  // Initialize form with user data if available
  useEffect(() => {
    if (session?.user?.name) {
      setFormData(prev => ({ 
        ...prev, 
        name: session.user.name || '' 
      }));
    }
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
            // User profile is complete, skip to method selection
            setFormData({
              name: data.profile.name || session.user.name || '',
              cpf: data.profile.cpf || '',
            });
            if (data.profile.cpf) {
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
  }, [session, loading]);

  // CPF formatting function - improved version from profile form
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  // Form validation
  const isFormValid = useMemo(() => {
    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    return formData.name.trim().length >= 2 && cpfNumbers.length === 11;
  }, [formData.name, formData.cpf]);

  // Profile completion logic from the profile form
  const handleProfileSubmit = async () => {
    if (!isFormValid) {
      setError('Nome completo e CPF são obrigatórios.');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        
        // Update profile and create actual payment
        const response = await fetch('/api/payments/create-from-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txid: txid,
            name: formData.name,
            cpf: formData.cpf,
          }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Erro ao criar pagamento.' }));
          throw new Error(errorData.message || 'Erro ao criar pagamento.');
        }

        const data = await response.json();
        
        if (data.success && data.paymentData) {
          // Update payment data and move to payment phase
          setPaymentData(data.paymentData);
          setPhase('method');
          
          // Update URL with new txid if provided
          if (data.newTxid) {
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
      if (paymentStatus === 'pending') {
        navigator.sendBeacon('/api/payments/cancel', JSON.stringify({ txid }));
      }
    };

    const handlePopState = () => {
      if (paymentStatus === 'pending') {
        cancelPayment();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);

      if (paymentStatus === 'pending') {
        navigator.sendBeacon('/api/payments/cancel', JSON.stringify({ txid }));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txid, paymentStatus]);

  // Poll status while pending
  useEffect(() => {
    if (paymentStatus !== 'pending') return;

    const interval = setInterval(checkPaymentStatus, 5000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPaymentStatus('expired');
      setError('Tempo limite excedido. O pagamento expirou.');
      cancelPayment();
    }, 5.5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txid, paymentStatus]);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`/api/payments/status?txid=${txid}`);

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
        if (data.status === 'pending_profile') {
          setPhase('identify');
          setLoading(false);
          return;
        }
        
        setPaymentData(data.paymentData);
        setPaymentStatus(data.status || 'pending');

        if (data.status === 'paid') {
          setTimeout(() => {
            router.push('/billing?success=true');
          }, 2000);
        } else if (data.status === 'cancelled') {
          setError('O pagamento foi cancelado.');
          setTimeout(() => {
            router.push('/billing');
          }, 3000);
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
      const response = await fetch(`/api/payments/status?txid=${txid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'paid') {
          setPaymentStatus('paid');
          setTimeout(() => {
            router.push('/billing?success=true');
          }, 3000);
        } else if (data.status === 'expired') {
          setPaymentStatus('expired');
        } else if (data.status === 'cancelled') {
          setPaymentStatus('cancelled');
          setError('O pagamento foi cancelado.');
          setTimeout(() => {
            router.push('/billing');
          }, 3000);
        }
      } else if (response.status === 404) {
        setPaymentStatus('cancelled');
        setError('Pagamento não encontrado ou foi cancelado.');
        setTimeout(() => {
          router.push('/billing');
        }, 3000);
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
        body: JSON.stringify({ txid }),
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
        alert('Não foi possível copiar automaticamente. Copie manualmente a chave PIX.');
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
        <p className="text-sm text-gray-600">Carregando informações do pagamento...</p>
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M10.29 3.86l-7.5 12.99A2 2 0 004.5 20h15a2 2 0 001.71-3.15l-7.5-12.99a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-sm text-gray-900">Sessão expirada. Faça login novamente para continuar.</p>
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

  if (error) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-gray-900" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M10.29 3.86l-7.5 12.99A2 2 0 004.5 20h15a2 2 0 001.71-3.15l-7.5-12.99a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

  if (paymentStatus === 'paid') {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-900" viewBox="0 0 24 24" fill="none">
              <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Pagamento confirmado</h1>
          <p className="mt-1 text-sm text-gray-600">Sua assinatura foi ativada com sucesso.</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-4 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ID da Transação</span>
            <span className="font-mono text-gray-900">{txid}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-600">Redirecionando para o painel de faturamento...</p>
      </div>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-900" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Pagamento expirado</h1>
          <p className="mt-1 text-sm text-gray-600">O tempo para concluir o pagamento foi excedido.</p>
        </div>
        <button
          onClick={() => router.push('/billing')}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
        >
          Tentar novamente
        </button>
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
          <StepDot active={phase === 'pay'} done={false}>
            Pagamento
          </StepDot>
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Finalize seu pagamento</h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete seus dados, escolha o método e confirme sua assinatura.
        </p>
      </div>

      {/* Card container */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: profile completion and method selector */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile completion form */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-900" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zM4 22a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-sm font-medium">Informações pessoais</h2>
            </div>
            <div className="space-y-3">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-800">{error}</p>
                </div>
              )}
              
              {/* Nome */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-medium text-gray-700">
                  Nome completo *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={isPending || phase !== 'identify'}
                  value={formData.name}
                  onChange={handleNameChange}
                  onBlur={() => setFormTouched(prev => ({ ...prev, name: true }))}
                  placeholder="Seu nome completo"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                {formTouched.name && formData.name.trim().length < 2 && (
                  <p className="text-xs text-red-600">Nome deve ter pelo menos 2 caracteres.</p>
                )}
              </div>

              {/* CPF */}
              <div className="space-y-1">
                <label htmlFor="cpf" className="text-xs font-medium text-gray-700">
                  CPF *
                </label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  required
                  disabled={isPending || phase !== 'identify'}
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  onBlur={() => setFormTouched(prev => ({ ...prev, cpf: true }))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                {formTouched.cpf && formData.cpf.replace(/\D/g, '').length !== 11 && (
                  <p className="text-xs text-red-600">CPF deve ter 11 dígitos.</p>
                )}
              </div>

              <button
                disabled={!isFormValid || isPending}
                onClick={handleProfileSubmit}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-secondary transition-opacity disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90"
              >
                {isPending ? 'Salvando...' : 'Continuar'}
              </button>
              <p className="text-[11px] leading-4 text-gray-500">
                Seus dados são utilizados apenas para emissão e validação fiscal.
              </p>
            </div>
          </div>

          {/* Method selector */}
          <div className={`rounded-lg border bg-card p-4 ${phase === 'identify' ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-900" viewBox="0 0 24 24" fill="none">
                <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <h2 className="text-sm font-medium">Método de pagamento</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <MethodButton
                label="PIX"
                desc="Aprovação instantânea"
                active={selectedMethod === 'pix'}
                onClick={() => {
                  setSelectedMethod('pix');
                  setPhase('pay');
                }}
                icon={
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                    <path d="M7.05 7.05L12 2.1l4.95 4.95L12 12 7.05 7.05zM12 12l4.95 4.95L12 21.9l-4.95-4.95L12 12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
              />
              <MethodButton
                label="Cartão"
                desc="Crédito ou débito"
                active={selectedMethod === 'credit'}
                onClick={() => {
                  setSelectedMethod('credit');
                  setPhase('pay');
                }}
                icon={
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                }
              />
              <MethodButton
                label="Boleto"
                desc="Até 3 dias úteis"
                active={selectedMethod === 'boleto'}
                onClick={() => {
                  setSelectedMethod('boleto');
                  setPhase('pay');
                }}
                icon={
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M8 7v10M12 7v10M16 7v10" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                }
              />
            </div>
          </div>

          {/* Meta info */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">ID da Transação</span>
              <span className="font-mono text-gray-900">{txid}</span>
            </div>
          </div>
        </div>

        {/* Right: dynamic content */}
        <div className="lg:col-span-2">
          <div className={`rounded-lg border bg-card p-6 min-h-[340px] ${phase === 'identify' ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Phase: Method guidance */}
            {phase === 'method' && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <svg className="h-10 w-10 text-gray-900" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <h3 className="mt-3 text-base font-medium">Selecione o método</h3>
                <p className="mt-1 max-w-sm text-sm text-gray-600">
                  Escolha como deseja realizar o pagamento para avançar.
                </p>
              </div>
            )}

            {/* Phase: Pay */}
            {phase === 'pay' && (
              <>
                {selectedMethod === 'pix' && (
                  <div className="space-y-6">
                    <StatusBar text="Aguardando pagamento via PIX" />
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={async () => {
                          await cancelPayment();
                          setPaymentStatus('cancelled');
                          router.push('/billing');
                        }}
                        className="text-xs underline text-gray-900 hover:opacity-80"
                      >
                        Cancelar pagamento
                      </button>
                      <span className="text-xs text-gray-600">Válido por ~6 minutos</span>
                    </div>

                    {paymentData ? (
                      <>
                        {/* QR */}
                        <div className="text-center">
                          <div className="inline-block rounded-lg border bg-background p-4">
                            <img
                              src={`data:image/png;base64,${paymentData.qrcodeImage}`}
                              alt="QR Code PIX"
                              className="h-64 w-64"
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-600">Escaneie com o app do seu banco</p>
                        </div>

                        {/* Copy */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Ou copie a chave PIX</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={paymentData.qrcodeText}
                              readOnly
                              className="flex-1 rounded-md border bg-gray-50 px-3 py-2 font-mono text-xs text-gray-900"
                            />
                            <button
                              onClick={() => copyToClipboard(paymentData.qrcodeText)}
                              className={`rounded-md px-3 py-2 text-sm transition-opacity ${
                                copySuccess ? 'bg-gray-900 text-white' : 'bg-primary text-secondary hover:opacity-90'
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

                    {/* Subtext */}
                    <div className="text-center">
                      <p className="text-xs text-gray-600">
                        A confirmação ocorre automaticamente assim que o pagamento for processado.
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod === 'credit' && (
                  <PlaceholderPanel
                    title="Pagamento com Cartão"
                    description="Em breve. Enquanto isso, você pode concluir via PIX para aprovação imediata."
                    cta="Usar PIX"
                    onClick={() => setSelectedMethod('pix')}
                    icon={
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-gray-900" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.2"/>
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
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-gray-900" fill="none">
                        <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M8 7v10M12 7v10M16 7v10" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* UI Subcomponents */

function StepDot({
  children,
  active,
  done,
}: {
  children: React.ReactNode;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={[
          'flex h-6 w-6 items-center justify-center rounded-full border',
          active ? 'border-gray-900' : 'border-gray-300',
          done ? 'bg-gray-900 text-white' : active ? 'bg-white text-gray-900' : 'bg-white text-gray-400',
        ].join(' ')}
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
          {done ? (
            <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
          )}
        </svg>
      </div>
      <span className="text-xs text-gray-700">{children}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px flex-1 bg-gray-200" />;
}

function MethodButton({
  label,
  desc,
  active,
  onClick,
  icon,
}: {
  label: string;
  desc: string;
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'group flex items-center gap-3 rounded-md border p-3 text-left transition-colors',
        active ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-900',
      ].join(' ')}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-900">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-600">{desc}</div>
      </div>
      <svg className="h-4 w-4 text-gray-900 opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none">
        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function StatusBar({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-3">
      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-900" />
      <span className="text-xs font-medium text-gray-900">{text}</span>
    </div>
  );
}

function PlaceholderPanel({
  title,
  description,
  cta,
  onClick,
  icon,
}: {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-gray-50">
        {icon}
      </div>
      <h3 className="text-base font-medium">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-gray-600">{description}</p>
      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
      >
        {cta}
      </button>
    </div>
  );
}