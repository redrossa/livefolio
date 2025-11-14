import VisitTestfolioButton from '@/components/VisitTestfolioButton';
import ShareButton from '@/components/ShareButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fragment } from 'react';
import { formatTicker } from '@/lib/tickers';
import ClientTimeFormat from '@/components/ClientTimeFormat';
import Link from 'next/link';
import {
  formatIndicatorName,
  formatIndicatorValue,
  formatPercent,
  getComparisonIconName,
} from '@/lib/indicators';
import { DynamicIcon } from 'lucide-react/dynamic';
import Subscribe from '@/components/Subscribe';
import {
  EvaluatedStrategy,
  evaluateStrategy,
  getStrategy,
} from '@/lib/strategies';

interface Props {
  strategyId: string;
}

export const Strategy = async ({ strategyId }: Props) => {
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
};

export const StrategySkeleton = () => {
  return (
    <section>
      <div className="animate-pulse bg-secondary rounded-full h-3.5 w-1/4" />
      <div className="animate-pulse bg-secondary rounded-full h-9 w-1/2 mt-3" />
      <div className="animate-pulse bg-secondary rounded-xl h-48 w-full mt-6" />
      <div className="animate-pulse bg-secondary rounded-full h-6 w-1/2 mt-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="animate-pulse bg-secondary rounded-xl h-48" />
        <div className="animate-pulse bg-secondary rounded-xl h-48" />
        <div className="animate-pulse bg-secondary rounded-xl h-48" />
        <div className="animate-pulse bg-secondary rounded-xl h-48" />
        <div className="animate-pulse bg-secondary rounded-xl h-48" />
        <div className="animate-pulse bg-secondary rounded-xl h-48" />
        <div className="animate-pulse bg-secondary rounded-xl h-48" />
        <div className="animate-pulse bg-secondary rounded-xl h-48" />
      </div>
    </section>
  );
};
