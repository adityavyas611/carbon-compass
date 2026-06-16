import { describe, it, expect } from 'vitest';
import { DietSchema, ShoppingSchema } from '@/lib/schemas';

describe('DietSchema', () => {
  const valid = { dietType: 'omnivore', localFoodPercent: 30, foodWasteLevel: 'medium' };

  it('accepts a valid diet object', () => {
    expect(DietSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects unknown diet type', () => {
    expect(DietSchema.safeParse({ ...valid, dietType: 'keto' }).success).toBe(false);
  });

  it('rejects localFoodPercent above 100', () => {
    expect(DietSchema.safeParse({ ...valid, localFoodPercent: 110 }).success).toBe(false);
  });

  it('rejects localFoodPercent below 0', () => {
    expect(DietSchema.safeParse({ ...valid, localFoodPercent: -1 }).success).toBe(false);
  });
});

describe('ShoppingSchema', () => {
  const valid = {
    newClothingItemsPerMonth: 3,
    electronicsPerYear: 1,
    onlineOrdersPerWeek: 2,
    buySecondhand: false,
  };

  it('accepts a valid shopping object', () => {
    expect(ShoppingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects negative clothing items', () => {
    expect(ShoppingSchema.safeParse({ ...valid, newClothingItemsPerMonth: -1 }).success).toBe(false);
  });

  it('rejects non-boolean buySecondhand', () => {
    expect(ShoppingSchema.safeParse({ ...valid, buySecondhand: 'yes' }).success).toBe(false);
  });
});
