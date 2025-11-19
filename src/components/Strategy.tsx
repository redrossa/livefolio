import VisitTestfolioButton from '@/components/VisitTestfolioButton';
import ShareButton from '@/components/ShareButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fragment } from 'react';
import Subscribe from '@/components/Subscribe';
import {
  Allocation,
  evalStrategy,
  Indicator,
  Signal,
  Strategy as EvaluatedStrategy,
} from '@/lib/evaluators';
import { getStrategy } from '@/lib/testfolio';
import { ChevronLeft, ChevronRight, Equal, EqualNot } from 'lucide-react';

interface Props {
  strategyId: string;
}

export const Strategy = async ({ strategyId }: Props) => {
  let evaluated: EvaluatedStrategy;
  try {
    const strategy = await getStrategy(strategyId);
    evaluated = await evalStrategy(strategy, strategyId);
  } catch (e) {
    console.error((e as Error).message);
    return <p>Something went wrong evaluating this strategy.</p>;
  }

  console.log(evaluated.date);

  return (
    <div className="space-y-6">
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
          Today&#39;s evaluation is based on previous day&#39;s closing prices.
        </p>
        <StrategyAllocation allocation={evaluated.allocation} />
      </section>
      <section>
        <h3>Active Signals</h3>
        <p className="text-muted-foreground">
          Minimum required signals that activate the current allocation.
        </p>
        {evaluated.allocation.signals.length === 0 ? (
          <p>No signals satisfied this allocation.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {evaluated.allocation.signals.map((signal, index) => (
              <StrategySignal signal={signal} key={`${signal.name}-${index}`} />
            ))}
          </div>
        )}
      </section>
      <section>
        <Subscribe strategyId={strategyId} strategyName={evaluated.name} />
      </section>
    </div>
  );
};

export const StrategySkeleton = () => (
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

export const StrategyAllocation = ({
  allocation,
}: {
  allocation: Allocation;
}) => (
  <Card className="mt-6 rounded-md">
    <CardHeader className="gap-0">
      <p className="muted">Allocation</p>
      <h3 className="mt-0">{allocation.name}</h3>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4 text-lg">
        <span className="large">Holdings</span>
        <span className="large">Distributions</span>
        {allocation.holdings.map(({ ticker, distribution }, i) => (
          <Fragment key={`${ticker.display}-${i}`}>
            <span className="small">{ticker.display}</span>
            <span className="small">{distribution}%</span>
          </Fragment>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const StrategySignal = ({ signal }: { signal: Signal }) => {
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
        <CardTitle>
          {signal.name}
          {isInversed && ' (inversed)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <StrategyIndicator indicator={signal.indicator1} />
        <Comparison />
        <StrategyIndicator
          indicator={signal.indicator2}
          tolerance={{ sign: toleranceSign, value: signal.tolerance }}
        />
      </CardContent>
    </Card>
  );
};

export const StrategyIndicator = ({
  indicator,
  tolerance,
}: {
  indicator: Indicator;
  tolerance?: { sign: '-' | '+' | '±'; value: number };
}) => {
  let formattedValue: string;
  switch (indicator.unit) {
    case '$':
      formattedValue = dollarFormatter.format(indicator.value);
      break;
    case '%':
      formattedValue = percentFormatter.format(indicator.value);
      break;
    default:
      formattedValue = indicator.value.toFixed(2);
      break;
  }

  if (tolerance?.value) {
    formattedValue += ` (${tolerance.sign}${percentFormatter.format(tolerance.value)})`;
  }

  const type = indicator.type;
  const lookback = indicator.lookback ? `(${indicator.lookback})` : '';
  const delay = indicator.delay ? `${indicator.delay}d Delay` : '';
  const name =
    `${indicator.ticker.display} ${type} ${lookback} ${delay}`.trim();

  return (
    <div className="flex flex-col">
      <span className="text-3xl">{formattedValue}</span>
      <small className="muted">{name}</small>
    </div>
  );
};

const dollarFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'percent',
  unitDisplay: 'narrow',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
