import { mockFetchSeries } from '@/tests/lib/indicators/fixtures';
import { describe, expect, it } from 'vitest';
import { returnFrom } from '@/lib/indicators';

describe('Return Indicator', () => {
  const date = '2024-12-31';

  it('should return the percent change of SPY at specified date from a 200 day period', async () => {
    const result = await returnFrom('SPY', date, 200);

    expect(mockFetchSeries).toHaveBeenCalledWith('SPY', date, 200);
    expect(result).toBeCloseTo(14.276807282613275);
  });
});
