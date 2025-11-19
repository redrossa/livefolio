import { delayDate, toUTCMarketClose } from '@/lib/market/dates';

export default function dayOfMonth(date: string, delay = 0): number {
  return toUTCMarketClose(delayDate(date, delay)).getUTCDate();
}
