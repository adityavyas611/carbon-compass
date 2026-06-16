import { describe, it, expect } from 'vitest';
import { DIET_FACTORS, SHOPPING_FACTORS } from '@/utils/emissionFactors';

describe('DIET_FACTORS', () => {
  it('has annual factors for all diet types', () => {
    const types = ['vegan', 'vegetarian', 'pescatarian', 'flexitarian', 'omnivore', 'heavy-meat'];
    for (const t of types) {
      expect(DIET_FACTORS.annual).toHaveProperty(t);
      expect(DIET_FACTORS.annual[t as keyof typeof DIET_FACTORS.annual]).toBeGreaterThan(0);
    }
  });

  it('vegan has lowest annual footprint', () => {
    const { vegan, vegetarian, pescatarian, flexitarian, omnivore } = DIET_FACTORS.annual;
    expect(vegan).toBeLessThan(vegetarian);
    expect(vegetarian).toBeLessThan(pescatarian);
    expect(pescatarian).toBeLessThan(flexitarian);
    expect(flexitarian).toBeLessThan(omnivore);
  });

  it('heavy-meat has highest annual footprint', () => {
    const values = Object.values(DIET_FACTORS.annual);
    expect(DIET_FACTORS.annual['heavy-meat']).toBe(Math.max(...values));
  });

  it('local discount is between 0 and 1', () => {
    expect(DIET_FACTORS.localDiscount).toBeGreaterThan(0);
    expect(DIET_FACTORS.localDiscount).toBeLessThan(1);
  });

  it('high waste multiplier is greater than low', () => {
    expect(DIET_FACTORS.waste.high).toBeGreaterThan(DIET_FACTORS.waste.low);
  });

  it('medium waste is between low and high', () => {
    expect(DIET_FACTORS.waste.medium).toBeGreaterThan(DIET_FACTORS.waste.low);
    expect(DIET_FACTORS.waste.medium).toBeLessThan(DIET_FACTORS.waste.high);
  });
});

describe('SHOPPING_FACTORS', () => {
  it('all factors are positive', () => {
    expect(SHOPPING_FACTORS.clothing).toBeGreaterThan(0);
    expect(SHOPPING_FACTORS.electronics).toBeGreaterThan(0);
    expect(SHOPPING_FACTORS.onlineOrder).toBeGreaterThan(0);
  });

  it('secondhand discount is between 0 and 1', () => {
    expect(SHOPPING_FACTORS.secondhandDiscount).toBeGreaterThan(0);
    expect(SHOPPING_FACTORS.secondhandDiscount).toBeLessThan(1);
  });

  it('electronics factor is larger than clothing factor', () => {
    expect(SHOPPING_FACTORS.electronics).toBeGreaterThan(SHOPPING_FACTORS.clothing);
  });
});
