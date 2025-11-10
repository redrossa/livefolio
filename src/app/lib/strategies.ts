import { Allocation, Indicator, Signal, Strategy } from './testfolio';
import {
  dayOfMonth,
  dayOfWeek,
  dayOfYear,
  drawdown,
  ema,
  month,
  price,
  returnFrom,
  rsi,
  sma,
  t10y,
  t2y,
  t3m,
  threshold,
  vix,
  volatility,
} from '@/app/lib/indicators';
import { formatTicker } from '@/app/lib/tickers';
import { cache } from 'react';

type SignalMap = Record<string, boolean>;

export interface EvaluatedStrategy {
  strategy: Strategy;
  allocation: Allocation;
  asOf: Date;
}

export const getStrategy = cache(async (id: string): Promise<Strategy> => {
  const response = await fetch(`https://testfol.io/api/link/${id}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch strategy ${id}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();

  if (
    payload &&
    typeof payload === 'object' &&
    'value' in payload &&
    payload.value
  ) {
    return payload.value as Strategy;
  }

  return payload as Strategy;
});

export async function evaluateStrategy(
  strategy: Strategy,
): Promise<EvaluatedStrategy> {
  const asOf = new Date();
  const signalMap = await createSignalMap(strategy.signals, asOf);
  const allocation = evaluateAllocation(strategy.allocations, signalMap);
  return {
    strategy,
    allocation,
    asOf,
  };
}

async function evaluateIndicator(
  indicator: Indicator,
  asOf: Date,
): Promise<number> {
  const ticker = formatTicker(indicator.ticker);
  switch (indicator.type) {
    case 'SMA':
      return sma(ticker, indicator.lookback!, asOf);
    case 'EMA':
      return ema(ticker, indicator.lookback!, asOf);
    case 'Price':
      return price(ticker, asOf);
    case 'Return':
      return returnFrom(ticker, indicator.lookback!, asOf);
    case 'Volatility':
      return volatility(ticker, indicator.lookback!, asOf);
    case 'Drawdown':
      return drawdown(ticker, asOf);
    case 'RSI':
      return rsi(ticker, indicator.lookback!, asOf);
    case 'VIX':
      return vix(asOf);
    case 'T10Y':
      return t10y(asOf);
    case 'T2Y':
      return t2y(asOf);
    case 'T3M':
      return t3m(asOf);
    case 'Month':
      return month(asOf);
    case 'Day of Week':
      return dayOfWeek(asOf);
    case 'Day of Month':
      return dayOfMonth(asOf);
    case 'Day of Year':
      return dayOfYear(asOf);
    case 'Threshold':
      return threshold(indicator.value!);
  }
}

async function evaluateSignal(signal: Signal, asOf: Date): Promise<boolean> {
  const indicatorValue1 = await evaluateIndicator(signal.indicator_1, asOf);
  const indicatorValue2 = await evaluateIndicator(signal.indicator_2, asOf);
  const tolerance = signal.tolerance ?? 0;
  switch (signal.comparison) {
    case '>':
      return indicatorValue1 > indicatorValue2 * (1 + tolerance / 100);
    case '<':
      return indicatorValue1 < indicatorValue2 * (1 - tolerance / 100);
    case '=':
      // range: i2 - tol <= i1 <= i2 + tol
      return (
        indicatorValue2 * (1 - tolerance / 100) <= indicatorValue1 &&
        indicatorValue1 <= indicatorValue2 * (1 + tolerance / 100)
      );
  }
}

async function createSignalMap(
  signals: Signal[],
  asOf: Date,
): Promise<SignalMap> {
  return Object.fromEntries(
    await Promise.all(
      signals.map(async (s) => [s.name, await evaluateSignal(s, asOf)]),
    ),
  );
}

function evaluateAllocation(
  allocations: Allocation[],
  signalMap: SignalMap,
): Allocation {
  return (
    allocations.find((a) => {
      const signalValues = a.signals.map((k) => signalMap[k]);
      const condInverted = signalValues.map((v, i) => (a.nots[i] ? !v : v));

      // Step 1: resolve all ANDs first
      const reduced: boolean[] = [condInverted[0]];
      for (let i = 0; i < a.ops.length; i++) {
        if (a.ops[i] === 'AND') {
          const last = reduced.pop()!;
          reduced.push(last && condInverted[i + 1]); // multiply for AND
        } else {
          reduced.push(condInverted[i + 1]);
        }
      }

      // Step 2: Evaluate remaining ORs left to right
      return reduced.some(Boolean);
    }) ?? allocations[allocations.length - 1] // last allocation is the "else" condition
  );
}
