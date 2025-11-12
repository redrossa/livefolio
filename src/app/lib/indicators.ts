import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const isSameUTCDate = (a: Date, b: Date): boolean =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

const getUTCStartOfDay = (date: Date): Date =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );

const utcMidnightTime = (date: Date): number =>
  getUTCStartOfDay(date).getTime();

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

async function fetchQuoteRows(
  symbol: string,
  period1: Date,
  period2: Date,
): Promise<QuoteRow[]> {
  const result = await yahooFinance.chart(symbol, {
    period1,
    period2,
    interval: '1d',
    return: 'array',
  });

  const quotes = result.quotes ?? [];
  return quotes.filter((quote): quote is QuoteRow => Boolean(quote.date));
}

function mapUnderlyingSeries(quotes: QuoteRow[]): CloseSeriesEntry[] {
  return quotes
    .map((row) => {
      const close = getCloseValue(row);
      return close == null
        ? null
        : { date: getUTCStartOfDay(row.date), close };
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
  const dayStart = getUTCStartOfDay(asOf);
  const period2 = new Date(dayStart.getTime() + DAY_IN_MS); // exclusive end

  const quotes = await fetchQuoteRows(ticker, period1, period2);
  const underlyingSeries = mapUnderlyingSeries(quotes);
  let series = applyLeverage(underlyingSeries, leverage).filter(
    (entry) => entry.date.getTime() < period2.getTime(),
  );

  const targetTime = utcMidnightTime(asOf);

  if (isSameUTCDate(asOf, new Date()) && series.length) {
    const hasToday = series.some((entry) => isSameUTCDate(entry.date, asOf));
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
          { date: getUTCStartOfDay(asOf), close: leveragedToday },
        ];
      }
    }
  }

  return series.filter((entry) => utcMidnightTime(entry.date) <= targetTime);
}

async function buildEligibleSeries(
  ticker: string,
  lookback: number,
  asOf: Date,
  leverage = 1,
): Promise<CloseSeriesEntry[]> {
  const dayStart = getUTCStartOfDay(asOf);
  const bufferDays = Math.max(lookback * 2, lookback + 15); // cover weekends/holidays
  const period1 = new Date(dayStart.getTime() - bufferDays * DAY_IN_MS);
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
  const dayStart = getUTCStartOfDay(asOf);
  const period1 = new Date(dayStart.getTime() - 40 * DAY_IN_MS);
  const series = await buildSeriesUpTo(ticker, asOf, period1, leverage);

  const match = series.find((entry) => isSameUTCDate(entry.date, asOf));

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
  const target = utcMidnightTime(asOf);
  return Math.floor((target - startOfYear) / DAY_IN_MS) + 1;
}

export function threshold(value: number): number {
  return value;
}
