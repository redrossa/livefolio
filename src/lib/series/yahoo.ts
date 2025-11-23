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

  const today = toUSMarketDateString(new Date());

  const quotes = (result.quotes ?? []).filter((quote) => {
    // Yahoo intraday data for the current session arrives before 21:00 UTC;
    // only keep today's point once the market has closed to avoid partial days.
    if (!quote.date) {
      return false;
    }

    const quoteDate = quote.date;
    const quoteMarketDate = toUSMarketDateString(quoteDate);
    if (quoteMarketDate !== today) {
      return true;
    }

    const hours = quoteDate.getUTCHours();
    const minutes = quoteDate.getUTCMinutes();
    return hours > 21 || (hours === 21 && minutes >= 0);
  });

  return quotes.map((q) => ({
    date: toUSMarketDateString(q.date),
    value: q.close ?? 0,
  }));
}

export async function fetchYahooQuote(ticker: string) {
  return yahooFinance.quote(ticker);
}
