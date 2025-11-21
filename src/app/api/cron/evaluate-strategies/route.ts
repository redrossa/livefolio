import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import ReallocationEmail from '@/components/ReallocationEmail';
import { getLatestStrategyEvaluation, insertStrategyEvaluation } from '@/lib/database/evaluation';
import { getStrategiesWithSubscribers } from '@/lib/database/strategy';
import { evalStrategy, Allocation } from '@/lib/evaluators';
import type { Indicator, IndicatorCache } from '@/lib/evaluators/indicator';
import { sendEmail } from '@/lib/email';
import { getRedisClient } from '@/lib/redis';

export const runtime = 'nodejs';

class JobIndicatorCache implements IndicatorCache {
  private readonly keys = new Set<string>();

  constructor(private readonly client: ReturnType<typeof getRedisClient>) {}

  async get(key: string): Promise<Indicator | null> {
    if (!this.client) {
      return null;
    }

    try {
      const cached = await this.client.get(key);
      return cached ? (JSON.parse(cached) as Indicator) : null;
    } catch (error) {
      console.error('Failed to read indicator cache', error);
      return null;
    }
  }

  async set(key: string, indicator: Indicator): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(indicator));
    } catch (error) {
      console.error('Failed to write indicator cache', error);
    }
  }

  trackKey(key: string): void {
    this.keys.add(key);
  }

  async clear(): Promise<void> {
    if (!this.client || this.keys.size === 0) {
      return;
    }

    try {
      await this.client.del(Array.from(this.keys));
    } catch (error) {
      console.error('Failed to clear indicator cache', error);
    }
  }
}

function allocationsDiffer(a: Allocation, b: Allocation): boolean {
  if (a.name !== b.name) {
    return true;
  }

  const normalize = (allocation: Allocation) =>
    allocation.holdings
      .map((holding) => ({
        symbol: holding.ticker.symbol,
        distribution: Number(holding.distribution.toFixed(6)),
      }))
      .sort((x, y) => x.symbol.localeCompare(y.symbol));

  const aHoldings = normalize(a);
  const bHoldings = normalize(b);

  if (aHoldings.length !== bHoldings.length) {
    return true;
  }

  for (let i = 0; i < aHoldings.length; i++) {
    const left = aHoldings[i];
    const right = bHoldings[i];
    if (left.symbol !== right.symbol || left.distribution !== right.distribution) {
      return true;
    }
  }

  return false;
}

async function sendAllocationUpdate(
  subscribers: string[],
  strategyName: string,
  strategyId: string,
  allocation: Allocation,
  evaluationDate: string,
) {
  const uniqueSubscribers = Array.from(new Set(subscribers));
  await Promise.all(
    uniqueSubscribers.map((email) =>
      sendEmail(
        email,
        `${strategyName} allocation updated`,
        <ReallocationEmail
          allocation={allocation}
          evaluationDate={evaluationDate}
          strategyId={strategyId}
          strategyName={strategyName}
        />,
      ),
    ),
  );
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const redisClient = getRedisClient();
  const cachePrefix = `indicator:${randomUUID()}`;
  const indicatorCache = new JobIndicatorCache(redisClient);

  try {
    const strategies = await getStrategiesWithSubscribers();
    if (!strategies.length) {
      return NextResponse.json({ evaluated: 0, reallocated: 0 });
    }

    let reallocatedCount = 0;
    for (const strategy of strategies) {
      const evaluated = await evalStrategy(strategy.definition, strategy.testfolio_id, {
        indicatorOptions: {
          cache: indicatorCache,
          cacheKeyPrefix: cachePrefix,
        },
      });

      const previous = await getLatestStrategyEvaluation(strategy.id);
      const hasReallocation = previous
        ? allocationsDiffer(previous.allocation, evaluated.allocation)
        : true;

      await insertStrategyEvaluation(
        strategy.id,
        evaluated.allocation,
        evaluated.date,
      );

      if (hasReallocation) {
        reallocatedCount++;
        await sendAllocationUpdate(
          strategy.subscribers,
          evaluated.name,
          evaluated.id,
          evaluated.allocation,
          evaluated.date,
        );
      }
    }

    return NextResponse.json({ evaluated: strategies.length, reallocated: reallocatedCount });
  } catch (error) {
    console.error('Failed to run strategy evaluation cron', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await indicatorCache.clear();
  }
}
