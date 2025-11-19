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

  const quotes = result.quotes ?? [];
  return quotes.map((q) => ({
    date: toUSMarketDateString(q.date),
    value: q.close ?? 0,
  }));
}
