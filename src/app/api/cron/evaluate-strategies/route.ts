import { NextRequest, NextResponse } from 'next/server';
import ReallocationEmail from '@/components/ReallocationEmail';
import { getLatestStrategyEvaluation, insertStrategyEvaluation } from '@/lib/database/evaluation';
import { getStrategiesWithSubscribers } from '@/lib/database/strategy';
import { evalStrategy, Allocation } from '@/lib/evaluators';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

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
    if (
      left.symbol !== right.symbol ||
      left.distribution !== right.distribution
    ) {
      return true;
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const strategies = await getStrategiesWithSubscribers();
    if (!strategies.length) {
      return NextResponse.json({ evaluated: 0, reallocated: 0 });
    }

    let reallocatedCount = 0;
    for (const strategy of strategies) {
      const evaluated = await evalStrategy(
        strategy.definition,
        strategy.testfolio_id,
      );

      const previous = await getLatestStrategyEvaluation(strategy.id);
      const hasReallocation = previous
        ? allocationsDiffer(previous.allocation, evaluated.allocation)
        : false;

      await insertStrategyEvaluation(
        strategy.id,
        evaluated.allocation,
        evaluated.date,
      );

      if (hasReallocation) {
        reallocatedCount++;
        for (const sub of strategy.subscribers) {
          await sendEmail(
            sub,
            `Your subscribed strategy ${evaluated.name} switched allocation!`,
            ReallocationEmail({
              strategyName: evaluated.name,
              strategyId: evaluated.id,
              allocation: evaluated.allocation,
              evaluationDate: evaluated.date,
            }),
          );
        }
      }
    }

    return NextResponse.json({
      evaluated: strategies.length,
      reallocated: reallocatedCount,
    });
  } catch (error) {
    console.error('Failed to run strategy evaluation cron', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
