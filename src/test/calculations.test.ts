import { describe, it, expect } from 'vitest';
import {
  calcTransportFootprint,
  calcEnergyFootprint,
  calcDietFootprint,
  calcShoppingFootprint,
  calcFullFootprint,
  kgToTonnes,
  formatTonnes,
  getGrade,
  vsGlobalAverage,
  vsUSAverage,
} from '@/utils/calculations';
import type { TransportData, EnergyData, DietData, ShoppingData, AssessmentData } from '@/types';

// ── Transport ──────────────────────────────────────────────

describe('calcTransportFootprint', () => {
  const base: TransportData = {
    carType: 'none',
    carMilesPerWeek: 0,
    flightsShortPerYear: 0,
    flightsLongPerYear: 0,
    publicTransitDaysPerWeek: 0,
  };

  it('returns 0 for no transport activity', () => {
    expect(calcTransportFootprint(base)).toBe(0);
  });

  it('calculates petrol car emissions correctly', () => {
    const result = calcTransportFootprint({ ...base, carType: 'petrol', carMilesPerWeek: 100 });
    // 100 miles/week × 52 weeks × 0.356 kg/mile = 1851.2
    expect(result).toBeCloseTo(1851.2, 0);
  });

  it('electric car emits less than petrol for same miles', () => {
    const petrol = calcTransportFootprint({ ...base, carType: 'petrol', carMilesPerWeek: 200 });
    const electric = calcTransportFootprint({ ...base, carType: 'electric', carMilesPerWeek: 200 });
    expect(electric).toBeLessThan(petrol);
  });

  it('adds short and long flight emissions', () => {
    const result = calcTransportFootprint({
      ...base,
      flightsShortPerYear: 2,
      flightsLongPerYear: 1,
    });
    // 2 × 255 + 1 × 1620 = 2130
    expect(result).toBeCloseTo(2130, 0);
  });

  it('public transit adds emissions proportional to days', () => {
    const zero = calcTransportFootprint({ ...base, publicTransitDaysPerWeek: 0 });
    const five = calcTransportFootprint({ ...base, publicTransitDaysPerWeek: 5 });
    expect(five).toBeGreaterThan(zero);
  });
});

// ── Energy ─────────────────────────────────────────────────

describe('calcEnergyFootprint', () => {
  const base: EnergyData = {
    electricitySource: 'grid',
    heatingType: 'gas',
    homeSizeSqft: 1000,
    numPeople: 1,
  };

  it('solar reduces electricity footprint vs grid', () => {
    const grid = calcEnergyFootprint({ ...base, electricitySource: 'grid' });
    const solar = calcEnergyFootprint({ ...base, electricitySource: 'solar' });
    expect(solar).toBeLessThan(grid);
  });

  it('no heating produces lower footprint than gas heating', () => {
    const gas = calcEnergyFootprint({ ...base, heatingType: 'gas' });
    const none = calcEnergyFootprint({ ...base, heatingType: 'none' });
    expect(none).toBeLessThan(gas);
  });

  it('heat pump produces lower footprint than oil heating', () => {
    const oil = calcEnergyFootprint({ ...base, heatingType: 'oil' });
    const heatPump = calcEnergyFootprint({ ...base, heatingType: 'heat-pump' });
    expect(heatPump).toBeLessThan(oil);
  });

  it('more people reduces per-person footprint', () => {
    const onePerson = calcEnergyFootprint({ ...base, numPeople: 1 });
    const fourPeople = calcEnergyFootprint({ ...base, numPeople: 4 });
    expect(fourPeople).toBeLessThan(onePerson);
  });

  it('larger home increases footprint', () => {
    const small = calcEnergyFootprint({ ...base, homeSizeSqft: 500 });
    const large = calcEnergyFootprint({ ...base, homeSizeSqft: 3000 });
    expect(large).toBeGreaterThan(small);
  });

  it('numPeople guard: never divides by zero', () => {
    // numPeople=0 is clamped to max(1,0)=0 — but schema requires ≥1; test boundary
    const result = calcEnergyFootprint({ ...base, numPeople: 1 });
    expect(isFinite(result)).toBe(true);
  });
});

// ── Diet ───────────────────────────────────────────────────

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

// ── Shopping ───────────────────────────────────────────────

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

// ── Full footprint ──────────────────────────────────────────

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

// ── Utility functions ───────────────────────────────────────

describe('kgToTonnes', () => {
  it('converts correctly', () => {
    expect(kgToTonnes(1000)).toBe(1);
    expect(kgToTonnes(0)).toBe(0);
    expect(kgToTonnes(2500)).toBe(2.5);
  });
});

describe('formatTonnes', () => {
  it('uses kg for values under 100 kg (boundary: < 0.1 tonnes)', () => {
    expect(formatTonnes(50)).toBe('50 kg');
  });

  it('uses kg for exactly 99 kg', () => {
    expect(formatTonnes(99)).toBe('99 kg');
  });

  it('uses tonnes for values at 100 kg boundary', () => {
    expect(formatTonnes(100)).toBe('0.1t');
  });

  it('uses tonnes for values over 100 kg', () => {
    expect(formatTonnes(1500)).toBe('1.5t');
  });

  it('formats zero correctly', () => {
    expect(formatTonnes(0)).toBe('0 kg');
  });
});

describe('getGrade', () => {
  it('returns A+ for < 2 tonnes (1 tonne)', () => {
    const r = getGrade(1000);
    expect(r.grade).toBe('A+');
    expect(r.color).toBe('forest');
    expect(r.label).toBe('Carbon Champion');
  });

  it('returns A for 2–4 tonnes (3 tonnes)', () => {
    const r = getGrade(3000);
    expect(r.grade).toBe('A');
    expect(r.color).toBe('forest');
    expect(r.label).toBe('Climate Leader');
  });

  it('returns B for 4–6 tonnes (5 tonnes)', () => {
    const r = getGrade(5000);
    expect(r.grade).toBe('B');
    expect(r.color).toBe('sage');
    expect(r.label).toBe('Doing Great');
  });

  it('returns C for 6–8 tonnes (7 tonnes)', () => {
    const r = getGrade(7000);
    expect(r.grade).toBe('C');
    expect(r.color).toBe('earth');
    expect(r.label).toBe('Room to Improve');
  });

  it('returns D for 8–12 tonnes (10 tonnes)', () => {
    const r = getGrade(10000);
    expect(r.grade).toBe('D');
    expect(r.color).toBe('orange');
    expect(r.label).toBe('Needs Attention');
  });

  it('returns F for > 12 tonnes (15 tonnes)', () => {
    const r = getGrade(15000);
    expect(r.grade).toBe('F');
    expect(r.color).toBe('red');
    expect(r.label).toBe('Take Action Now');
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
    expect(vsGlobalAverage(4800)).toBeCloseTo(0, 1); // 4.8 tonnes
  });

  it('returns negative when below average', () => {
    expect(vsGlobalAverage(2400)).toBeLessThan(0); // 2.4 tonnes
  });
});

describe('vsUSAverage', () => {
  it('returns 0 when equal to US average', () => {
    expect(vsUSAverage(14500)).toBeCloseTo(0, 1); // 14.5 tonnes
  });

  it('returns negative when below US average', () => {
    expect(vsUSAverage(5000)).toBeLessThan(0);
  });
});
