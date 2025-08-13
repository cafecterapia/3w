'use client';

import { useState, useCallback } from 'react';
import type { PaymentMethod, PaymentPhase, PaymentData } from '../types';

export interface PaymentStateManager {
  // State
  phase: PaymentPhase;
  selectedMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'expired' | 'cancelled';
  paymentData: PaymentData | null;
  error: string | null;
  requiresProfile: boolean;
  currentTxid: string;
  copySuccess: boolean;

  // Actions
  setPhase: (phase: PaymentPhase) => void;
  setSelectedMethod: (method: PaymentMethod) => void;
  setPaymentStatus: (
    status: 'pending' | 'paid' | 'expired' | 'cancelled'
  ) => void;
  setPaymentData: (data: PaymentData | null) => void;
  setError: (error: string | null) => void;
  setRequiresProfile: (requires: boolean) => void;
  setCurrentTxid: (txid: string) => void;
  setCopySuccess: (success: boolean) => void;

  // Persistence
  saveState: () => void;
  loadState: () => boolean;
  clearState: () => void;
}

const STORAGE_KEY = 'billing.pay.flow';

type Persisted = {
  txid: string;
  phase: PaymentPhase;
  method: PaymentMethod;
  ts: number;
};

export function usePaymentState(initialTxid: string): PaymentStateManager {
  const [phase, setPhase] = useState<PaymentPhase>('identify');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'paid' | 'expired' | 'cancelled'
  >('pending');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresProfile, setRequiresProfile] = useState(false);
  const [currentTxid, setCurrentTxid] = useState(initialTxid);
  const [copySuccess, setCopySuccess] = useState(false);

  const saveState = useCallback(() => {
    if (paymentStatus === 'pending') {
      try {
        const state: Persisted = {
          txid: currentTxid,
          phase,
          method: selectedMethod,
          ts: Date.now(),
        };
        // Use localStorage instead of sessionStorage to survive iOS tab eviction when app goes to background
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage errors
      }
    }
  }, [currentTxid, phase, selectedMethod, paymentStatus]);

  const loadState = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.txid === 'string' &&
        (parsed.phase === 'identify' ||
          parsed.phase === 'method' ||
          parsed.phase === 'pay') &&
        (parsed.method === 'pix' ||
          parsed.method === 'credit' ||
          parsed.method === 'boleto') &&
        parsed.txid === currentTxid // Only restore state for the current txid
      ) {
        setSelectedMethod(parsed.method);
        setPhase(parsed.phase);
        return true;
      }
    } catch {
      // Ignore parse errors
    }
    return false;
  }, [currentTxid]);

  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    // State
    phase,
    selectedMethod,
    paymentStatus,
    paymentData,
    error,
    requiresProfile,
    currentTxid,
    copySuccess,

    // Actions
    setPhase,
    setSelectedMethod,
    setPaymentStatus,
    setPaymentData,
    setError,
    setRequiresProfile,
    setCurrentTxid,
    setCopySuccess,

    // Persistence
    saveState,
    loadState,
    clearState,
  };
}
