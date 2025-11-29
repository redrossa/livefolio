import { Strategy as TestfolioStrategy } from '@/lib/testfolio';
import { Allocation, evalAllocation } from '@/lib/evaluators/allocation';
import { toUSMarketDateString } from '@/lib/market/dates';
import { getStrategy, setStrategy } from '@/lib/redis/strategy';

export interface Strategy {
  name: string;
  linkId: string;
  date: Date;
  allocation: Allocation;
}

export async function evalStrategy(
  strategy: TestfolioStrategy,
  linkId: string,
): Promise<Strategy> {
  const start = Date.now();

  let result = await getStrategy(linkId);
  if (result) {
    const end = Date.now();
    console.log((end - start) / 1000);
    return result;
  }

  const now = new Date();
  const date = toUSMarketDateString(now);

  if (!strategy.allocations.length) {
    throw new Error('Strategy must include at least one allocation.');
  }

  let allocation: Allocation | null = null;
  for (const allocationDefinition of strategy.allocations) {
    allocation = await evalAllocation(
      allocationDefinition,
      strategy.signals,
      date,
    );

    if (
      allocationDefinition.signals.length === 0 ||
      allocation.signals.length > 0
    ) {
      break;
    }
  }

  if (!allocation) {
    throw new Error('Failed to evaluate strategy allocations.');
  }

  result = {
    name: strategy.name || 'Untitled Strategy',
    linkId: linkId,
    date: now,
    allocation,
  };

  await setStrategy(result);

  const end = Date.now();
  console.log((end - start) / 1000);
  return result;
}
