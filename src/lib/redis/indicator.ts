import { Indicator, Ticker } from '@/lib/evaluators';
import redis from '@/lib/redis/redis';
import { getPxAt } from '@/lib/redis/expiry';
import { IndicatorType } from '@/lib/testfolio';

const PREFIX = 'indicator';

export function createIndicatorKey(
  ticker: Ticker,
  type: IndicatorType,
  value: number,
  lookback: number,
  delay: number,
): string {
  return type === 'Threshold'
    ? `${PREFIX}:${type}(${value})`
    : `${PREFIX}:${ticker.display}:${type}(${lookback})-${delay}`;
}

export async function setIndicator(indicator: Indicator) {
  if (indicator.type === 'Threshold') {
    return;
  }

  await redis.set(
    createIndicatorKey(
      indicator.ticker,
      indicator.type,
      indicator.value,
      indicator.lookback,
      indicator.delay,
    ),
    indicator,
    { pxat: getPxAt() },
  );
}

export async function getIndicator(
  ticker: Ticker,
  type: IndicatorType,
  value: number,
  lookback: number,
  delay: number,
): Promise<Indicator | null> {
  if (type === 'Threshold') {
    return null;
  }

  const key = createIndicatorKey(ticker, type, value, lookback, delay);
  return redis.get<Indicator>(key);
}
