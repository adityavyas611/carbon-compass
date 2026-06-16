import { describe, it, expect } from 'vitest';
import { calcTransportFootprint } from '@/utils/calculations';
import type { TransportData } from '@/types';

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
    expect(result).toBeCloseTo(2130, 0);
  });

  it('public transit adds emissions proportional to days', () => {
    const zero = calcTransportFootprint({ ...base, publicTransitDaysPerWeek: 0 });
    const five = calcTransportFootprint({ ...base, publicTransitDaysPerWeek: 5 });
    expect(five).toBeGreaterThan(zero);
  });
});
