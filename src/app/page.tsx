import { Fragment } from 'react';
import {
  EvaluatedStrategy,
  evaluateStrategy,
  getStrategy,
} from '@/lib/strategies';
import { formatTicker } from '@/lib/tickers';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ShareButton from '@/components/ShareButton';
import VisitTestfolioButton from '@/components/VisitTestfolioButton';
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
  const name = strategy?.name ?? 'Untitled Strategy';
  return {
    title: strategy ? `Livefol.io | ${name}` : 'Livefol.io',
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
    <div className="space-y-6">
      <section>
        <p className="muted">Strategy</p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h1>{evaluated.strategy.name || 'Untitled Strategy'}</h1>
          <div className="space-x-2">
            <VisitTestfolioButton />
            <ShareButton />
          </div>
        </div>
        <Card className="mt-6 rounded-md">
          <CardHeader className="gap-0">
            <p className="muted">Current Allocation</p>
            <h2>
              {allocation.name || `Allocation ${evaluated.allocationIndex}`}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <span className="large">Holdings</span>
              <span className="large">Distributions</span>
              {allocation.tickers.map((ticker) => (
                <Fragment key={ticker.ticker}>
                  <span className="small">{formatTicker(ticker.ticker)}</span>
                  <span className="small">{ticker.percent}%</span>
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
        <p>
          Showing holdings as of{' '}
          <strong>{formatter.format(evaluated.asOf)}</strong>. Powered by{' '}
          <Link
            href="https://github.com/gadicc/yahoo-finance2"
            target="_blank"
            className="link"
          >
            yahoo-finance2
          </Link>
          .
        </p>
      </section>
      <section>
        <Subscribe />
      </section>
    </div>
  );
}
