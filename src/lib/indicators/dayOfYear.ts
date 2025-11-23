import { delayDate, toUTCMarketOpen } from '@/lib/market/dates';

export default function dayOfYear(date: string, delay = 0): [number, string] {
  const realDate = delayDate(date, delay);
  const d = toUTCMarketOpen(realDate);
  const utcDate = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const utcYearStart = Date.UTC(d.getFullYear(), 0, 0);
  const value = (utcDate - utcYearStart) / 24 / 60 / 60 / 1000;
  return [value, realDate];
}
