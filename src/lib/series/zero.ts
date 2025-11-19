import { SeriesPoint } from '@/lib/series';
import fetchYahooSeries from '@/lib/series/yahoo';

export default async function fetchZeroSeries(
  start: string,
  end: string,
  value = 0,
): Promise<SeriesPoint[]> {
  const spySeries = await fetchYahooSeries('SPY', start, end);
  return spySeries.map(({ date }) => ({
    date,
    value,
  }));
}
