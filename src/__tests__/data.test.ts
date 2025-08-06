// src/__tests__/data.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDashboardData } from '../lib/data';
import prisma from '../lib/prisma';

describe('getDashboardData', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user with subscription
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'hashed_password',
        cpf: '11144477735',
        role: 'USER',
        efiSubscriptionId: 'sub_123',
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date('2025-09-01'),
        paymentCreatedAt: new Date(),
      },
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Clean up test data
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
  });

  it('should return subscription data for user with active subscription', async () => {
    const result = await getDashboardData(testUserId);

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
    // Create another test user without subscription
    const userWithoutSub = await prisma.user.create({
      data: {
        name: 'Test User 2',
        email: `test-no-sub-${Date.now()}@example.com`,
        password: 'hashed_password',
        role: 'USER',
        efiSubscriptionId: null,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        paymentCreatedAt: null,
      },
    });

    const result = await getDashboardData(userWithoutSub.id);

    expect(result.subscription).toBeNull();
    expect(result.invoices).toHaveLength(0);
    expect(result.notices).toHaveLength(2);

    // Clean up
    await prisma.user.delete({
      where: { id: userWithoutSub.id },
    });
  });
});
