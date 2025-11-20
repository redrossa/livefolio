import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';
import { mean, relativeChanges } from '@/lib/indicators/utils';

export default async function volatility(
  ticker: string,
  date: string,
  length: number,
  delay = 0,
): Promise<number> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, length + 1); // add 1 to calculate first day return
  const returns = relativeChanges(series.map((p) => p.value));
  const meanReturns = mean(returns);
  const variance = mean(returns.map((x) => Math.pow(x - meanReturns, 2)));
  const sd = Math.sqrt(variance);
  return sd * Math.sqrt(252) * 100;
}
