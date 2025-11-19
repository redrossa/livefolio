import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';

export default async function price(
  ticker: string,
  date: string,
  delay = 0,
): Promise<number> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed);
  return series[0].value;
}
