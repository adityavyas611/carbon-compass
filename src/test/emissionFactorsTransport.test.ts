import { describe, it, expect } from 'vitest';
import { TRANSPORT_FACTORS } from '@/utils/emissionFactors';

describe('TRANSPORT_FACTORS', () => {
  it('has factors for all car types', () => {
    expect(TRANSPORT_FACTORS.car).toHaveProperty('petrol');
    expect(TRANSPORT_FACTORS.car).toHaveProperty('diesel');
    expect(TRANSPORT_FACTORS.car).toHaveProperty('hybrid');
    expect(TRANSPORT_FACTORS.car).toHaveProperty('electric');
    expect(TRANSPORT_FACTORS.car).toHaveProperty('none');
  });

  it('none car type has zero emissions', () => {
    expect(TRANSPORT_FACTORS.car.none).toBe(0);
  });

  it('electric car emits less than petrol per mile', () => {
    expect(TRANSPORT_FACTORS.car.electric).toBeLessThan(TRANSPORT_FACTORS.car.petrol);
  });

  it('hybrid emits less than diesel per mile', () => {
    expect(TRANSPORT_FACTORS.car.hybrid).toBeLessThan(TRANSPORT_FACTORS.car.diesel);
  });

  it('long flights emit more than short flights', () => {
    expect(TRANSPORT_FACTORS.flight.long).toBeGreaterThan(TRANSPORT_FACTORS.flight.short);
  });

  it('public transit factor is positive', () => {
    expect(TRANSPORT_FACTORS.publicTransit).toBeGreaterThan(0);
    expect(TRANSPORT_FACTORS.publicTransitMilesPerDay).toBeGreaterThan(0);
  });
});
