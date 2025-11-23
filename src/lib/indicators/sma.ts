import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';
import applyLeverage from '@/lib/series/leverage';
import { mean } from '@/lib/indicators/utils';

export default async function sma(
  ticker: string,
  date: string,
  length: number,
  leverage = 1,
  delay = 0,
): Promise<[number, string]> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, length);
  const leveraged = applyLeverage(series, leverage);
  const value = mean(leveraged.map((p) => p.value));
  const realDate = series[series.length - 1].date;
  return [value, realDate];
}
