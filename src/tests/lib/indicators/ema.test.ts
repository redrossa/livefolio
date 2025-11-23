import { mockFetchSeries } from '@/tests/lib/indicators/fixtures';
import { describe, expect, it } from 'vitest';
import { ema } from '@/lib/indicators';

describe('EMA Indicator', () => {
  const date = '2024-12-31';

  it('should return the 20 day EMA of SPY at specified date', async () => {
    const [resultValue, resultDate] = await ema('SPY', date, 20);

    expect(mockFetchSeries).toHaveBeenCalledWith('SPY', date, null);
    expect(resultValue).toBeCloseTo(595.9916655636844);
    expect(resultDate).toBe('2024-12-31');
  });
});
