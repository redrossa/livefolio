import { Comparison, Signal as TestfolioSignal } from '@/lib/testfolio';
import { evalIndicator, Indicator } from '@/lib/evaluators/indicator';
import { getSignal, setSignal } from '@/lib/redis/signal';

export interface Signal {
  name: string;
  indicator1: Indicator;
  comparison: Comparison;
  indicator2: Indicator;
  tolerance: number;
  isTrue: boolean;
}

export async function evalSignal(
  signal: TestfolioSignal,
  date: string,
): Promise<Signal> {
  const indicator1 = await evalIndicator(signal.indicator_1, date);
  const indicator2 = await evalIndicator(signal.indicator_2, date);

  if (indicator2.type === 'Threshold') {
    indicator2.unit = indicator1.unit;
  }

  const tolerance = signal.tolerance ?? 0;

  let result = await getSignal(
    indicator1,
    indicator2,
    signal.comparison,
    tolerance,
    date,
  );
  if (result) {
    return result;
  }

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

  result = {
    name: signal.name,
    indicator1,
    comparison: signal.comparison,
    indicator2,
    tolerance,
    isTrue,
  };

  await setSignal(result, date);

  return result;
}
