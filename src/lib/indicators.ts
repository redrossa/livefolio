import YahooFinance from 'yahoo-finance2';
import { ObservationSeries } from '@/lib/fred';
import { Comparison, Indicator, IndicatorType } from '@/lib/testfolio';
import { IconName } from 'lucide-react/dynamic';
import { formatTicker } from '@/lib/tickers';
import { EvaluatedSignal } from '@/lib/strategies';

const yahooFinance = new YahooFinance();

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MARKET_CLOSE_UTC_HOUR = 21; // 4:00 p.m. ET expressed in UTC
const FRED_SERIES = new Set(['DTB3', 'DFF', 'CPIAUCNS']);
const isSameUTCDate = (a: Date, b: Date): boolean =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

const getUTCStartOfDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const getMarketCloseUTC = (date: Date): Date => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      MARKET_CLOSE_UTC_HOUR,
      0,
    ),
  );
};

const marketCloseTimestamp = (date: Date): number =>
  getMarketCloseUTC(date).getTime();

type QuoteRow = {
  date: Date;
  high: number | null;
  low: number | null;
  open: number | null;
  close: number | null;
  volume: number | null;
  adjclose?: number | null;
  adjClose?: number | null;
};

type CloseSeriesEntry = { date: Date; close: number };

const getCloseValue = (quote: QuoteRow): number | null =>
  quote.close ?? quote.adjclose ?? quote.adjClose ?? null;

const formatFredDate = (date: Date): string => date.toISOString().slice(0, 10);

async function fetchQuoteRows(
  symbol: string,
  period1: Date,
  period2: Date,
): Promise<QuoteRow[]> {
  if (FRED_SERIES.has(symbol)) {
    return fetchFredQuoteRows(symbol, period1, period2);
  }

  const result = await yahooFinance.chart(symbol, {
    period1,
    period2,
    interval: '1d',
    return: 'array',
  });

  const quotes = result.quotes ?? [];
  return quotes.filter((quote): quote is QuoteRow => Boolean(quote.date));
}

async function fetchFredQuoteRows(
  symbol: string,
  period1: Date,
  period2: Date,
): Promise<QuoteRow[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error('FRED_API_KEY environment variable is required');
  }

  const params = new URLSearchParams({
    series_id: symbol,
    api_key: apiKey,
    file_type: 'json',
    observation_start: formatFredDate(period1),
    observation_end: formatFredDate(period2),
  });

  const response = await fetch(
    `https://api.stlouisfed.org/fred/series/observations?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch FRED series ${symbol}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as ObservationSeries;
  const observations = Array.isArray(payload?.observations)
    ? payload.observations
    : [];

  return observations
    .map((obs) => {
      const value = Number(obs.value);
      const date = new Date(obs.date);
      if (!Number.isFinite(value) || Number.isNaN(date.getTime())) {
        return null;
      }

      return {
        date,
        high: null,
        low: null,
        open: null,
        close: value,
        volume: null,
      } as QuoteRow;
    })
    .filter((row): row is QuoteRow => Boolean(row));
}

function mapUnderlyingSeries(quotes: QuoteRow[]): CloseSeriesEntry[] {
  return quotes
    .map((row) => {
      const close = getCloseValue(row);
      return close == null
        ? null
        : { date: getMarketCloseUTC(row.date), close };
    })
    .filter((row): row is CloseSeriesEntry => Boolean(row))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function applyLeverage(
  series: CloseSeriesEntry[],
  leverage: number,
): CloseSeriesEntry[] {
  if (leverage === 1 || series.length === 0) {
    return series;
  }

  const leveraged: CloseSeriesEntry[] = [
    { date: series[0].date, close: series[0].close },
  ];
  let syntheticClose = series[0].close;

  for (let i = 1; i < series.length; i++) {
    const prevClose = series[i - 1].close;
    if (prevClose === 0) {
      throw new Error(
        'Cannot compute leveraged price because a previous close was zero',
      );
    }

    const currClose = series[i].close;
    const dailyReturn = currClose / prevClose - 1;
    syntheticClose = syntheticClose * (1 + leverage * dailyReturn);
    leveraged.push({ date: series[i].date, close: syntheticClose });
  }

  return leveraged;
}

async function getRealtimePrice(symbol: string): Promise<number> {
  const quote = await yahooFinance.quote(symbol);
  const realTimePrice =
    quote.regularMarketPrice ??
    quote.postMarketPrice ??
    quote.preMarketPrice ??
    quote.bid ??
    quote.ask;

  if (realTimePrice == null) {
    throw new Error(`No real-time price available for ${symbol}`);
  }

  return realTimePrice;
}

async function buildSeriesUpTo(
  ticker: string,
  asOf: Date,
  period1: Date,
  leverage = 1,
): Promise<CloseSeriesEntry[]> {
  const asOfClose = getMarketCloseUTC(asOf);
  const period2 = new Date(asOfClose.getTime() + DAY_IN_MS); // exclusive end

  const quotes = await fetchQuoteRows(ticker, period1, period2);
  const underlyingSeries = mapUnderlyingSeries(quotes);
  let series = applyLeverage(underlyingSeries, leverage).filter(
    (entry) => entry.date.getTime() < period2.getTime(),
  );

  const targetTime = marketCloseTimestamp(asOf);
  const isFredTicker = FRED_SERIES.has(ticker);

  if (!isFredTicker && isSameUTCDate(asOf, new Date()) && series.length) {
    const hasToday = series.some(
      (entry) => entry.date.getTime() === targetTime,
    );
    if (!hasToday && underlyingSeries.length) {
      const lastUnderlyingClose =
        underlyingSeries[underlyingSeries.length - 1].close;
      if (lastUnderlyingClose !== 0) {
        const lastSyntheticClose = series[series.length - 1].close;
        const realtimeUnderlying = await getRealtimePrice(ticker);
        const dailyReturn = lastUnderlyingClose
          ? realtimeUnderlying / lastUnderlyingClose - 1
          : 0;
        const leveragedToday =
          lastSyntheticClose * (1 + leverage * dailyReturn);
        series = [
          ...series,
          { date: getMarketCloseUTC(asOf), close: leveragedToday },
        ];
      }
    }
  }

  return series.filter((entry) => entry.date.getTime() <= targetTime);
}

async function buildEligibleSeries(
  ticker: string,
  lookback: number,
  asOf: Date,
  leverage = 1,
): Promise<CloseSeriesEntry[]> {
  const asOfClose = getMarketCloseUTC(asOf);

  if (ticker === 'ZEROX') {
    const count = Math.max(lookback, 1);
    const zeroSeries: CloseSeriesEntry[] = [];
    for (let i = count - 1; i >= 0; i--) {
      zeroSeries.push({
        date: new Date(asOfClose.getTime() - i * DAY_IN_MS),
        close: 0,
      });
    }
    return zeroSeries;
  }

  const bufferDays = Math.max(lookback * 2, lookback + 15); // cover weekends/holidays
  const period1 = new Date(asOfClose.getTime() - bufferDays * DAY_IN_MS);
  return buildSeriesUpTo(ticker, asOf, period1, leverage);
}

export async function sma(
  ticker: string,
  lookback: number,
  asOf: Date,
  leverage = 1,
): Promise<number> {
  if (lookback <= 0) {
    throw new Error('Lookback must be a positive integer');
  }

  const eligible = await buildEligibleSeries(ticker, lookback, asOf, leverage);

  if (eligible.length < lookback) {
    throw new Error(
      `Not enough historical data to compute ${lookback}-day SMA for ${ticker}`,
    );
  }

  const window = eligible.slice(-lookback);
  const total = window.reduce((sum, entry) => sum + entry.close, 0);

  return total / lookback;
}

export async function ema(
  ticker: string,
  lookback: number,
  asOf: Date,
  leverage = 1,
): Promise<number> {
  if (lookback <= 0) {
    throw new Error('Lookback must be a positive integer');
  }

  const eligible = await buildEligibleSeries(ticker, lookback, asOf, leverage);

  if (eligible.length < lookback) {
    throw new Error(
      `Not enough historical data to compute ${lookback}-day EMA for ${ticker}`,
    );
  }

  const window = eligible.slice(-lookback);
  const smoothing = 2 / (lookback + 1);

  let emaValue = window[0].close;
  for (let i = 1; i < window.length; i++) {
    emaValue = window[i].close * smoothing + emaValue * (1 - smoothing);
  }

  return emaValue;
}

export async function price(
  ticker: string,
  asOf: Date,
  leverage = 1,
): Promise<number> {
  const asOfClose = getMarketCloseUTC(asOf);
  const period1 = new Date(asOfClose.getTime() - 40 * DAY_IN_MS);
  const series = await buildSeriesUpTo(ticker, asOf, period1, leverage);

  const targetTime = marketCloseTimestamp(asOf);
  const match = series.find((entry) => entry.date.getTime() === targetTime);

  if (!match) {
    throw new Error(
      `No closing price found for ${ticker} on ${asOf.toISOString()}`,
    );
  }

  return match.close;
}

export async function returnFrom(
  ticker: string,
  lookback: number,
  asOf: Date,
  leverage = 1,
): Promise<number> {
  if (lookback <= 0) {
    throw new Error('Lookback must be a positive integer');
  }

  const series = await buildEligibleSeries(
    ticker,
    lookback + 1,
    asOf,
    leverage,
  );

  if (series.length < lookback + 1) {
    throw new Error(
      `Not enough historical data to compute ${lookback}-day return for ${ticker}`,
    );
  }

  const window = series.slice(-(lookback + 1));
  const pastPrice = window[0].close;
  const currentPrice = window[window.length - 1].close;

  if (pastPrice === 0) {
    throw new Error(
      `Cannot compute return: ${ticker} price ${lookback} days ago was zero`,
    );
  }

  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

export async function volatility(
  ticker: string,
  lookback: number,
  asOf: Date,
  leverage = 1,
): Promise<number> {
  if (lookback <= 1) {
    throw new Error('Lookback must be greater than 1 to compute volatility');
  }

  const eligible = await buildEligibleSeries(
    ticker,
    lookback + 1,
    asOf,
    leverage,
  );

  if (eligible.length < lookback + 1) {
    throw new Error(
      `Not enough historical data to compute volatility for ${ticker}`,
    );
  }

  const window = eligible.slice(-(lookback + 1));
  const returns: number[] = [];

  for (let i = 1; i < window.length; i++) {
    const prev = window[i - 1].close;
    const curr = window[i].close;

    if (prev === 0) {
      throw new Error(
        `Cannot compute return for ${ticker}: encountered zero price on ${window[
          i - 1
        ].date.toISOString()}`,
      );
    }

    returns.push(curr / prev - 1);
  }

  if (returns.length < 2) {
    throw new Error(
      `Not enough return observations to compute volatility for ${ticker}`,
    );
  }

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (returns.length - 1);
  const dailyStdDev = Math.sqrt(variance);

  const tradingDaysPerYear = 252;
  return dailyStdDev * Math.sqrt(tradingDaysPerYear) * 100;
}

export async function drawdown(
  ticker: string,
  asOf: Date,
  leverage = 1,
): Promise<number> {
  const eligible = await buildSeriesUpTo(ticker, asOf, new Date(0), leverage);

  if (!eligible.length) {
    throw new Error(`No historical data to compute drawdown for ${ticker}`);
  }

  const current = eligible[eligible.length - 1].close;
  const peak = eligible.reduce(
    (max, entry) => (entry.close > max ? entry.close : max),
    eligible[0].close,
  );

  if (peak === 0) {
    throw new Error(`Cannot compute drawdown: ${ticker} peak price is zero`);
  }

  return ((peak - current) / peak) * 100;
}

export async function rsi(
  ticker: string,
  lookback: number,
  asOf: Date,
  leverage = 1,
): Promise<number> {
  if (lookback <= 0) {
    throw new Error('Lookback must be a positive integer');
  }

  const eligible = await buildEligibleSeries(
    ticker,
    lookback + 1,
    asOf,
    leverage,
  );

  if (eligible.length < lookback + 1) {
    throw new Error(`Not enough historical data to compute RSI for ${ticker}`);
  }

  const window = eligible.slice(-(lookback + 1));
  const changes: number[] = [];

  for (let i = 1; i < window.length; i++) {
    changes.push(window[i].close - window[i - 1].close);
  }

  const gains = changes.map((delta) => (delta > 0 ? delta : 0));
  const losses = changes.map((delta) => (delta < 0 ? -delta : 0));

  const hasGain = gains.some((g) => g > 0);
  const hasLoss = losses.some((l) => l > 0);

  if (!hasGain && !hasLoss) {
    return 50;
  }

  if (!hasGain) {
    return 0;
  }

  if (!hasLoss) {
    return 100;
  }

  const alpha = 1 / lookback;
  const computeEma = (values: number[]): number => {
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
      ema = alpha * values[i] + (1 - alpha) * ema;
    }
    return ema;
  };

  const avgGain = computeEma(gains);
  const avgLoss = computeEma(losses);

  if (avgLoss === 0) {
    return 100;
  }

  if (avgGain === 0) {
    return 0;
  }

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export async function vix(asOf: Date): Promise<number> {
  return price('^VIX', asOf);
}

export async function t10y(asOf: Date): Promise<number> {
  return price('^TNX', asOf);
}

export async function t2y(asOf: Date): Promise<number> {
  return price('2YY=F', asOf);
}

export async function t3m(asOf: Date): Promise<number> {
  return price('^IRX', asOf);
}

export function month(asOf: Date): number {
  return asOf.getUTCMonth() + 1;
}

export function dayOfWeek(asOf: Date): number {
  return asOf.getUTCDay();
}

export function dayOfMonth(asOf: Date): number {
  return asOf.getUTCDate();
}

export function dayOfYear(asOf: Date): number {
  const startOfYear = Date.UTC(asOf.getUTCFullYear(), 0, 1);
  const target = getUTCStartOfDay(asOf).getTime();
  return Math.floor((target - startOfYear) / DAY_IN_MS) + 1;
}

export function threshold(value: number): number {
  return value;
}

const dollarFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'percent',
  unitDisplay: 'narrow', // or 'short', 'long'
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function formatDollar(value: number): string {
  return dollarFormatter.format(value);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function formatRsi(value: number): string {
  return value.toFixed(2);
}

export function formatDayOfWeek(value: number): string {
  return days[value];
}

export function formatIndicatorValue(
  type: IndicatorType,
  value: number,
  otherType?: IndicatorType,
): string {
  switch (type) {
    case 'SMA':
    case 'EMA':
    case 'Price':
    case 'VIX':
    case 'T10Y':
    case 'T2Y':
    case 'T3M':
      return formatDollar(value);
    case 'RSI':
      return formatRsi(value);
    case 'Return':
    case 'Volatility':
    case 'Drawdown':
      return formatPercent(value);
    case 'Day of Week':
      return formatDayOfWeek(value);
    case 'Threshold':
      return otherType ? formatIndicatorValue(otherType, value) : String(value);
    default:
      return String(value);
  }
}

export function formatIndicatorName(indicator: Indicator) {
  const ticker = formatTicker(indicator.ticker);
  const type = indicator.type;
  const lookback = indicator.lookback ? `(${indicator.lookback})` : '';
  const delay = indicator.delay ? `${indicator.delay}d Delay` : '';
  return `${ticker} ${type} ${lookback} ${delay}`.trim();
}

export function getComparisonIconName(
  comparison: Comparison,
  isInverse: boolean = false,
): IconName {
  switch (comparison) {
    case '>':
      return !isInverse ? 'chevron-right' : 'chevron-left';
    case '<':
      return !isInverse ? 'chevron-left' : 'chevron-right';
    case '=':
      return !isInverse ? 'equal' : 'equal-not';
  }
}

export function formatTolerance(
  value: number | null,
  sign: EvaluatedSignal['toleranceSign'],
) {
  return !value ? '' : `(${sign}${formatPercent(value)})`;
}
