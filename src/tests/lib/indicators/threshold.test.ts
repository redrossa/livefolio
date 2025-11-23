import { describe, expect, it } from 'vitest';
import threshold from '@/lib/indicators/threshold';

describe('Threshold Indicator', () => {
  const date = '2024-12-31';

  it('returns the literal threshold value', () => {
    const [resultValue, resultDate] = threshold(42.5, date);
    expect(resultValue).toBe(42.5);
    expect(resultDate).toBe('2024-12-31');
  });
});
