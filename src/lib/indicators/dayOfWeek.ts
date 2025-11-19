import { delayDate, toUTCMarketClose } from '@/lib/market/dates';

export default function dayOfWeek(date: string, delay = 0): number {
  return toUTCMarketClose(delayDate(date, delay)).getUTCDay();
}
