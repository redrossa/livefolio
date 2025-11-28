import { Strategy as TestfolioStrategy } from '@/lib/testfolio';
import { Allocation, evalAllocation } from '@/lib/evaluators/allocation';
import { toUSMarketDateString } from '@/lib/market/dates';

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
  const now = new Date();
  const date = toUSMarketDateString(now);

  if (!strategy.allocations.length) {
    throw new Error('Strategy must include at least one allocation.');
  }

  let result: Allocation | null = null;
  for (const allocationDefinition of strategy.allocations) {
    result = await evalAllocation(allocationDefinition, strategy.signals, date);

    if (
      allocationDefinition.signals.length === 0 ||
      result.signals.length > 0
    ) {
      break;
    }
  }

  if (!result) {
    throw new Error('Failed to evaluate strategy allocations.');
  }

  return {
    name: strategy.name || 'Untitled Strategy',
    linkId: linkId,
    date: now,
    allocation: result,
  };
}
