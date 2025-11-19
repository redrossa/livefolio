import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';
import { percentChange } from '@/lib/indicators/utils';

export default async function returnFrom(
  ticker: string,
  date: string,
  length: number,
  delay = 0,
): Promise<number> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, length);
  const initialPrice = series[0].value;
  const finalPrice = series[series.length - 1].value;
  return percentChange(initialPrice, finalPrice);
}
