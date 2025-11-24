import { delayDate } from '@/lib/market/dates';
import { fetchSeries } from '@/lib/series';
import applyLeverage from '@/lib/series/leverage';
import { percentChange } from '@/lib/indicators/utils';

export default async function returnFrom(
  ticker: string,
  date: string,
  length: number,
  leverage = 1,
  delay = 0,
): Promise<[number, string]> {
  const delayed = delayDate(date, delay);
  const series = await fetchSeries(ticker, delayed, length + 1); // add 1 because "return from length=0+1=1 day ago"
  const leveraged = applyLeverage(series, leverage);
  const initialPrice = leveraged[0].value;
  const finalPrice = leveraged[leveraged.length - 1].value;
  const value = percentChange(initialPrice, finalPrice);
  const realDate = series[series.length - 1].date;
  return [value, realDate];
}
