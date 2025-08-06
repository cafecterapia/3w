// Shared pricing constants to ensure consistency across the application

export const BASE_PRICE_PER_CLASS = 50.0;
export const DISCOUNT_THRESHOLD = 4;
export const DISCOUNT_PERCENTAGE = 5;
export const SCHEDULING_DISCOUNT_PERCENTAGE = 5; // Additional discount for recurring scheduling
export const MAX_CLASSES = 8;

export interface PricingCalculation {
  baseTotal: number;
  discountAmount: number;
  finalPrice: number;
  discountPercentage: number;
  schedulingDiscountPercentage: number;
  totalDiscountPercentage: number;
  unitPrice: number;
}

export function calculatePricing(
  classCount: number,
  schedulingOption: 'recurring' | 'on-demand' = 'recurring'
): PricingCalculation {
  const baseTotal = classCount * BASE_PRICE_PER_CLASS;

  // Volume discount
  const volumeDiscountApplied =
    classCount >= DISCOUNT_THRESHOLD ? DISCOUNT_PERCENTAGE : 0;

  // Scheduling discount (only for recurring)
  const schedulingDiscountApplied =
    schedulingOption === 'recurring' ? SCHEDULING_DISCOUNT_PERCENTAGE : 0;

  // Total discount percentage
  const totalDiscountPercentage =
    volumeDiscountApplied + schedulingDiscountApplied;

  // Calculate discount amount and final price
  const discountAmount = baseTotal * (totalDiscountPercentage / 100);
  const finalPrice = baseTotal - discountAmount;

  return {
    baseTotal,
    discountAmount,
    finalPrice,
    discountPercentage: volumeDiscountApplied,
    schedulingDiscountPercentage: schedulingDiscountApplied,
    totalDiscountPercentage,
    unitPrice: finalPrice / classCount,
  };
}
