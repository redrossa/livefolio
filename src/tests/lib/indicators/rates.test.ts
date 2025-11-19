import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/indicators', () => ({
  price: vi.fn(),
}));

import { price } from '@/lib/indicators';
import t10y from '@/lib/indicators/t10y';
import t2y from '@/lib/indicators/t2y';
import t3m from '@/lib/indicators/t3m';
import vix from '@/lib/indicators/vix';

const mockPrice = vi.mocked(price);

describe('Rate & Volatility Indicators', () => {
  const date = '2024-12-31';

  beforeEach(() => {
    mockPrice.mockReset();
  });

  it('maps T10Y to ^TNX quotes', async () => {
    mockPrice.mockResolvedValueOnce(4.35);

    const result = await t10y(date, 3);

    expect(mockPrice).toHaveBeenCalledWith('^TNX', date, 3);
    expect(result).toBe(4.35);
  });

  it('maps T2Y to 2YY=F quotes', async () => {
    mockPrice.mockResolvedValueOnce(4.1);

    const result = await t2y(date, 2);

    expect(mockPrice).toHaveBeenCalledWith('2YY=F', date, 2);
    expect(result).toBe(4.1);
  });

  it('maps T3M to ^IRX quotes', async () => {
    mockPrice.mockResolvedValueOnce(3.9);

    const result = await t3m(date, 1);

    expect(mockPrice).toHaveBeenCalledWith('^IRX', date, 1);
    expect(result).toBe(3.9);
  });

  it('maps VIX to ^VIX quotes', async () => {
    mockPrice.mockResolvedValueOnce(16.42);

    const result = await vix(date, 0);

    expect(mockPrice).toHaveBeenCalledWith('^VIX', date, 0);
    expect(result).toBe(16.42);
  });
});
