import { mockFetchSeries } from '@/tests/lib/indicators/fixtures';
import { describe, expect, it } from 'vitest';
import { sma } from '@/lib/indicators';

describe('SMA Indicator', () => {
  const date = '2024-12-31';

  it('should return the 200 day SMA of SPY at specified date', async () => {
    const [resultValue, resultDate] = await sma('SPY', date, 200);

    expect(mockFetchSeries).toHaveBeenCalledWith('SPY', date, 200);
    expect(resultValue).toBeCloseTo(553.7220497131348);
    expect(resultDate).toBe('2024-12-31');
  });
});
