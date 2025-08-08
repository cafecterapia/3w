'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'pix';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}

interface BillingInfo {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    zipCode: string;
    city: string;
    state: string;
  };
}

interface PaymentSettings {
  emailNotifications: boolean;
  autoRenewal: boolean;
  emailReceipts: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'cancelled';
  description: string;
  date: Date;
  paymentMethodId: string;
  invoiceUrl?: string;
}

interface PaymentManagementContextType {
  // Data
  paymentMethods: PaymentMethod[];
  billingInfo: BillingInfo | null;
  paymentSettings: PaymentSettings;
  paymentHistory: PaymentHistory[];

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;

  // Actions
  addPaymentMethod: (
    method: Omit<PaymentMethod, 'id' | 'createdAt'>
  ) => Promise<void>;
  updatePaymentMethod: (
    id: string,
    updates: Partial<PaymentMethod>
  ) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  updateBillingInfo: (info: BillingInfo) => Promise<void>;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => Promise<void>;
  refreshData: () => Promise<void>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

const PaymentManagementContext = createContext<
  PaymentManagementContextType | undefined
>(undefined);

export function usePaymentManagement() {
  const context = useContext(PaymentManagementContext);
  if (context === undefined) {
    throw new Error(
      'usePaymentManagement must be used within a PaymentManagementProvider'
    );
  }
  return context;
}

interface PaymentManagementProviderProps {
  userId: string;
  children: React.ReactNode;
}

export function PaymentManagementProvider({
  userId,
  children,
}: PaymentManagementProviderProps) {
  // State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    emailNotifications: true,
    autoRenewal: true,
    emailReceipts: false,
  });
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data - replace with real API calls
  const mockPaymentMethods = useMemo<PaymentMethod[]>(
    () => [
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
        isActive: true,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'pm_2',
        type: 'card',
        brand: 'mastercard',
        last4: '1234',
        expiryMonth: 8,
        expiryYear: 2025,
        isDefault: false,
        isActive: false, // Expired
        createdAt: new Date('2023-08-10'),
      },
    ],
    []
  );

  const mockBillingInfo = useMemo<BillingInfo>(
    () => ({
      name: 'João Silva',
      email: 'joao@example.com',
      cpf: '000.000.000-00',
      phone: '(11) 99999-9999',
    }),
    []
  );

  const mockPaymentHistory = useMemo<PaymentHistory[]>(
    () => [
      {
        id: 'inv_003',
        amount: 2999,
        currency: 'BRL',
        status: 'paid',
        description: 'Plano Premium - Fevereiro 2025',
        date: new Date('2025-02-01'),
        paymentMethodId: 'pm_1',
      },
      {
        id: 'inv_002',
        amount: 2999,
        currency: 'BRL',
        status: 'paid',
        description: 'Plano Premium - Janeiro 2025',
        date: new Date('2025-01-01'),
        paymentMethodId: 'pm_1',
      },
      {
        id: 'inv_001',
        amount: 2999,
        currency: 'BRL',
        status: 'paid',
        description: 'Plano Premium - Dezembro 2024',
        date: new Date('2024-12-01'),
        paymentMethodId: 'pm_1',
      },
    ],
    []
  );

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Simulate API calls
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setPaymentMethods(mockPaymentMethods);
        setBillingInfo(mockBillingInfo);
        setPaymentHistory(mockPaymentHistory);

        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados de pagamento');
        console.error('Error loading payment data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, mockPaymentMethods, mockBillingInfo, mockPaymentHistory]);

  // Actions
  const addPaymentMethod = async (
    method: Omit<PaymentMethod, 'id' | 'createdAt'>
  ) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newMethod: PaymentMethod = {
        ...method,
        id: `pm_${Date.now()}`,
        createdAt: new Date(),
      };

      setPaymentMethods((prev) => [...prev, newMethod]);
    } catch (err) {
      setError('Erro ao adicionar método de pagamento');
      console.error('Error adding payment method:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePaymentMethod = async (
    id: string,
    updates: Partial<PaymentMethod>
  ) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.id === id ? { ...method, ...updates } : method
        )
      );
    } catch (err) {
      setError('Erro ao atualizar método de pagamento');
      console.error('Error updating payment method:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const removePaymentMethod = async (id: string) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
    } catch (err) {
      setError('Erro ao remover método de pagamento');
      console.error('Error removing payment method:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPaymentMethods((prev) =>
        prev.map((method) => ({
          ...method,
          isDefault: method.id === id,
        }))
      );
    } catch (err) {
      setError('Erro ao definir método de pagamento padrão');
      console.error('Error setting default payment method:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateBillingInfo = async (info: BillingInfo) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setBillingInfo(info);
    } catch (err) {
      setError('Erro ao atualizar informações de cobrança');
      console.error('Error updating billing info:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePaymentSettings = async (settings: Partial<PaymentSettings>) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPaymentSettings((prev) => ({ ...prev, ...settings }));
    } catch (err) {
      setError('Erro ao atualizar configurações de pagamento');
      console.error('Error updating payment settings:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPaymentMethods(mockPaymentMethods);
      setBillingInfo(mockBillingInfo);
      setPaymentHistory(mockPaymentHistory);
    } catch (err) {
      setError('Erro ao atualizar dados');
      console.error('Error refreshing data:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: PaymentManagementContextType = {
    // Data
    paymentMethods,
    billingInfo,
    paymentSettings,
    paymentHistory,

    // Loading states
    isLoading,
    isUpdating,

    // Actions
    addPaymentMethod,
    updatePaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    updateBillingInfo,
    updatePaymentSettings,
    refreshData,

    // Error handling
    error,
    clearError,
  };

  return (
    <PaymentManagementContext.Provider value={value}>
      {children}
    </PaymentManagementContext.Provider>
  );
}
