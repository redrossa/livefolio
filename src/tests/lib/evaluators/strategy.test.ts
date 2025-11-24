import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Strategy as TestfolioStrategy } from '@/lib/testfolio';
import { evalStrategy } from '@/lib/evaluators/strategy';
import { evalAllocation } from '@/lib/evaluators/allocation';
import { toUSMarketDateString } from '@/lib/market/dates';
import type { Signal } from '@/lib/evaluators/signal';
import type { Indicator } from '@/lib/evaluators/indicator';

vi.mock('@/lib/evaluators/allocation', () => ({
  evalAllocation: vi.fn(),
}));

vi.mock('@/lib/market/dates', () => ({
  toUSMarketDateString: vi.fn(() => '2024-01-02'),
}));

const mockEvalAllocation = vi.mocked(evalAllocation);
const mockToMarketDate = vi.mocked(toUSMarketDateString);

const evaluatedIndicator: Indicator = {
  type: 'Price',
  ticker: {
    symbol: 'SPY',
    leverage: 1,
    display: 'SPY',
  },
  date: '2024-01-02',
  value: 100,
  unit: '$',
  lookback: 0,
  delay: 0,
};

const makeEvaluatedSignal = (name: string, isTrue: boolean): Signal => ({
  name,
  indicator1: evaluatedIndicator,
  comparison: '>',
  indicator2: evaluatedIndicator,
  tolerance: 0,
  isTrue,
});

const makeAllocationResult = (
  name: string,
  activeSignals: string[],
  evaluatedSignals: Record<string, Signal>,
) => ({
  name,
  change: 0,
  holdings: [],
  signals: activeSignals.map((signal) => evaluatedSignals[signal]),
});

const baseStrategy: TestfolioStrategy = {
  name: 'Layered Strategy',
  start_date: '',
  end_date: '',
  start_val: 10000,
  rolling_window: 0,
  trading_cost: 0,
  signals: [],
  allocations: [
    {
      name: 'Aggressive',
      signals: ['Defense'],
      ops: [],
      nots: [false],
      tickers: [{ ticker: 'SPYSIM', percent: 100 }],
      drag: 0,
    },
    {
      name: 'Balanced',
      signals: ['Fallback'],
      ops: [],
      nots: [false],
      tickers: [{ ticker: 'SPYSIM', percent: 100 }],
      drag: 0,
    },
    {
      name: 'Cash',
      signals: [],
      ops: [],
      nots: [],
      tickers: [{ ticker: 'CASHX', percent: 100 }],
      drag: 0,
    },
  ],
  trading_freq: 'Daily',
  trading_offset: 0,
};

describe('evalStrategy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-02T12:00:00.000Z'));
    mockEvalAllocation.mockReset();
    mockToMarketDate.mockReturnValue('2024-01-02');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the first allocation whose signals evaluate to true', async () => {
    const defense = makeEvaluatedSignal('Defense', false);
    const fallback = makeEvaluatedSignal('Fallback', true);
    const firstResultSignals = { Defense: defense };

    mockEvalAllocation
      .mockResolvedValueOnce(
        makeAllocationResult('Aggressive', [], firstResultSignals),
      )
      .mockResolvedValueOnce(
        makeAllocationResult('Balanced', ['Fallback'], {
          Defense: defense,
          Fallback: fallback,
        }),
      );

    const result = await evalStrategy(baseStrategy, 'strategy-1');

    expect(result.name).toBe('Layered Strategy');
    expect(result.date).toEqual(new Date('2024-01-02T12:00:00.000Z'));
    expect(result.allocation.name).toBe('Balanced');
    expect(result.allocation.signals.map((s) => s?.name)).toEqual(['Fallback']);
    expect(mockEvalAllocation).toHaveBeenCalledTimes(2);
  });

  it('falls back to the last allocation when no signals are true', async () => {
    const defense = makeEvaluatedSignal('Defense', false);
    const fallbackSignals = {
      Defense: defense,
    };

    mockEvalAllocation
      .mockResolvedValueOnce(
        makeAllocationResult('Aggressive', [], fallbackSignals),
      )
      .mockResolvedValueOnce(
        makeAllocationResult('Balanced', [], fallbackSignals),
      )
      .mockResolvedValueOnce(makeAllocationResult('Cash', [], fallbackSignals));

    const result = await evalStrategy(baseStrategy, 'strategy-2');

    expect(result.allocation.name).toBe('Cash');
    expect(mockEvalAllocation).toHaveBeenCalledTimes(3);
  });
});
