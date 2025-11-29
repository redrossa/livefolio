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

export async function evalAllocation(
  allocation: TestfolioAllocation,
  signals: TestfolioSignal[],
  date: string,
): Promise<Allocation> {
  const evaluatedSignals = await Promise.all(
    signals.map(async (signal) => await evalSignal(signal, date)),
  );

  const signalMap = Object.fromEntries(
    evaluatedSignals.map((s) => [s.name, s]),
  );

  const terms: Term[] = allocation.signals.map((name) => {
    const signal = signalMap[name];
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

  const holdings = allocation.tickers.map((t) => ({
    ticker: evalTicker(t.ticker),
    distribution: t.percent,
  }));

  const sigs = short.map(({ name }) => signalMap[name]);

  return {
    name: allocation.name,
    holdings,
    signals: sigs,
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
