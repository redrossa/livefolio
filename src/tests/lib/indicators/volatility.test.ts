import { mockFetchSeries } from '@/tests/lib/indicators/fixtures';
import { describe, expect, it } from 'vitest';
import { volatility } from '@/lib/indicators';

describe('Volatility Indicator', () => {
  const date = '2024-12-31';

  it('should return the volatility of SPY at specified date from a 200 day period', async () => {
    const [resultValue, resultDate] = await volatility('SPY', date, 200);

    expect(mockFetchSeries).toHaveBeenCalledWith('SPY', date, 201);
    expect(resultValue).toBeCloseTo(12.819227952131151, 6);
    expect(resultDate).toBe('2024-12-31');
  });
});
