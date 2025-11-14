import { Fragment } from 'react';
import {
  EvaluatedStrategy,
  evaluateStrategy,
  getStrategy,
} from '@/lib/strategies';
import { formatTicker } from '@/lib/tickers';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ShareButton from '@/components/ShareButton';
import VisitTestfolioButton from '@/components/VisitTestfolioButton';
import Subscribe from '@/components/Subscribe';
import ClientTimeFormat from '@/components/ClientTimeFormat';
import {
  formatIndicatorName,
  formatIndicatorValue,
  formatPercent,
  getComparisonIconName,
} from '@/lib/indicators';
import { DynamicIcon } from 'lucide-react/dynamic';

interface Props {
  searchParams: Promise<{ s?: string }>;
}

export async function generateMetadata(
  { searchParams }: Readonly<Props>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const strategyId = (await searchParams).s;
  const resolvedMetadata = await parent;
  const strategy = strategyId ? await getStrategy(strategyId) : null;
  const name = String(strategy?.name).trim() || 'Untitled Strategy';
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
          <strong>
            <ClientTimeFormat
              formatOptions={{
                weekday: 'short',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }}
              date={evaluated.asOf}
            />
          </strong>
          . Powered by{' '}
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
        <h3>Activating signals</h3>
        {evaluated.activeSignals.length === 0 ? (
          <p>No signals satisfied this allocation.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {evaluated.activeSignals.map((signal) => (
              <Card key={signal.name}>
                <CardHeader className="gap-0">
                  <p className="muted">Signal</p>
                  <CardTitle>
                    {signal.name}
                    {signal.isInverse && ' (inversed)'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-3xl">
                      {formatIndicatorValue(
                        signal.indicator_1.type,
                        signal.value1,
                      )}
                    </span>
                    <small className="muted">
                      {formatIndicatorName(signal.indicator_1)}
                    </small>
                  </div>
                  <DynamicIcon
                    name={getComparisonIconName(
                      signal.comparison,
                      signal.isInverse,
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-3xl">
                      {formatIndicatorValue(
                        signal.indicator_2.type,
                        signal.value2,
                        signal.indicator_1.type,
                      )}
                      {signal.tolerance &&
                        ` (±${formatPercent(signal.tolerance)})`}
                    </span>
                    <small className="muted">
                      {formatIndicatorName(signal.indicator_2)}
                    </small>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      <section>
        <Subscribe strategyId={strategyId} />
      </section>
    </div>
  );
}
