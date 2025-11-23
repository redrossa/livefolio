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
  date: string;
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
  let realDate: string;
  let unit: Unit = null;
  switch (type) {
    case 'SMA':
      [value, realDate] = await sma(symbol, date, lookback, delay);
      unit = '$';
      break;
    case 'EMA':
      [value, realDate] = await ema(symbol, date, lookback, delay);
      unit = '$';
      break;
    case 'Price':
      [value, realDate] = await price(symbol, date, delay);
      unit = '$';
      break;
    case 'Return':
      [value, realDate] = await returnFrom(symbol, date, lookback, delay);
      unit = '%';
      break;
    case 'Volatility':
      [value, realDate] = await volatility(symbol, date, lookback, delay);
      unit = '%';
      break;
    case 'Drawdown':
      [value, realDate] = await drawdown(symbol, date, delay);
      unit = '%';
      break;
    case 'RSI':
      [value, realDate] = await rsi(symbol, date, lookback, delay);
      break;
    case 'VIX':
      [value, realDate] = await vix(date, delay);
      unit = '$';
      break;
    case 'T10Y':
      [value, realDate] = await t10y(date, delay);
      unit = '$';
      break;
    case 'T2Y':
      [value, realDate] = await t2y(date, delay);
      unit = '$';
      break;
    case 'T3M':
      [value, realDate] = await t3m(date, delay);
      unit = '$';
      break;
    case 'Month':
      [value, realDate] = month(date, delay);
      break;
    case 'Day of Week':
      [value, realDate] = dayOfWeek(date, delay);
      break;
    case 'Day of Month':
      [value, realDate] = dayOfMonth(date, delay);
      break;
    case 'Day of Year':
      [value, realDate] = dayOfYear(date, delay);
      break;
    case 'Threshold':
      [value, realDate] = threshold(indicator.value!, date);
      break;
  }
  return {
    type,
    ticker,
    date: realDate,
    value,
    unit,
    lookback,
    delay,
  };
}
