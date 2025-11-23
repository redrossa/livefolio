import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';
import applyLeverage from '@/lib/series/leverage';
import { smoothing } from '@/lib/indicators/utils';

export default async function ema(
  ticker: string,
  date: string,
  length: number,
  leverage = 1,
  delay = 0,
): Promise<[number, string]> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, null);
  const leveraged = applyLeverage(series, leverage);
  const value = smoothing(
    leveraged.map((p) => p.value),
    length,
  );
  const realDate = series[series.length - 1].date;
  return [value, realDate];
}
