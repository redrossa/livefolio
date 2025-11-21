import {
  IndicatorType,
  Indicator as TestfolioIndicator,
} from '@/lib/testfolio';
import { Ticker, evalTicker } from '@/lib/evaluators/ticker';
import {
  dayOfMonth,
  dayOfWeek,
  dayOfYear,
  drawdown,
  ema,
  month,
  price,
  returnFrom,
  rsi,
  sma,
  t10y,
  t2y,
  t3m,
  threshold,
  vix,
  volatility,
} from '@/lib/indicators';

export type Unit = '%' | '$' | null;

export interface Indicator {
  type: IndicatorType;
  ticker: Ticker;
  value: number;
  unit: Unit;
  lookback: number;
  delay: number;
}

export async function evalIndicator(
  indicator: TestfolioIndicator,
  date: string,
): Promise<Indicator> {
  const type = indicator.type;
  const ticker = evalTicker(indicator.ticker);
  const symbol = ticker.symbol;
  const lookback = indicator.lookback ?? 0;
  const delay = indicator.delay ?? 0;
  let value: number;
  let unit: Unit = null;
  switch (type) {
    case 'SMA':
      value = await sma(symbol, date, lookback, delay);
      unit = '$';
      break;
    case 'EMA':
      value = await ema(symbol, date, lookback, delay);
      unit = '$';
      break;
    case 'Price':
      value = await price(symbol, date, delay);
      unit = '$';
      break;
    case 'Return':
      value = await returnFrom(symbol, date, lookback, delay);
      unit = '%';
      break;
    case 'Volatility':
      value = await volatility(symbol, date, lookback, delay);
      unit = '%';
      break;
    case 'Drawdown':
      value = await drawdown(symbol, date, delay);
      unit = '%';
      break;
    case 'RSI':
      value = await rsi(symbol, date, lookback, delay);
      break;
    case 'VIX':
      value = await vix(date, delay);
      unit = '$';
      break;
    case 'T10Y':
      value = await t10y(date, delay);
      unit = '$';
      break;
    case 'T2Y':
      value = await t2y(date, delay);
      unit = '$';
      break;
    case 'T3M':
      value = await t3m(date, delay);
      unit = '$';
      break;
    case 'Month':
      value = month(date, delay);
      break;
    case 'Day of Week':
      value = dayOfWeek(date, delay);
      break;
    case 'Day of Month':
      value = dayOfMonth(date, delay);
      break;
    case 'Day of Year':
      value = dayOfYear(date, delay);
      break;
    case 'Threshold':
      value = threshold(indicator.value!);
      break;
  }
  return {
    type,
    ticker,
    value,
    unit,
    lookback,
    delay,
  };
}
