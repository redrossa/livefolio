import { delayDate, toUTCMarketClose } from '@/lib/market/dates';

export default function month(date: string, delay = 0): number {
  return toUTCMarketClose(delayDate(date, delay)).getUTCMonth() + 1;
}
