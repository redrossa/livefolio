import { Fragment, Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Allocation as EvaluatedAllocation } from '@/lib/evaluators/allocation';
import {
  PercentChangeSkeleton,
  PercentChangeSymbol,
  TotalAllocationChange,
} from '@/components/PercentChange';

interface Props {
  allocation: EvaluatedAllocation;
}

export function Allocation({ allocation }: Readonly<Props>) {
  const symbols = allocation.holdings.map((h) => h.ticker.symbol);

  return (
    <Card className="mt-4 rounded-md">
      <CardHeader className="gap-0 border-b border-solid border-border pb-3">
        <p className="muted">Allocation</p>
        <div className="flex items-center justify-between md:justify-start gap-2 overflow-hidden">
          <h3 className="mt-0 truncate">{allocation.name}</h3>
          {/* TOTAL: waits until all quotes resolved */}
          <Suspense fallback={<PercentChangeSkeleton />}>
            <TotalAllocationChange symbols={symbols} />
          </Suspense>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-lg">
          <div className="font-bold text-base hidden md:block">Holdings</div>
          <div className="font-bold text-base hidden md:block">
            Distributions
          </div>
          <div className="font-bold text-base hidden md:block justify-self-end md:justify-self-auto text-right md:text-left">
            Today&#39;s Returns
          </div>

          {allocation.holdings.map(({ ticker, distribution }, i) => (
            <Fragment key={`${ticker.display}-${i}`}>
              <div className="truncate">{ticker.display}</div>
              <div className="truncate justify-self-center md:justify-self-auto">
                {distribution}%
              </div>
              <div className="justify-self-end md:justify-self-auto">
                {/* PER HOLDING: streams independently */}
                <Suspense fallback={<PercentChangeSkeleton />}>
                  <PercentChangeSymbol symbol={ticker.symbol} />
                </Suspense>
              </div>
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
