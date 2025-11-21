import { Comparison, Signal as TestfolioSignal } from '@/lib/testfolio';
import {
  EvalIndicatorOptions,
  Indicator,
  evalIndicator,
} from '@/lib/evaluators/indicator';

export interface Signal {
  name: string;
  indicator1: Indicator;
  comparison: Comparison;
  indicator2: Indicator;
  tolerance: number;
  isTrue: boolean;
}

export interface EvalSignalOptions {
  indicatorOptions?: EvalIndicatorOptions;
}

export async function evalSignal(
  signal: TestfolioSignal,
  date: string,
  options?: EvalSignalOptions,
): Promise<Signal> {
  const indicator1 = await evalIndicator(
    signal.indicator_1,
    date,
    options?.indicatorOptions,
  );
  const indicator2 = await evalIndicator(
    signal.indicator_2,
    date,
    options?.indicatorOptions,
  );

  if (indicator2.type === 'Threshold') {
    indicator2.unit = indicator1.unit;
  }

  const tolerance = signal.tolerance ?? 0;
  const lowerBound =
    indicator1.unit === '%'
      ? indicator2.value - tolerance
      : indicator2.value * (1 - tolerance / 100);
  const upperBound =
    indicator1.unit === '%'
      ? indicator2.value + tolerance
      : indicator2.value * (1 + tolerance / 100);

  let isTrue = false;
  switch (signal.comparison) {
    case '>':
      isTrue = indicator1.value > lowerBound;
      break;
    case '<':
      isTrue = indicator1.value < upperBound;
      break;
    case '=':
      isTrue = lowerBound <= indicator1.value && indicator1.value <= upperBound;
      break;
  }

  return {
    name: signal.name,
    indicator1,
    comparison: signal.comparison,
    indicator2,
    tolerance,
    isTrue,
  };
}
