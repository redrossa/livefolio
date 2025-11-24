import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  Allocation as TestfolioAllocation,
  Signal as TestfolioSignal,
} from '@/lib/testfolio';
import { evalAllocation } from '@/lib/evaluators/allocation';
import { evalSignal } from '@/lib/evaluators/signal';
import type { Signal } from '@/lib/evaluators/signal';
import type { Indicator } from '@/lib/evaluators/indicator';

vi.mock('@/lib/evaluators/signal', () => ({
  evalSignal: vi.fn(),
}));

const mockEvalSignal = vi.mocked(evalSignal);

const strategyIndicator = {
  ticker: 'SPYSIM',
  type: 'Price',
  value: null,
  lookback: null,
  delay: null,
} as const;

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

const makeSignalDefinition = (name: string): TestfolioSignal => ({
  name,
  indicator_1: strategyIndicator,
  indicator_2: strategyIndicator,
  comparison: '>',
  tolerance: 0,
});

const makeEvaluatedSignal = (name: string, isTrue: boolean): Signal => ({
  name,
  indicator1: evaluatedIndicator,
  comparison: '>',
  indicator2: evaluatedIndicator,
  tolerance: 0,
  isTrue,
});

describe('evalAllocation', () => {
  beforeEach(() => {
    mockEvalSignal.mockReset();
  });

  it('returns the first satisfied OR group', async () => {
    const allocation: TestfolioAllocation = {
      name: 'Growth',
      signals: ['Defense', 'Momentum', 'Fallback'],
      ops: ['AND', 'OR'],
      nots: [false, false, false],
      tickers: [
        { ticker: 'SPYSIM', percent: 60 },
        { ticker: 'CASHX', percent: 40 },
      ],
      drag: 0,
    };
    const signals = allocation.signals.map(makeSignalDefinition);

    mockEvalSignal
      .mockResolvedValueOnce(makeEvaluatedSignal('Defense', true))
      .mockResolvedValueOnce(makeEvaluatedSignal('Momentum', false))
      .mockResolvedValueOnce(makeEvaluatedSignal('Fallback', true));

    const result = await evalAllocation(allocation, signals, '2024-01-02');

    expect(result.signals.map((s) => s.name)).toEqual(['Fallback']);
    expect(mockEvalSignal).toHaveBeenCalledTimes(3);
  });

  it('evaluates provided signals', async () => {
    const allocation: TestfolioAllocation = {
      name: 'Single',
      signals: ['Defense'],
      ops: [],
      nots: [false],
      tickers: [{ ticker: 'SPYSIM', percent: 100 }],
      drag: 0,
    };
    const definition = [makeSignalDefinition('Defense')];
    const evaluated = makeEvaluatedSignal('Defense', true);

    mockEvalSignal.mockResolvedValueOnce(evaluated);

    const result = await evalAllocation(allocation, definition, '2024-01-02');

    expect(result.signals).toEqual([evaluated]);
    expect(mockEvalSignal).toHaveBeenCalledTimes(1);
  });

  it('honors NOT flags when building the satisfied signal list', async () => {
    const allocation: TestfolioAllocation = {
      name: 'Inverse',
      signals: ['Defense'],
      ops: [],
      nots: [true],
      tickers: [{ ticker: 'SPYSIM', percent: 100 }],
      drag: 0,
    };
    const signals = [makeSignalDefinition('Defense')];

    mockEvalSignal.mockResolvedValueOnce(makeEvaluatedSignal('Defense', false));

    const result = await evalAllocation(allocation, signals, '2024-01-02');

    expect(result.signals.map((s) => s.name)).toEqual(['Defense']);
    expect(result.signals[0]?.isTrue).toBe(false);
  });
});
