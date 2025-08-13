'use client';

import { useEffect, useTransition, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { PaymentStateManager } from './usePaymentState';

interface UsePaymentDataOptions {
  state: PaymentStateManager;
  onProfileUpdate: (name: string, cpf: string, phone: string) => void;
}

export function usePaymentData({
  state,
  onProfileUpdate,
}: UsePaymentDataOptions) {
  const { data: session, status: sessionStatus } = useSession();
  const [isPending, startTransition] = useTransition();

  // Destructure primitives and stable setters to avoid using the unstable `state` object in deps
  const {
    currentTxid,
    phase,
    requiresProfile,
    setPhase,
    setRequiresProfile,
    setPaymentData,
    setPaymentStatus,
    setSelectedMethod,
    setError,
    loadState,
  } = state;

  const fetchPaymentData = useCallback(async () => {
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
          return;
        }

        setRequiresProfile(false);
        setPaymentData(data.paymentData);
        setPaymentStatus(data.status || 'pending');

        // If backend returns payment data, infer method and phase
        if (data.paymentData && data.status === 'pending') {
          const kind = data.paymentData.kind;
          if (kind === 'pix') setSelectedMethod('pix');
          if (kind === 'card') setSelectedMethod('credit');
          if (kind === 'boleto') setSelectedMethod('boleto');
          setPhase('pay');
        }

        if (data.status === 'paid') {
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
    }
  }, [
    currentTxid,
    setError,
    setPaymentData,
    setPaymentStatus,
    setPhase,
    setRequiresProfile,
    setSelectedMethod,
  ]);

  // Initialize state on mount
  useEffect(() => {
    const init = async () => {
      // Try to restore state from storage first
      const restored = loadState();
      if (!restored) {
        // If no state to restore, fetch fresh data
        await fetchPaymentData();
      }
    };
    init();
  }, [loadState, fetchPaymentData]);

  // Check user profile on session change
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/profile/check');
        if (response.ok) {
          const data = await response.json();
          if (data.isComplete && data.profile) {
            onProfileUpdate(
              data.profile.name || session.user.name || '',
              data.profile.cpf || '',
              data.profile.phone_number || ''
            );
            // Only auto-advance if backend didn't require profile completion
            // and we're still on the identification step to avoid overriding
            // an active payment flow restored from storage or server state
            if (data.profile.cpf && !requiresProfile && phase === 'identify') {
              setPhase('method');
            }
          }
        }
      } catch (err) {
        console.log('Profile check failed, proceeding with form:', err);
      }
    };

    if (session?.user && sessionStatus === 'authenticated') {
      checkUserProfile();
    }
  }, [
    session,
    sessionStatus,
    requiresProfile,
    phase,
    setPhase,
    onProfileUpdate,
  ]);

  const createPaymentFromProfile = async (
    txid: string,
    name: string,
    cpf: string
  ) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          state.setError(null);
          const response = await fetch('/api/payments/create-from-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid, name, cpf }),
          });

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: 'Erro ao criar pagamento.' }));
            throw new Error(errorData.message || 'Erro ao criar pagamento.');
          }

          const data = await response.json();
          if (data.success && data.paymentData) {
            state.setPaymentData(data.paymentData);
            state.setPhase('method');
            state.setRequiresProfile(false);

            if (data.newTxid) {
              state.setCurrentTxid(data.newTxid);
              const newUrl = `${window.location.pathname}?txid=${data.newTxid}`;
              window.history.replaceState({}, '', newUrl);
            }
            resolve();
          } else {
            throw new Error('Erro ao gerar pagamento.');
          }
        } catch (err) {
          console.error('Error creating payment:', err);
          const message =
            err instanceof Error
              ? err.message
              : 'Erro inesperado. Tente novamente.';
          state.setError(message);
          reject(err);
        }
      });
    });
  };

  const cancelPayment = useCallback(async () => {
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
  }, [currentTxid]);

  return {
    sessionStatus,
    isPending,
    fetchPaymentData,
    createPaymentFromProfile,
    cancelPayment,
  };
}
