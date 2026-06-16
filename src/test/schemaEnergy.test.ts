import { describe, it, expect } from 'vitest';
import { EnergySchema } from '@/lib/schemas';

describe('EnergySchema', () => {
  const valid = {
    electricitySource: 'grid',
    heatingType: 'gas',
    homeSizeSqft: 1500,
    numPeople: 2,
  };

  it('accepts a valid energy object', () => {
    expect(EnergySchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid electricity source', () => {
    expect(EnergySchema.safeParse({ ...valid, electricitySource: 'nuclear' }).success).toBe(false);
  });

  it('rejects zero people', () => {
    expect(EnergySchema.safeParse({ ...valid, numPeople: 0 }).success).toBe(false);
  });

  it('rejects home size below minimum', () => {
    expect(EnergySchema.safeParse({ ...valid, homeSizeSqft: 50 }).success).toBe(false);
  });
});
