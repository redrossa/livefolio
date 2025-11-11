export const TICKER_MAP: Record<string, string> = {
  TBILL: 'TBILL',
  CASHX: 'CASHX',
  EFFRX: 'EFFRX',
  SPYSIM: 'SPY',
  SPYTR: 'SPY',
  KMLMSIM: 'KMLM',
  KMLMX: 'KMLM',
  GLDSIM: 'GLD',
  GOLDX: 'GLD',
  SVIXSIM: 'SVIX',
  SVIXX: 'SVIX',
  UVIXSIM: 'UVIX',
  ZVOLSIM: 'ZVOL',
  ZIVBX: 'ZIVB',
  TLTSIM: 'TLT',
  TLTTR: 'TLT',
  ZROZSIM: 'ZROZ',
  ZROZX: 'ZROZ',
  VXUSSIM: 'VXUS',
  VXUSX: 'VXUS',
  VTISIM: 'VTI',
  VTITR: 'VTI',
  VTSIM: 'VT',
  DBMFSIM: 'DBMF',
  DBMFX: 'DBMF',
  VIXSIM: 'VIX',
  VOLIX: 'VIX',
  ZEROX: 'ZEROX',
  GSGSIM: 'GSG',
  GSGTR: 'GSG',
  IEFSIM: 'IEF',
  IEFTR: 'IEF',
  IEISIM: 'IEI',
  IEITR: 'IEI',
  SHYSIM: 'SHY',
  SHYTR: 'SHY',
  BTCSIM: 'BTC-USD',
  BTCTR: 'BTC-USD',
  ETHSIM: 'ETH-USD',
  ETHTR: 'ETH-USD',
  XLBSIM: 'XLB',
  XLBTR: 'XLB',
  XLCSIM: 'XLC',
  XLCTR: 'XLC',
  XLESIM: 'XLE',
  XLETR: 'XLE',
  XLFSIM: 'XLF',
  XLFTR: 'XLF',
  XLISIM: 'XLI',
  XLITR: 'XLI',
  XLKSIM: 'XLK',
  XLKTR: 'XLK',
  XLPSIM: 'XLP',
  XLPTR: 'XLP',
  XLUSIM: 'XLU',
  XLUTR: 'XLU',
  XLVSIM: 'XLV',
  XLVTR: 'XLV',
  XLYSIM: 'XLY',
  XLYTR: 'XLY',
  QQQSIM: 'QQQ',
  QQQTR: 'QQQ',
  INFLATION: 'CPI',
  CAOSSIM: 'CAOS',
  FNGUSIM: 'FNGU',
  MCISIM: 'MCI',
};

export interface NormalizedTicker {
  underlying: string;
  leverage: number;
}

export function normalizeTicker(rawTicker: string): NormalizedTicker {
  const [ticker, params] = rawTicker.split('?');
  const underlying = TICKER_MAP[ticker] ?? ticker;
  const searchParams = new URLSearchParams(params);
  const leverageString = searchParams.get('L');
  const leverage = leverageString ? Number(leverageString) : 1;
  return { underlying, leverage };
}

export function formatTicker(rawTicker: string): string {
  const normalized = normalizeTicker(rawTicker);
  const leverageFormat =
    normalized.leverage !== 1 ? `×${normalized.leverage}` : '';
  return `${normalized.underlying}${leverageFormat}`;
}
