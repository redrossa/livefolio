import {
  drawdown,
  dayOfMonth,
  dayOfWeek,
  dayOfYear,
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
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('yahoo-finance2', () => {
  return {
    default: class {
      async chart(symbol: string) {
        const chartData =
          (globalThis as any).__mockYahooFinanceChartData ?? {};
        const quotes = chartData[symbol] ?? [];
        return { quotes };
      }

      async quote(symbol: string) {
        const quoteData =
          (globalThis as any).__mockYahooFinanceQuoteData ?? {};
        return quoteData[symbol] ?? {};
      }
    },
  };
});

type QuoteInput = {
  date: string;
  close: number;
};

type MockGlobal = typeof globalThis & {
  __mockYahooFinanceChartData: Record<string, unknown[]>;
  __mockYahooFinanceQuoteData: Record<string, unknown>;
};

const createQuote = ({ date, close }: QuoteInput) => ({
  date: new Date(date),
  high: close,
  low: close,
  open: close,
  close,
  volume: 1_000,
});

const AS_OF = new Date('2024-01-10T21:00:00Z');

const BASE_SERIES = [
  { date: '2024-01-01T21:00:00Z', close: 100 },
  { date: '2024-01-02T21:00:00Z', close: 102 },
  { date: '2024-01-03T21:00:00Z', close: 101 },
  { date: '2024-01-04T21:00:00Z', close: 103 },
  { date: '2024-01-05T21:00:00Z', close: 104 },
  { date: '2024-01-06T21:00:00Z', close: 106 },
  { date: '2024-01-07T21:00:00Z', close: 105 },
  { date: '2024-01-08T21:00:00Z', close: 107 },
  { date: '2024-01-09T21:00:00Z', close: 110 },
  { date: '2024-01-10T21:00:00Z', close: 108 },
];

const resetMockData = () => {
  const globalTarget = globalThis as MockGlobal;
  globalTarget.__mockYahooFinanceChartData = {
    SPY: BASE_SERIES.map(createQuote),
    '^VIX': [
      createQuote({ date: '2024-01-10T21:00:00Z', close: 12 }),
    ],
    '^TNX': [
      createQuote({ date: '2024-01-10T21:00:00Z', close: 4.15 }),
    ],
    '2YY=F': [
      createQuote({ date: '2024-01-10T21:00:00Z', close: 4.32 }),
    ],
    '^IRX': [
      createQuote({ date: '2024-01-10T21:00:00Z', close: 5.25 }),
    ],
  };
  globalTarget.__mockYahooFinanceQuoteData = {};
};

beforeEach(() => {
  resetMockData();
});

describe('price-derived indicators', () => {
  it('computes the simple moving average over the lookback window', async () => {
    await expect(sma('SPY', 5, AS_OF)).resolves.toBeCloseTo(107.2, 5);
  });

  it('computes the exponential moving average using smoothing', async () => {
    await expect(ema('SPY', 5, AS_OF)).resolves.toBeCloseTo(107.6047, 4);
  });

  it('returns the closing price for the requested day', async () => {
    await expect(price('SPY', AS_OF)).resolves.toBe(108);
  });

  it('calculates the percentage return over the lookback', async () => {
    await expect(returnFrom('SPY', 5, AS_OF)).resolves.toBeCloseTo(3.8461, 4);
  });

  it('annualizes the volatility of daily returns', async () => {
    await expect(volatility('SPY', 5, AS_OF)).resolves.toBeCloseTo(32.113, 3);
  });

  it('computes drawdown from the historical peak', async () => {
    await expect(drawdown('SPY', AS_OF)).resolves.toBeCloseTo(1.8181, 4);
  });

  it('calculates the relative strength index', async () => {
    await expect(rsi('SPY', 5, AS_OF)).resolves.toBeCloseTo(75.586, 3);
  });

  it('exposes convenience wrappers for macro indicators', async () => {
    await expect(vix(AS_OF)).resolves.toBe(12);
    await expect(t10y(AS_OF)).resolves.toBeCloseTo(4.15, 2);
    await expect(t2y(AS_OF)).resolves.toBeCloseTo(4.32, 2);
    await expect(t3m(AS_OF)).resolves.toBeCloseTo(5.25, 2);
  });

  it('throws when there is not enough data for the requested SMA', async () => {
    const globalTarget = globalThis as MockGlobal;
    globalTarget.__mockYahooFinanceChartData.SPY = BASE_SERIES.slice(0, 3).map(
      createQuote,
    );

    await expect(sma('SPY', 5, AS_OF)).rejects.toThrow(
      'Not enough historical data to compute 5-day SMA for SPY',
    );
  });
});

describe('calendar and threshold helpers', () => {
  it('returns the month, day of week, and day of month', () => {
    expect(month(AS_OF)).toBe(1);
    expect(dayOfWeek(AS_OF)).toBe(3);
    expect(dayOfMonth(AS_OF)).toBe(10);
  });

  it('computes the ordinal day of the year', () => {
    expect(dayOfYear(AS_OF)).toBe(10);
  });

  it('returns the provided threshold value unchanged', () => {
    expect(threshold(42)).toBe(42);
  });
});
