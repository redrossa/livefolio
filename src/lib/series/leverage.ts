import { SeriesPoint } from '@/lib/series/series';

export default function applyLeverage(series: SeriesPoint[], leverage = 1) {
  if (leverage === 1 || series.length === 0) {
    return series;
  }

  const leveragedSeries: SeriesPoint[] = [
    {
      date: series[0].date,
      value: series[0].value,
    },
  ];

  for (let i = 1; i < series.length; i += 1) {
    const previous = series[i - 1];
    const current = series[i];
    const previousLeveraged = leveragedSeries[i - 1];

    const dailyReturn =
      previous.value === 0 ? 0 : (current.value - previous.value) / previous.value;
    const leveragedValue = previousLeveraged.value * (1 + leverage * dailyReturn);

    leveragedSeries.push({
      date: current.date,
      value: leveragedValue,
    });
  }

  return leveragedSeries;
}
