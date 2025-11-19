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
  const filteredSignals: TestfolioSignal[] = signals.filter((s) =>
    allocation.signals.includes(s.name),
  );
  const evaluatedSignals: Signal[] = await Promise.all(
    filteredSignals.map(
      async (s) =>
        options?.cachedSignals[s.name] ?? (await evalSignal(s, date)),
    ),
  );

  const signalMap = Object.fromEntries(
    evaluatedSignals.map((s) => [s.name, s]),
  );

  const terms = evaluatedSignals.map(
    (s): Term => ({
      name: s.name,
      value: s.isTrue,
    }),
  );

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
    signals: short.map(({ name }) => signalMap[name]),
  };

  return {
    allocation: evaluated,
    evaluatedSignals: signalMap,
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
  const trueTerms: Term[] = [];

  // index: start of current AND-group
  let index = 0;

  while (index < A.length) {
    // 1. Find the end of this AND-group.
    //    Group is [index .. end], where all operators between them are AND.
    let end = index;
    while (end < A.length - 1 && O[end] === 'AND') {
      end++;
    }

    // 2. Evaluate group [index .. end] with AND + short-circuit.
    let groupIsTrue = true;

    for (let j = index; j <= end; j++) {
      if (!groupIsTrue) {
        // Once group is already false, rest of terms in this AND-chain
        // are not evaluated.
        break;
      }

      const baseValue = A[j].value;
      const effectiveValue = N[j] ? !baseValue : baseValue;

      if (effectiveValue) {
        // This term was evaluated and true.
        trueTerms.push(A[j]);
      } else {
        // AND short-circuit: group becomes false, rest of terms not evaluated.
        groupIsTrue = false;
      }
    }

    // 3. OR short-circuit: if a whole group is true, stop.
    if (groupIsTrue) {
      break;
    }

    // 4. Move to next group after this OR boundary.
    index = end + 1;
  }

  return trueTerms;
}
