import { describe, it, expect } from 'vitest';
import { TransportSchema } from '@/lib/schemas';

describe('TransportSchema', () => {
  const valid = {
    carType: 'petrol',
    carMilesPerWeek: 100,
    flightsShortPerYear: 2,
    flightsLongPerYear: 1,
    publicTransitDaysPerWeek: 3,
  };

  it('accepts a valid transport object', () => {
    expect(TransportSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid car type', () => {
    expect(TransportSchema.safeParse({ ...valid, carType: 'helicopter' }).success).toBe(false);
  });

  it('rejects negative miles', () => {
    expect(TransportSchema.safeParse({ ...valid, carMilesPerWeek: -5 }).success).toBe(false);
  });

  it('rejects transit days above 7', () => {
    expect(TransportSchema.safeParse({ ...valid, publicTransitDaysPerWeek: 8 }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    const { carType: _carType, ...noCarType } = valid;
    expect(TransportSchema.safeParse(noCarType).success).toBe(false);
  });
});
