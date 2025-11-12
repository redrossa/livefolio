import { Fragment } from 'react';
import {
  EvaluatedStrategy,
  evaluateStrategy,
  getStrategy,
} from '@/lib/strategies';
import { formatTicker } from '@/lib/tickers';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';
import Subscribe from '@/components/Subscribe';

interface Props {
  searchParams: Promise<{ s?: string }>;
}

const options: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const formatter = new Intl.DateTimeFormat('en-US', options);

export async function generateMetadata(
  { searchParams }: Readonly<Props>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const strategyId = (await searchParams).s;
  const resolvedMetadata = await parent;
  const strategy = strategyId ? await getStrategy(strategyId) : null;
  return {
    title: strategy ? `Livefol.io | ${strategy.name}` : 'Livefol.io',
    description: resolvedMetadata.description,
  };
}

export default async function Home({ searchParams }: Readonly<Props>) {
  const strategyId = (await searchParams).s;
  if (!strategyId) {
    return null;
  }

  let evaluated: EvaluatedStrategy;
  try {
    const strategy = await getStrategy(strategyId);
    evaluated = await evaluateStrategy(strategy);
  } catch (e) {
    return <p>{(e as Error).message}</p>;
  }

  const allocation = evaluated.strategy.allocations[evaluated.allocationIndex];

  return (
    <section className="space-y-4 border-t border-foreground/20 pt-4">
      <div>
        <p className="text-sm text-foreground/60">Strategy</p>
        <h2 className="text-3xl font-bold mb-2">
          {evaluated.strategy.name || 'Untitled Strategy'}
        </h2>
        <p>
          Showing current holdings as of{' '}
          <strong>{formatter.format(evaluated.asOf)}</strong>. Powered by{' '}
          <Link
            href="https://github.com/gadicc/yahoo-finance2"
            className="text-accent underline"
          >
            yahoo-finance2
          </Link>
          .
        </p>
      </div>
      <div className="max-w-lg border border-solid border-foreground/10 rounded-xs p-8 space-y-6">
        <div>
          <p className="text-sm text-foreground/60">Allocation</p>
          <h3 className="text-2xl">
            {allocation.name || `Allocation ${evaluated.allocationIndex}`}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-lg">
          <p className="font-bold">Holdings</p>
          <p className="font-bold">Distributions</p>
          {allocation.tickers.map((ticker) => (
            <Fragment key={ticker.ticker}>
              <p>{formatTicker(ticker.ticker)}</p>
              <p>{ticker.percent}%</p>
            </Fragment>
          ))}
        </div>
      </div>
      <Subscribe />
    </section>
  );
}
