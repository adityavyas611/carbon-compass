import { describe, it, expect } from 'vitest';
import { calcDietFootprint, calcShoppingFootprint } from '@/utils/calculations';
import type { DietData, ShoppingData } from '@/types';

describe('calcDietFootprint', () => {
  const base: DietData = { dietType: 'omnivore', localFoodPercent: 0, foodWasteLevel: 'medium' };

  it('vegan diet is lower than heavy-meat', () => {
    const vegan = calcDietFootprint({ ...base, dietType: 'vegan' });
    const meat = calcDietFootprint({ ...base, dietType: 'heavy-meat' });
    expect(vegan).toBeLessThan(meat);
  });

  it('100% local food reduces footprint vs 0%', () => {
    const none = calcDietFootprint({ ...base, localFoodPercent: 0 });
    const full = calcDietFootprint({ ...base, localFoodPercent: 100 });
    expect(full).toBeLessThan(none);
  });

  it('high waste increases footprint vs low waste', () => {
    const low = calcDietFootprint({ ...base, foodWasteLevel: 'low' });
    const high = calcDietFootprint({ ...base, foodWasteLevel: 'high' });
    expect(high).toBeGreaterThan(low);
  });
});

describe('calcShoppingFootprint', () => {
  const base: ShoppingData = {
    newClothingItemsPerMonth: 0,
    electronicsPerYear: 0,
    onlineOrdersPerWeek: 0,
    buySecondhand: false,
  };

  it('returns 0 for no purchases', () => {
    expect(calcShoppingFootprint(base)).toBe(0);
  });

  it('secondhand reduces clothing footprint', () => {
    const newItems = calcShoppingFootprint({ ...base, newClothingItemsPerMonth: 3, buySecondhand: false });
    const secondhand = calcShoppingFootprint({ ...base, newClothingItemsPerMonth: 3, buySecondhand: true });
    expect(secondhand).toBeLessThan(newItems);
  });

  it('more electronics increases footprint', () => {
    const zero = calcShoppingFootprint({ ...base, electronicsPerYear: 0 });
    const three = calcShoppingFootprint({ ...base, electronicsPerYear: 3 });
    expect(three).toBeGreaterThan(zero);
  });
});
