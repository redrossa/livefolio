export interface Ticker {
  symbol: string;
  leverage: number;
  altSymbol?: string;
  display: string;
}

export function evalTicker(tickerQuery: string): Ticker {
  const [ticker, params] = tickerQuery.split('?');
  const searchParams = new URLSearchParams(params);
  const leverage = Number(searchParams.get('L')) || 1;
  const symbol = SIM_TICKER_MAP[ticker] ?? ticker;
  const leverageSuffix = leverage !== 1 ? `×${leverage}` : '';
  const display = `${symbol}${leverageSuffix}`;
  return {
    symbol,
    leverage,
    display,
  };
}

export const SIM_TICKER_MAP: Record<string, string> = {
  TBILL: 'DTB3',
  CASHX: 'DTB3',
  EFFRX: 'DFF',
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
  ZIVBX: 'ZVOL',
  TLTSIM: 'TLT',
  TLTTR: 'TLT',
  ZROZSIM: 'ZROZ',
  ZROZX: 'ZROZ',
  VXUSSIM: 'VGTSX',
  VXUSX: 'VGTSX',
  VTISIM: 'VTSMX',
  VTITR: 'VTSMX',
  VTSIM: 'VT',
  DBMFSIM: 'DBMF',
  DBMFX: 'DBMF',
  VIXSIM: '^VIX',
  VOLIX: '^VIX',
  ZEROX: 'ZEROX',
  GSGSIM: 'GSG',
  GSGTR: 'GSG',
  IEFSIM: 'IEF',
  IEFTR: 'IEF',
  IEISIM: 'IEI',
  IEITR: 'IEI',
  SHYSIM: 'SHY',
  SHYTR: 'SHY',
  BTCSIM: 'IBIT',
  BTCTR: 'IBIT',
  ETHSIM: 'ETHA',
  ETHTR: 'ETHA',
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
  INFLATION: 'CPIAUCNS',
  CAOSSIM: 'CAOS',
  FNGUSIM: 'FNGU',
  MCISIM: 'MCI',
};
