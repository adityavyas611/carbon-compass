import { describe, it, expect } from 'vitest';
import { AVERAGES } from '@/utils/emissionFactors';

describe('AVERAGES', () => {
  it('all country averages are positive', () => {
    expect(AVERAGES.global).toBeGreaterThan(0);
    expect(AVERAGES.usa).toBeGreaterThan(0);
    expect(AVERAGES.uk).toBeGreaterThan(0);
    expect(AVERAGES.eu).toBeGreaterThan(0);
    expect(AVERAGES.india).toBeGreaterThan(0);
  });

  it('US average is higher than global average', () => {
    expect(AVERAGES.usa).toBeGreaterThan(AVERAGES.global);
  });

  it('Paris target is lower than global average', () => {
    expect(AVERAGES.parisTarget).toBeLessThan(AVERAGES.global);
  });

  it('India average is below global average', () => {
    expect(AVERAGES.india).toBeLessThan(AVERAGES.global);
  });
});
