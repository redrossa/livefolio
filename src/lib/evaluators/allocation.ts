import {
  Allocation as TestfolioAllocation,
  Operation,
  Signal as TestfolioSignal,
} from '@/lib/testfolio';
import { evalTicker, Ticker } from '@/lib/evaluators/ticker';
import { evalSignal, Signal } from '@/lib/evaluators/signal';

export interface Allocation {
  name: string;
  holdings: Array<{
    ticker: Ticker;
    distribution: number;
  }>;
  signals: Signal[];
}

export interface EvalAllocationOptions {
  cachedSignals: Record<string, Signal>;
}

export interface EvalAllocationResult {
  allocation: Allocation;
  evaluatedSignals: Record<string, Signal>;
}

export async function evalAllocation(
  allocation: TestfolioAllocation,
  signals: TestfolioSignal[],
  date: string,
  options?: EvalAllocationOptions,
): Promise<EvalAllocationResult> {
  const cachedSignals: Record<string, Signal> = {
    ...(options?.cachedSignals ?? {}),
  };
  const signalDefinitions = new Map<string, TestfolioSignal>(
    signals.map((s) => [s.name, s]),
  );

  const hasCachedSignal = (name: string): boolean =>
    Object.hasOwn(cachedSignals, name);

  const missingSignalNames = Array.from(
    new Set(allocation.signals.filter((name) => !hasCachedSignal(name))),
  );

  if (missingSignalNames.length > 0) {
    const missingSignals = await Promise.all(
      missingSignalNames.map((name) => {
        const definition = signalDefinitions.get(name);
        if (!definition) {
          throw new Error(`Missing definition for signal "${name}".`);
        }

        return evalSignal(definition, date);
      }),
    );

    missingSignalNames.forEach((name, index) => {
      cachedSignals[name] = missingSignals[index];
    });
  }

  const terms: Term[] = allocation.signals.map((name) => {
    const signal = cachedSignals[name];
    if (!signal) {
      throw new Error(`Missing evaluation result for signal "${name}".`);
    }

    return {
      name,
      value: signal.isTrue,
    };
  });

  const short = getShortCircuitedTrueTerms(
    terms,
    allocation.ops,
    allocation.nots,
  );

  const evaluated: Allocation = {
    name: allocation.name,
    holdings: allocation.tickers.map((t) => ({
      ticker: evalTicker(t.ticker),
      distribution: t.percent,
    })),
    signals: short
      .map(({ name }) => cachedSignals[name])
      .filter((signal): signal is Signal => Boolean(signal)),
  };

  return {
    allocation: evaluated,
    evaluatedSignals: cachedSignals,
  };
}

interface Term {
  name: string;
  value: boolean;
}

function getShortCircuitedTrueTerms(
  A: Term[],
  O: Operation[],
  N: boolean[],
): Term[] {
  let index = 0;

  while (index < A.length) {
    let end = index;
    while (end < A.length - 1 && O[end] === 'AND') {
      end++;
    }

    const groupTerms: Term[] = [];
    let groupIsTrue = true;

    for (let j = index; j <= end; j++) {
      if (!groupIsTrue) {
        break;
      }

      const baseValue = A[j].value;
      const effectiveValue = N[j] ? !baseValue : baseValue;

      if (effectiveValue) {
        groupTerms.push(A[j]);
      } else {
        groupIsTrue = false;
      }
    }

    if (groupIsTrue) {
      return groupTerms;
    }

    index = end + 1;
  }

  return [];
}
