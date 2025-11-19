import { describe, expect, it } from 'vitest';
import threshold from '@/lib/indicators/threshold';

describe('Threshold Indicator', () => {
  it('returns the literal threshold value', () => {
    expect(threshold(42.5)).toBe(42.5);
  });
});
