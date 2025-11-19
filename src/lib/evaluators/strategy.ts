import { Strategy as TestfolioStrategy } from '@/lib/testfolio';
import { Allocation, evalAllocation } from '@/lib/evaluators/allocation';
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

  let { allocation, evaluatedSignals } = await evalAllocation(
    strategy.allocations[strategy.allocations.length - 1],
    [],
    date,
  );

  for (const a of strategy.allocations) {
    const result = await evalAllocation(a, strategy.signals, date, {
      cachedSignals: evaluatedSignals,
    });
    allocation = result.allocation;
    evaluatedSignals = result.evaluatedSignals;

    if (allocation.signals.length > 0) {
      break;
    }
  }

  return {
    name: strategy.name || 'Untitled Strategy',
    id,
    date,
    allocation,
  };
}
