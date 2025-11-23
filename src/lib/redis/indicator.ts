import { Indicator, Ticker } from '@/lib/evaluators';
import redis from '@/lib/redis/redis';
import { getExAt } from '@/lib/redis/ex';
import { IndicatorType } from '@/lib/testfolio';

const PREFIX = 'indicator';

export function createIndicatorKey(
  ticker: Ticker,
  type: IndicatorType,
  lookback: number,
  delay: number,
  date: string,
): string {
  if (type === 'Threshold') {
    throw new Error('Threshold types not supported');
  }
  return `${PREFIX}:${ticker.display}:${type}(${lookback})-${delay}@${date}`;
}

export async function setIndicator(
  indicator: Indicator,
  requestedDate: string,
) {
  if (indicator.type === 'Threshold') {
    return;
  }

  await redis.set(
    createIndicatorKey(
      indicator.ticker,
      indicator.type,
      indicator.lookback,
      indicator.delay,
      requestedDate,
    ),
    indicator,
    { exat: getExAt() },
  );
}

export async function getIndicator(
  ticker: Ticker,
  type: IndicatorType,
  lookback: number,
  delay: number,
  date: string,
): Promise<Indicator | null> {
  if (type === 'Threshold') {
    return null;
  }

  const key = createIndicatorKey(ticker, type, lookback, delay, date);
  return redis.get<Indicator>(key);
}
