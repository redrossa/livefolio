import { mockFetchSeries } from '@/tests/lib/indicators/fixtures';
import { describe, expect, it } from 'vitest';
import { drawdown } from '@/lib/indicators';

describe('Drawdown Indicator', () => {
  const date = '2024-12-31';

  it('returns the absolute percent drop from peak to current close', async () => {
    const result = await drawdown('SPY', date);

    expect(mockFetchSeries).toHaveBeenCalledWith('SPY', date, null);
    expect(result).toBeCloseTo(3.5751271871198855, 6);
  });
});
