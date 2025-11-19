import { delayDate, toUTCMarketOpen } from '@/lib/market/dates';

export default function dayOfYear(date: string, delay = 0): number {
  const d = toUTCMarketOpen(delayDate(date, delay));
  const utcDate = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const utcYearStart = Date.UTC(d.getFullYear(), 0, 0);
  return (utcDate - utcYearStart) / 24 / 60 / 60 / 1000;
}
