export type Comparison = '>' | '<' | '=';

export type Operation = 'AND' | 'OR';

export type IndicatorType =
  | 'SMA'
  | 'EMA'
  | 'Price'
  | 'Return'
  | 'Volatility'
  | 'Drawdown'
  | 'RSI'
  | 'VIX'
  | 'T10Y'
  | 'T2Y'
  | 'T3M'
  | 'Month'
  | 'Day of Week'
  | 'Day of Month'
  | 'Day of Year'
  | 'Threshold';

export interface Indicator {
  type: IndicatorType;
  ticker: string;
  value: number | null;
  lookback: number | null;
  delay: number | null;
}

export interface Signal {
  name: string;
  indicator_1: Indicator;
  comparison: Comparison;
  indicator_2: Indicator;
  tolerance: number | null;
}

export interface Ticker {
  ticker: string;
  percent: number;
}

export interface Allocation {
  name: string;
  signals: string[];
  ops: Operation[];
  nots: boolean[];
  tickers: Ticker[];
  drag: number;
}

export interface Strategy {
  name: string;
  start_date: string;
  end_date: string;
  start_val: number;
  rolling_window: number;
  trading_cost: number;
  signals: Signal[];
  allocations: Allocation[];
  trading_freq: string;
  trading_offset: number;
}
