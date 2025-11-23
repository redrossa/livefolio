import { fetchSeries } from '@/lib/series';
import { delayDate } from '@/lib/market/dates';
import applyLeverage from '@/lib/series/leverage';
import { percentChange } from '@/lib/indicators/utils';

export default async function drawdown(
  ticker: string,
  date: string,
  leverage = 1,
  delay = 0,
): Promise<[number, string]> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, null);
  const leveraged = applyLeverage(series, leverage);
  const current = leveraged[leveraged.length - 1].value;
  const peak = Math.max(...leveraged.map((p) => p.value));
  const value = Math.abs(percentChange(peak, current));
  const realDate = series[series.length - 1].date;
  return [value, realDate];
}
