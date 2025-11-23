import { Indicator, Signal } from '@/lib/evaluators';
import { Comparison } from '@/lib/testfolio';
import { createIndicatorKey } from '@/lib/redis/indicator';
import redis from '@/lib/redis/redis';
import { getExAt } from '@/lib/redis/ex';

const PREFIX = 'signal';

export function createSignalKey(
  indicator1: Indicator,
  indicator2: Indicator,
  comparison: Comparison,
  tolerance: number,
  date: string,
): string {
  const indicator1Key = createIndicatorKey(
    indicator1.ticker,
    indicator1.type,
    indicator1.lookback,
    indicator1.delay,
    date,
  );
  const indicator2Key = createIndicatorKey(
    indicator2.ticker,
    indicator2.type,
    indicator2.lookback,
    indicator2.delay,
    date,
  );
  return `${PREFIX}:${indicator1Key}${comparison}${indicator2Key}±${tolerance}@${date}`;
}

export async function setSignal(signal: Signal, requestedDate: string) {
  const key = createSignalKey(
    signal.indicator1,
    signal.indicator2,
    signal.comparison,
    signal.tolerance,
    requestedDate,
  );
  await redis.set(key, signal, { exat: getExAt() });
}

export async function getSignal(
  indicator1: Indicator,
  indicator2: Indicator,
  comparison: Comparison,
  tolerance: number,
  requestedDate: string,
): Promise<Signal | null> {
  const key = createSignalKey(
    indicator1,
    indicator2,
    comparison,
    tolerance,
    requestedDate,
  );
  return await redis.get<Signal>(key);
}
