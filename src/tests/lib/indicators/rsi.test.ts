import { mockFetchSeries } from '@/tests/lib/indicators/fixtures';
import { describe, expect, it } from 'vitest';
import { rsi } from '@/lib/indicators';

describe('RSI Indicator', () => {
  const date = '2024-12-31';

  it('should return the 20 day RSI of SPY at specified date', async () => {
    const [resultValue, resultDate] = await rsi('SPY', date, 14);

    expect(mockFetchSeries).toHaveBeenCalledWith('SPY', date, null);
    expect(resultValue).toBeCloseTo(40.18352317845375, 6);
    expect(resultDate).toBe('2024-12-31');
  });
});
