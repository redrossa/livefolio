import { fetchSeries } from '@/lib/series';
import { delayDate } from '@/lib/market/dates';
import { percentChange } from '@/lib/indicators/utils';

export default async function drawdown(
  ticker: string,
  date: string,
  delay = 0,
): Promise<[number, string]> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, null);
  const current = series[series.length - 1].value;
  const peak = Math.max(...series.map((p) => p.value));
  const value = Math.abs(percentChange(peak, current));
  const realDate = series[series.length - 1].date;
  return [value, realDate];
}
