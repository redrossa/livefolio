import { SeriesPoint } from '@/lib/series';

export interface Observation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

export interface ObservationSeries {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: Observation[];
}

export default async function fetchFredSeries(
  ticker: string,
  start: string,
  end: string,
): Promise<SeriesPoint[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error('No FRED_API_KEY provided');
  }

  const params = new URLSearchParams({
    series_id: ticker,
    api_key: apiKey,
    file_type: 'json',
    observation_start: start,
    observation_end: end,
  });

  const response = await fetch(
    `https://api.stlouisfed.org/fred/series/observations?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch FRED series ${ticker}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as ObservationSeries;
  const observations = Array.isArray(payload?.observations)
    ? payload.observations
    : [];

  return observations.map((o) => ({
    date: o.date,
    value: Number(o.value),
  }));
}
