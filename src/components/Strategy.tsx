import VisitTestfolioButton from '@/components/VisitTestfolioButton';
import ShareButton from '@/components/ShareButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubscribeForm from '@/components/SubscribeForm';
import {
  evalStrategy,
  Indicator,
  Signal,
  Strategy as EvaluatedStrategy,
} from '@/lib/evaluators';
import { getStrategy } from '@/lib/testfolio';
import { ChevronLeft, ChevronRight, Equal, EqualNot } from 'lucide-react';
import { toUTCMarketClose } from '@/lib/market/dates';
import { dollarFormatter, percentFormatter } from '@/lib/intl/number';
import { Allocation } from '@/components/Allocation';
import resolveLocales from '@/lib/headers/resolveLocales';

interface Props {
  strategyLinkId: string;
}

export const Strategy = async ({ strategyLinkId }: Props) => {
  let evaluated: EvaluatedStrategy;
  try {
    const strategy = await getStrategy(strategyLinkId);
    evaluated = await evalStrategy(strategy, strategyLinkId);
  } catch (e) {
    console.error((e as Error).message);
    return <p>Something went wrong evaluating this strategy.</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="muted">Strategy</p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h1>{evaluated.name}</h1>
          <div className="space-x-2">
            <VisitTestfolioButton />
            <ShareButton />
          </div>
        </div>
      </section>
      <section>
        <h3>Current Allocation</h3>
        <p className="text-muted-foreground">
          Present evaluation is based on previous day&#39;s closing prices.
        </p>
        <Allocation allocation={evaluated.allocation} />
      </section>
      <section>
        <h3>Active Signals</h3>
        <p className="text-muted-foreground">
          Minimum required signals that activate the current allocation.
        </p>
        {evaluated.allocation.signals.length === 0 ? (
          <p>No signals satisfied this allocation.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {evaluated.allocation.signals.map((signal, index) => (
              <StrategySignal signal={signal} key={`${signal.name}-${index}`} />
            ))}
          </div>
        )}
      </section>
      <section>
        <SubscribeForm
          strategyLinkId={strategyLinkId}
          strategyName={evaluated.name}
        />
      </section>
    </div>
  );
};

export const StrategySkeleton = () => (
  <section>
    <div className="animate-pulse bg-secondary rounded-full h-3.5 w-1/4" />
    <div className="animate-pulse bg-secondary rounded-full h-9 w-1/2 mt-4" />
    <div className="animate-pulse bg-secondary rounded-xl h-48 w-full mt-8" />
    <div className="animate-pulse bg-secondary rounded-full h-9 w-1/2 mt-8" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

const StrategySignal = ({ signal }: { signal: Signal }) => {
  const isInversed = !signal.isTrue;

  let Comparison;
  let toleranceSign: '-' | '+' | '±';
  switch (signal.comparison) {
    case '>':
      Comparison = !isInversed ? ChevronRight : ChevronLeft;
      toleranceSign = !isInversed ? '-' : '+';
      break;
    case '<':
      Comparison = !isInversed ? ChevronLeft : ChevronRight;
      toleranceSign = !isInversed ? '+' : '-';
      break;
    case '=':
      Comparison = !isInversed ? Equal : EqualNot;
      toleranceSign = '±';
      break;
  }

  return (
    <Card key={signal.name}>
      <CardHeader className="gap-0">
        <p className="muted">Signal</p>
        <CardTitle className="overflow-hidden">
          <div className="truncate">
            {signal.name}
            {isInversed && ' (inversed)'}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4">
        <StrategyIndicator indicator={signal.indicator1} />
        <Comparison size={36} />
        <StrategyIndicator
          indicator={signal.indicator2}
          tolerance={{ sign: toleranceSign, value: signal.tolerance }}
        />
      </CardContent>
    </Card>
  );
};

const StrategyIndicator = async ({
  indicator,
  tolerance,
}: {
  indicator: Indicator;
  tolerance?: { sign: '-' | '+' | '±'; value: number };
}) => {
  const locales = await resolveLocales();
  let formattedValue: string;
  switch (indicator.unit) {
    case '$':
      formattedValue = dollarFormatter(locales, indicator.value);
      break;
    case '%':
      formattedValue = percentFormatter(locales, indicator.value);
      break;
    default:
      formattedValue = indicator.value.toFixed(2);
      break;
  }

  if (tolerance?.value) {
    formattedValue += ` (${tolerance.sign}${percentFormatter(locales, tolerance.value)})`;
  }

  const type = indicator.type;
  const lookback = indicator.lookback ? `(${indicator.lookback})` : '';
  const delay = indicator.delay ? `${indicator.delay}d Delay` : '';
  const name =
    `${indicator.ticker.display} ${type} ${lookback} ${delay}`.trim();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-3xl">{formattedValue}</span>
      <small className="muted">{name}</small>
      <small className="muted">
        {new Intl.DateTimeFormat(locales, {
          month: 'short', // Abbreviated month name (e.g., Nov)
          day: 'numeric', // Day of the month (e.g., 23)
          year: 'numeric', // Full year (e.g., 2025)
        }).format(toUTCMarketClose(indicator.date))}
      </small>
    </div>
  );
};
