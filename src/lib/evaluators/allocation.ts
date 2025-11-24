import {
  Allocation as TestfolioAllocation,
  Operation,
  Signal as TestfolioSignal,
} from '@/lib/testfolio';
import { evalTicker, Ticker } from '@/lib/evaluators/ticker';
import { evalSignal, Signal } from '@/lib/evaluators/signal';
import { fetchYahooQuote } from '@/lib/series/yahoo';

export interface Allocation {
  name: string;
  change: number;
  holdings: Array<{
    ticker: Ticker;
    distribution: number;
    change: number | null;
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

  let allocationChange: number = 0;
  const holdings = await Promise.all(
    allocation.tickers.map(async (t) => {
      const ticker = evalTicker(t.ticker);
      let change: number | null;
      try {
        const quote = await fetchYahooQuote(ticker.symbol);
        const marketReturn = quote?.regularMarketChangePercent;
        change = marketReturn == null ? null : marketReturn * ticker.leverage;
        allocationChange += (change ?? 0) * (t.percent / 100);
      } catch {
        change = null;
      }
      return {
        ticker,
        distribution: t.percent,
        change,
      };
    }),
  );

  return {
    name: allocation.name,
    change: allocationChange,
    holdings,
    signals: short.map(({ name }) => signalMap[name]),
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
