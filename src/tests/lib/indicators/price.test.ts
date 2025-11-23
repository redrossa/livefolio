import { mockFetchSeries } from '@/tests/lib/indicators/fixtures';
import { describe, expect, it } from 'vitest';
import { price } from '@/lib/indicators';

describe('Price Indicator', () => {
  const date = '2024-12-31';

  it('should return the price of SPY at specified date', async () => {
    const [resultValue, resultDate] = await price('SPY', date);

    expect(mockFetchSeries).toHaveBeenCalledWith('SPY', date);
    expect(resultValue).toBe(586.0800170898438);
    expect(resultDate).toBe('2024-12-31');
  });
});
