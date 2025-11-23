import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';

export default async function price(
  ticker: string,
  date: string,
  delay = 0,
): Promise<[number, string]> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed);
  const value = series[series.length - 1].value;
  const realDate = series[series.length - 1].date;
  return [value, realDate];
}
