import { delayDate, toUTCMarketClose } from '@/lib/market/dates';

export default function month(date: string, delay = 0): [number, string] {
  const realDate = delayDate(date, delay);
  const value = toUTCMarketClose(realDate).getUTCMonth() + 1;
  return [value, realDate];
}
