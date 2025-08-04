// src/__tests__/data.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getDashboardData } from '../lib/data';

// Mock Prisma
vi.mock('../lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from '../lib/prisma';

describe('getDashboardData', () => {
  it('should return subscription data for user with active subscription', async () => {
    // Mock the database response
    const mockUser = {
      id: 'user_123',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: null,
      image: null,
      password: 'hashed_password',
      role: 'USER' as const,
      efiSubscriptionId: 'sub_123',
      subscriptionStatus: 'active',
      currentPeriodEnd: new Date('2025-09-01'),
      pushSubscription: null,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const result = await getDashboardData('user_123');

    expect(result.subscription).toEqual({
      id: 'sub_123',
      plan: 'Plano Básico',
      status: 'active',
      nextBillingDate: new Date('2025-09-01'),
      nextAmount: 49.9,
    });

    expect(result.invoices).toHaveLength(2);
    expect(result.notices).toHaveLength(2);
  });

  it('should return null subscription for user without subscription', async () => {
    // Mock user without subscription
    const mockUser = {
      id: 'user_456',
      name: 'Test User 2',
      email: 'test2@example.com',
      emailVerified: null,
      image: null,
      password: 'hashed_password',
      role: 'USER' as const,
      efiSubscriptionId: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      pushSubscription: null,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const result = await getDashboardData('user_456');

    expect(result.subscription).toBeNull();
    expect(result.invoices).toHaveLength(0);
    expect(result.notices).toHaveLength(2);
  });
});
