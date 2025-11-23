import { delayDate, toUTCMarketClose } from '@/lib/market/dates';

export default function dayOfWeek(date: string, delay = 0): [number, string] {
  const realDate = delayDate(date, delay);
  const value = toUTCMarketClose(realDate).getUTCDay();
  return [value, realDate];
}
