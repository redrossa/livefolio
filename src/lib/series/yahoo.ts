import { SeriesPoint } from '@/lib/series';
import {
  toUSMarketDateString,
  toUTCMarketClose,
  toUTCMarketOpen,
} from '@/lib/market/dates';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export default async function fetchYahooSeries(
  ticker: string,
  start: string,
  end: string,
): Promise<SeriesPoint[]> {
  const result = await yahooFinance.chart(ticker, {
    period1: toUTCMarketOpen(start),
    period2: toUTCMarketClose(end),
    interval: '1d',
    return: 'array',
  });

  const quotes = result.quotes.map((q) => ({
    date: toUSMarketDateString(q.date),
    value: q.close ?? 0,
  }));
  const today = new Date();

  if (
    today.getUTCHours() < 21 &&
    today.getUTCDate() ===
      result.quotes[result.quotes.length - 1].date.getUTCDate()
  ) {
    // exclude today's non-closing price, taking into consideration the possibility that Yahoo Finance date time
    // lags even if the market already closessdfssdfsdf
    quotes.pop();
  }

  return quotes;
}

export async function fetchYahooQuote(ticker: string) {
  return yahooFinance.quote(ticker);
}
