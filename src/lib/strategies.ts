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
} from '@/lib/indicators';
import { normalizeTicker } from '@/lib/tickers';
import { cache } from 'react';

type EvaluatedSignalMap = Record<string, EvaluatedSignal>;

export interface EvaluatedSignal extends Signal {
  value1: number;
  value2: number;
  isActive: boolean;
  isInverse: boolean;
}

export interface EvaluatedStrategy {
  strategy: Strategy;
  allocationIndex: number;
  activeSignals: EvaluatedSignal[];
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
  const evaluatedSignalsMap = await createSignalMap(strategy.signals, asOf);
  const { index: allocationIndex, activeSignals } = evaluateAllocations(
    strategy.allocations,
    evaluatedSignalsMap,
  );
  return {
    strategy,
    allocationIndex,
    activeSignals,
    asOf,
  };
}

async function evaluateIndicator(
  indicator: Indicator,
  asOf: Date,
): Promise<number> {
  const { underlying: ticker, leverage } = normalizeTicker(indicator.ticker);
  switch (indicator.type) {
    case 'SMA':
      return sma(ticker, indicator.lookback!, asOf, leverage);
    case 'EMA':
      return ema(ticker, indicator.lookback!, asOf, leverage);
    case 'Price':
      return price(ticker, asOf, leverage);
    case 'Return':
      return returnFrom(ticker, indicator.lookback!, asOf, leverage);
    case 'Volatility':
      return volatility(ticker, indicator.lookback!, asOf, leverage);
    case 'Drawdown':
      return drawdown(ticker, asOf, leverage);
    case 'RSI':
      return rsi(ticker, indicator.lookback!, asOf, leverage);
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

async function evaluateSignal(
  signal: Signal,
  asOf: Date,
): Promise<EvaluatedSignal> {
  const indicatorValue1 = await evaluateIndicator(signal.indicator_1, asOf);
  const indicatorValue2 = await evaluateIndicator(signal.indicator_2, asOf);
  const tolerance = signal.tolerance ?? 0;
  let isActive = false;
  switch (signal.comparison) {
    case '>':
      isActive = indicatorValue1 > indicatorValue2 * (1 + tolerance / 100);
      break;
    case '<':
      isActive = indicatorValue1 < indicatorValue2 * (1 - tolerance / 100);
      break;
    case '=':
      // range: i2 - tol <= i1 <= i2 + tol
      isActive =
        indicatorValue2 * (1 - tolerance / 100) <= indicatorValue1 &&
        indicatorValue1 <= indicatorValue2 * (1 + tolerance / 100);
      break;
  }

  return {
    ...signal,
    value1: indicatorValue1,
    value2: indicatorValue2,
    isActive,
    isInverse: false,
  };
}

async function createSignalMap(
  signals: Signal[],
  asOf: Date,
): Promise<EvaluatedSignalMap> {
  const entries = await Promise.all(
    signals.map(async (signal) => {
      const evaluated = await evaluateSignal(signal, asOf);
      return [signal.name, evaluated] as const;
    }),
  );
  return Object.fromEntries(entries);
}

function evaluateAllocations(
  allocations: Allocation[],
  evaluatedSignals: EvaluatedSignalMap,
): { index: number; activeSignals: EvaluatedSignal[] } {
  if (allocations.length === 0) {
    throw new Error('Strategy must include at least one allocation');
  }

  for (let i = 0; i < allocations.length; i++) {
    const allocation = allocations[i];
    const { matches, activeSignals } = evaluateAllocation(
      allocation,
      evaluatedSignals,
    );
    if (matches) {
      return { index: i, activeSignals };
    }
  }

  // fall back to the final allocation when no earlier rules match ("else" case)
  return { index: allocations.length - 1, activeSignals: [] };
}

function evaluateAllocation(
  allocation: Allocation,
  evaluatedSignals: EvaluatedSignalMap,
): { matches: boolean; activeSignals: EvaluatedSignal[] } {
  if (!allocation.signals.length) {
    return { matches: true, activeSignals: [] };
  }

  let cursor = 0;
  while (cursor < allocation.signals.length) {
    const {
      matches: groupMatches,
      activeSignals,
      nextIndex,
    } = evaluateAndGroup(allocation, evaluatedSignals, cursor);
    if (groupMatches) {
      return { matches: true, activeSignals };
    }
    cursor = nextIndex;
  }

  return { matches: false, activeSignals: [] };
}

function evaluateAndGroup(
  allocation: Allocation,
  evaluatedSignals: EvaluatedSignalMap,
  startIndex: number,
): {
  matches: boolean;
  activeSignals: EvaluatedSignal[];
  nextIndex: number;
} {
  const groupEnd = findGroupEnd(allocation, startIndex);
  const activeSignals: EvaluatedSignal[] = [];

  for (let idx = startIndex; idx <= groupEnd; idx++) {
    const signalName = allocation.signals[idx];
    const evaluatedSignal = evaluatedSignals[signalName];
    if (!evaluatedSignal) {
      return { matches: false, activeSignals: [], nextIndex: groupEnd + 1 };
    }
    const notFlag = allocation.nots[idx] ?? false;
    const conditionActive = notFlag
      ? !evaluatedSignal.isActive
      : evaluatedSignal.isActive;
    if (!conditionActive) {
      return { matches: false, activeSignals: [], nextIndex: groupEnd + 1 };
    }
    activeSignals.push({
      ...evaluatedSignal,
      isInverse: notFlag,
    });
  }

  return { matches: true, activeSignals, nextIndex: groupEnd + 1 };
}

function findGroupEnd(allocation: Allocation, startIndex: number): number {
  let end = startIndex;
  while (end < allocation.ops.length && allocation.ops[end] === 'AND') {
    end += 1;
  }
  return end;
}
