import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';
import { smoothing } from '@/lib/indicators/utils';

export default async function ema(
  ticker: string,
  date: string,
  length: number,
  delay = 0,
): Promise<[number, string]> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, null);
  const value = smoothing(
    series.map((p) => p.value),
    length,
  );
  const realDate = series[series.length - 1].date;
  return [value, realDate];
}
