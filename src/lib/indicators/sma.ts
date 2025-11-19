import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';
import { mean } from '@/lib/indicators/utils';

export default async function sma(
  ticker: string,
  date: string,
  length: number,
  delay = 0,
): Promise<number> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, length);
  return mean(series.map((p) => p.value));
}
