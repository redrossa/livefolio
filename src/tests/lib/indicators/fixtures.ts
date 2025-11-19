import { beforeEach, afterEach, vi } from 'vitest';
import * as seriesMock from './series';
import type { SeriesPoint } from '@/lib/series';
import MOCK_SPY_CHART from '@/tests/mocks/spy.json';
import { toUSMarketDateString, toUTCMarketOpen } from '@/lib/market/dates';

// Share a single mocked series module across all indicator tests.
vi.mock('@/lib/series', () => import('@/tests/lib/indicators/series'));

export const setupFetchSeriesMockWithSPY = () => {
  const fixtures: Record<string, SeriesPoint[]> = {
    SPY: MOCK_SPY_CHART.quotes.map((q) => ({
      date: toUSMarketDateString(toUTCMarketOpen(q.date)),
      value: q.close,
    })),
  };

  seriesMock.setSeriesFixture(fixtures);
};

// Reset and seed the series mock before every indicator test.
beforeEach(() => {
  setupFetchSeriesMockWithSPY();
});

afterEach(() => {
  seriesMock.mockFetchSeries.mockReset();
});

export const mockFetchSeries = seriesMock.mockFetchSeries;
