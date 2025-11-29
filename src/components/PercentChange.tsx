// components/PercentChange.tsx

import { Badge } from '@/components/ui/badge';
import { clsx } from 'clsx';
import { percentReturnsFormatter } from '@/lib/intl/number';
import { resolveLocales } from '@/lib/intl/locales';

import { cache } from 'react';
import { fetchYahooQuote } from '@/lib/series/yahoo';

const getQuoteChangePercent = cache(async (symbol: string) => {
  const quote = await fetchYahooQuote(symbol);
  return quote.regularMarketChangePercent as number | null;
});

export const PercentChangeValue = async ({
  value,
}: {
  value: number | null;
}) => {
  const locales = await resolveLocales();

  return (
    <Badge
      variant="secondary"
      className={clsx(
        value != null &&
          (value < 0
            ? 'bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive border-none focus-visible:outline-none'
            : 'border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'),
      )}
    >
      {value == null ? String(NaN) : percentReturnsFormatter(locales, value)}
    </Badge>
  );
};

export const PercentChangeSkeleton = () => (
  <Badge variant="secondary" className="animate-pulse">
    <span className="opacity-0">{String(NaN)}</span>
  </Badge>
);

export const PercentChangeSymbol = async ({ symbol }: { symbol: string }) => {
  let value: number | null = null;

  try {
    value = await getQuoteChangePercent(symbol);
  } catch (e) {
    console.error((e as Error).message);
  }

  return <PercentChangeValue value={value} />;
};

// total, waits for *all* holdings
export const TotalAllocationChange = async ({
  symbols,
}: {
  symbols: string[];
}) => {
  const values = await Promise.all(
    symbols.map(async (s) => {
      try {
        return await getQuoteChangePercent(s);
      } catch {
        return 0;
      }
    }),
  );

  const totalChange = values.reduce((sum, v) => Number(sum) + (v ?? 0), 0);

  return <PercentChangeValue value={totalChange} />;
};
