'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { PaymentMethod } from '../types';

interface UsePaymentPollingOptions {
  txid: string;
  isActive: boolean;
  method: PaymentMethod;
  onStatusChange: (status: 'paid' | 'expired' | 'cancelled') => void;
  onError: (error: string) => void;
  onCancel: () => Promise<void>;
}

export function usePaymentPolling({
  txid,
  isActive,
  method,
  onStatusChange,
  onError,
  onCancel,
}: UsePaymentPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const checkPaymentStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/payments/status?txid=${txid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'paid') {
          onStatusChange('paid');
        } else if (data.status === 'expired') {
          onStatusChange('expired');
        } else if (data.status === 'cancelled') {
          onStatusChange('cancelled');
        }
      } else if (response.status === 404) {
        onStatusChange('cancelled');
        onError('Pagamento não encontrado ou foi cancelado.');
      } else {
        console.warn('Failed to check payment status:', response.status);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      // Don't set error state on network issues during polling
      // This prevents resetting the UI during temporary connectivity issues
    }
  }, [txid, onStatusChange, onError]);

  useEffect(() => {
    // Only poll when actively needed
    if (!isActive) return;

    const pollMs = method === 'boleto' ? 15000 : 5000;

    // Start polling
    intervalRef.current = setInterval(checkPaymentStatus, pollMs);

    // Set PIX timeout (6 minutes)
    if (method === 'pix') {
      timeoutRef.current = setTimeout(
        async () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onStatusChange('expired');
          onError('Tempo limite excedido. O pagamento expirou.');
          await onCancel();
        },
        5.5 * 60 * 1000
      );
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    txid,
    isActive,
    method,
    checkPaymentStatus,
    onCancel,
    onError,
    onStatusChange,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}
