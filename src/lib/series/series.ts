import { FRED_TICKERS, MAX_SERIES_START_DATE } from '@/lib/series';
import { delayDate } from '@/lib/market/dates';
import fetchZeroSeries from '@/lib/series/zero';
import fetchFredSeries from '@/lib/series/fred';
import fetchYahooSeries from '@/lib/series/yahoo';

export interface SeriesPoint {
  date: string;
  value: number;
}

/**
 * Returns a series of date-close price pairs of a given ticker, sorted by date
 * in ascending order. All dates in the series are unique. The length of the
 * returned series is the given length if non-null, else the maximum available
 * data for the ticker up to 1954.
 * @param ticker ticker symbol
 * @param end date string
 * @param length number of data points returned
 */
export default async function fetchSeries(
  ticker: string,
  end: string,
  length: number | null = 1,
): Promise<SeriesPoint[]> {
  const isMax = length == null;
  const start = isMax
    ? MAX_SERIES_START_DATE
    : delayDate(end, Math.max(length * 2, length + 15));

  let series: SeriesPoint[];
  if (ticker === 'ZEROX') {
    series = await fetchZeroSeries(start, end);
  } else if (FRED_TICKERS.includes(ticker)) {
    series = await fetchFredSeries(ticker, start, end);
  } else {
    series = await fetchYahooSeries(ticker, start, end);
  }

  if (isMax) {
    return series;
  }

  const index = series.length - length;
  if (index < 0) {
    throw new Error(
      `There's not enough series data available for ${ticker}: ${series.length} out of ${length} asked.`,
    );
  }

  return series.slice(index);
}
