import {
  Indicator as TestfolioIndicator,
  IndicatorType,
} from '@/lib/testfolio';
import { evalTicker, Ticker } from '@/lib/evaluators/ticker';
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
import { getIndicator, setIndicator } from '@/lib/redis';

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
  const leverage = ticker.leverage;
  const value = indicator.value ?? 0;
  const lookback = indicator.lookback ?? 0;
  const delay = indicator.delay ?? 0;

  let result = await getIndicator(ticker, type, lookback, delay, date);
  if (result) {
    return result;
  }

  let evalValue: number;
  let evalDate: string;
  let unit: Unit = null;
  switch (type) {
    case 'SMA':
      [evalValue, evalDate] = await sma(
        symbol,
        date,
        lookback,
        leverage,
        delay,
      );
      unit = '$';
      break;
    case 'EMA':
      [evalValue, evalDate] = await ema(
        symbol,
        date,
        lookback,
        leverage,
        delay,
      );
      unit = '$';
      break;
    case 'Price':
      [evalValue, evalDate] = await price(symbol, date, delay);
      unit = '$';
      break;
    case 'Return':
      [evalValue, evalDate] = await returnFrom(
        symbol,
        date,
        lookback,
        leverage,
        delay,
      );
      unit = '%';
      break;
    case 'Volatility':
      [evalValue, evalDate] = await volatility(
        symbol,
        date,
        lookback,
        leverage,
        delay,
      );
      unit = '%';
      break;
    case 'Drawdown':
      [evalValue, evalDate] = await drawdown(symbol, date, leverage, delay);
      unit = '%';
      break;
    case 'RSI':
      [evalValue, evalDate] = await rsi(
        symbol,
        date,
        lookback,
        leverage,
        delay,
      );
      break;
    case 'VIX':
      [evalValue, evalDate] = await vix(date, delay);
      unit = '$';
      break;
    case 'T10Y':
      [evalValue, evalDate] = await t10y(date, delay);
      unit = '$';
      break;
    case 'T2Y':
      [evalValue, evalDate] = await t2y(date, delay);
      unit = '$';
      break;
    case 'T3M':
      [evalValue, evalDate] = await t3m(date, delay);
      unit = '$';
      break;
    case 'Month':
      [evalValue, evalDate] = month(date, delay);
      break;
    case 'Day of Week':
      [evalValue, evalDate] = dayOfWeek(date, delay);
      break;
    case 'Day of Month':
      [evalValue, evalDate] = dayOfMonth(date, delay);
      break;
    case 'Day of Year':
      [evalValue, evalDate] = dayOfYear(date, delay);
      break;
    case 'Threshold':
      [evalValue, evalDate] = threshold(value, date);
      break;
  }

  result = {
    type,
    ticker,
    date: evalDate,
    value: evalValue,
    unit,
    lookback,
    delay,
  };

  await setIndicator(result, date);

  return result;
}
