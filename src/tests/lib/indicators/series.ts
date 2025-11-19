import { vi } from 'vitest';
import type { SeriesPoint } from '@/lib/series';

export const mockFetchSeries =
  vi.fn<
    (ticker: string, date: string, length?: number) => Promise<SeriesPoint[]>
  >();

export function setSeriesFixture(
  fixtures: Record<string, SeriesPoint[]>,
): void {
  mockFetchSeries.mockImplementation(
    async (ticker: string, date: string, length: number | null = 1) => {
      const series = fixtures[ticker];
      if (!series) {
        throw new Error(`No mock series for ticker ${ticker}`);
      }

      if (length == null) {
        return series;
      }

      if (length > 0) {
        if (series.length === 0) {
          return [];
        }

        if (length <= series.length) {
          return series.slice(-length);
        }

        const paddingCount = length - series.length;
        const padding = Array.from({ length: paddingCount }, () => series[0]);
        return [...padding, ...series];
      }

      const match = series.find((p) => p.date === date);
      return [match ?? series[series.length - 1]];
    },
  );
}

// Re-export constants so the mocked module matches the public surface.
export * from '@/lib/series/constants';
export const fetchSeries = mockFetchSeries;
