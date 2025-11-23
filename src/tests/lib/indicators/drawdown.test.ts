import { mockFetchSeries } from '@/tests/lib/indicators/fixtures';
import { describe, expect, it } from 'vitest';
import { drawdown } from '@/lib/indicators';

describe('Drawdown Indicator', () => {
  const date = '2024-12-31';

  it('returns the absolute percent drop from peak to current close', async () => {
    const [resultValue, resultDate] = await drawdown('SPY', date);

    expect(mockFetchSeries).toHaveBeenCalledWith('SPY', date, null);
    expect(resultValue).toBeCloseTo(3.5751271871198855, 6);
    expect(resultDate).toBe('2024-12-31');
  });
});
