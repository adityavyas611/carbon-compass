import { describe, it, expect } from 'vitest';
import {
  calcFullFootprint,
  kgToTonnes,
  formatTonnes,
  getGrade,
  vsGlobalAverage,
  vsUSAverage,
} from '@/utils/calculations';
import type { AssessmentData } from '@/types';

describe('calcFullFootprint', () => {
  const data: AssessmentData = {
    transport: { carType: 'petrol', carMilesPerWeek: 100, flightsShortPerYear: 1, flightsLongPerYear: 0, publicTransitDaysPerWeek: 0 },
    energy: { electricitySource: 'grid', heatingType: 'gas', homeSizeSqft: 1200, numPeople: 2 },
    diet: { dietType: 'omnivore', localFoodPercent: 20, foodWasteLevel: 'medium' },
    shopping: { newClothingItemsPerMonth: 2, electronicsPerYear: 1, onlineOrdersPerWeek: 2, buySecondhand: false },
  };

  it('total equals sum of parts', () => {
    const fp = calcFullFootprint(data);
    expect(fp.total).toBeCloseTo(fp.transport + fp.energy + fp.diet + fp.shopping, 5);
  });

  it('all categories are non-negative', () => {
    const fp = calcFullFootprint(data);
    expect(fp.transport).toBeGreaterThanOrEqual(0);
    expect(fp.energy).toBeGreaterThanOrEqual(0);
    expect(fp.diet).toBeGreaterThanOrEqual(0);
    expect(fp.shopping).toBeGreaterThanOrEqual(0);
  });
});

describe('kgToTonnes', () => {
  it('converts correctly', () => {
    expect(kgToTonnes(1000)).toBe(1);
    expect(kgToTonnes(0)).toBe(0);
    expect(kgToTonnes(2500)).toBe(2.5);
  });
});

describe('formatTonnes', () => {
  it('uses kg for values under 100 kg', () => {
    expect(formatTonnes(50)).toBe('50 kg');
    expect(formatTonnes(99)).toBe('99 kg');
  });

  it('uses tonnes for values at and above 100 kg', () => {
    expect(formatTonnes(100)).toBe('0.1t');
    expect(formatTonnes(1500)).toBe('1.5t');
  });

  it('formats zero correctly', () => {
    expect(formatTonnes(0)).toBe('0 kg');
  });
});

describe('getGrade', () => {
  it('returns A+ for < 2 tonnes', () => {
    const r = getGrade(1000);
    expect(r.grade).toBe('A+');
    expect(r.color).toBe('forest');
    expect(r.label).toBe('Carbon Champion');
  });

  it('returns A for 2–4 tonnes', () => {
    const r = getGrade(3000);
    expect(r.grade).toBe('A');
    expect(r.label).toBe('Climate Leader');
  });

  it('returns B for 4–6 tonnes', () => {
    const r = getGrade(5000);
    expect(r.grade).toBe('B');
    expect(r.color).toBe('sage');
  });

  it('returns C for 6–8 tonnes', () => {
    const r = getGrade(7000);
    expect(r.grade).toBe('C');
    expect(r.color).toBe('earth');
  });

  it('returns D for 8–12 tonnes', () => {
    const r = getGrade(10000);
    expect(r.grade).toBe('D');
    expect(r.color).toBe('orange');
  });

  it('returns F for > 12 tonnes', () => {
    const r = getGrade(15000);
    expect(r.grade).toBe('F');
    expect(r.color).toBe('red');
  });

  it('returns grade with all required fields', () => {
    const result = getGrade(5000);
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('label');
  });
});

describe('vsGlobalAverage', () => {
  it('returns 0 when equal to global average', () => {
    expect(vsGlobalAverage(4800)).toBeCloseTo(0, 1);
  });

  it('returns negative when below average', () => {
    expect(vsGlobalAverage(2400)).toBeLessThan(0);
  });
});

describe('vsUSAverage', () => {
  it('returns 0 when equal to US average', () => {
    expect(vsUSAverage(14500)).toBeCloseTo(0, 1);
  });

  it('returns negative when below US average', () => {
    expect(vsUSAverage(5000)).toBeLessThan(0);
  });
});
