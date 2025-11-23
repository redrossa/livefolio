import { Indicator, Signal } from '@/lib/evaluators';
import { Comparison } from '@/lib/testfolio';
import { createIndicatorKey } from '@/lib/redis/indicator';
import redis from '@/lib/redis/redis';
import { getPxAt } from '@/lib/redis/expiry';

const PREFIX = 'signal';

export function createSignalKey(
  indicator1: Indicator,
  indicator2: Indicator,
  comparison: Comparison,
  tolerance: number,
): string {
  const indicator1Key = createIndicatorKey(
    indicator1.ticker,
    indicator1.type,
    indicator1.value,
    indicator1.lookback,
    indicator1.delay,
  );
  const indicator2Key = createIndicatorKey(
    indicator2.ticker,
    indicator2.type,
    indicator2.value,
    indicator2.lookback,
    indicator2.delay,
  );
  return `${PREFIX}:${indicator1Key}${comparison}${indicator2Key}±${tolerance}`;
}

export async function setSignal(signal: Signal) {
  const key = createSignalKey(
    signal.indicator1,
    signal.indicator2,
    signal.comparison,
    signal.tolerance,
  );
  await redis.set(key, signal, { pxat: getPxAt() });
}

export async function getSignal(
  indicator1: Indicator,
  indicator2: Indicator,
  comparison: Comparison,
  tolerance: number,
): Promise<Signal | null> {
  const key = createSignalKey(indicator1, indicator2, comparison, tolerance);
  return await redis.get<Signal>(key);
}
