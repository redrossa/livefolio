import { Strategy } from '@/lib/evaluators';
import redis from '@/lib/redis/redis';
import { getPxAt } from '@/lib/redis/expiry';

const PREFIX = 'strategy';

export function createStrategyKey(linkId: string): string {
  return `${PREFIX}:${linkId}`;
}

export async function setStrategy(strategy: Strategy) {
  const key = createStrategyKey(strategy.linkId);
  await redis.set(key, strategy, { pxat: getPxAt() });
}

export async function getStrategy(linkId: string): Promise<Strategy | null> {
  const key = createStrategyKey(linkId);
  return await redis.get<Strategy>(key);
}
