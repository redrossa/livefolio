import { Strategy as TestfolioStrategy } from '@/lib/testfolio';
import { Allocation, evalAllocation } from '@/lib/evaluators/allocation';
import type { Signal } from '@/lib/evaluators/signal';
import { toUSMarketDateString } from '@/lib/market/dates';

export interface Strategy {
  name: string;
  id: string;
  date: string;
  allocation: Allocation;
}

export async function evalStrategy(
  strategy: TestfolioStrategy,
  id: string,
): Promise<Strategy> {
  const date = toUSMarketDateString(new Date());

  if (!strategy.allocations.length) {
    throw new Error('Strategy must include at least one allocation.');
  }

  let evaluatedSignals: Record<string, Signal> = {};
  let allocation: Allocation | null = null;

  for (const allocationDefinition of strategy.allocations) {
    const result = await evalAllocation(
      allocationDefinition,
      strategy.signals,
      date,
      { cachedSignals: evaluatedSignals },
    );

    allocation = result.allocation;
    evaluatedSignals = result.evaluatedSignals;

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

  return {
    name: strategy.name || 'Untitled Strategy',
    id,
    date,
    allocation,
  };
}
