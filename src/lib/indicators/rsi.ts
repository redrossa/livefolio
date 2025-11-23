import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';
import applyLeverage from '@/lib/series/leverage';
import { absoluteChanges, smoothing } from '@/lib/indicators/utils';

export default async function rsi(
  ticker: string,
  date: string,
  length: number,
  leverage = 1,
  delay = 0,
): Promise<[number, string]> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, null);
  const leveraged = applyLeverage(series, leverage);

  const returns = absoluteChanges(leveraged.map((p) => p.value));
  const gains = returns.map((delta) => (delta >= 0 ? delta : 0));
  const losses = returns.map((delta) => (delta < 0 ? -delta : 0));

  const k = 1 / length;
  const avgGain = smoothing(gains, length, k);
  const avgLoss = smoothing(losses, length, k);

  const rs = avgGain / avgLoss;
  const value = 100 - 100 / (1 + rs);
  const realDate = series[series.length - 1].date;
  return [value, realDate];
}
