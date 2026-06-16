import { describe, it, expect } from 'vitest';
import { ActivityLogInputSchema, LogActionSchema } from '@/lib/schemas';

describe('ActivityLogInputSchema', () => {
  const valid = {
    date: '2024-03-15',
    type: 'meal',
    label: 'Plant-based meal',
    co2Kg: -0.5,
  };

  it('accepts a valid activity log', () => {
    expect(ActivityLogInputSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional note', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, note: 'Great tofu curry' }).success).toBe(true);
  });

  it('rejects invalid date format', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, date: '15-03-2024' }).success).toBe(false);
  });

  it('rejects invalid activity type', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, type: 'sleep' }).success).toBe(false);
  });

  it('rejects empty label', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, label: '' }).success).toBe(false);
  });

  it('rejects note over 500 chars', () => {
    expect(ActivityLogInputSchema.safeParse({ ...valid, note: 'x'.repeat(501) }).success).toBe(false);
  });
});

describe('LogActionSchema', () => {
  it('accepts valid action log input', () => {
    expect(LogActionSchema.safeParse({ actionId: 'plant-meal-3x', co2SavedKg: 180 }).success).toBe(true);
  });

  it('rejects empty actionId', () => {
    expect(LogActionSchema.safeParse({ actionId: '', co2SavedKg: 180 }).success).toBe(false);
  });

  it('rejects negative co2SavedKg', () => {
    expect(LogActionSchema.safeParse({ actionId: 'plant-meal-3x', co2SavedKg: -1 }).success).toBe(false);
  });
});
