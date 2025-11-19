import { price } from '@/lib/indicators';

export default async function vix(date: string, delay = 0): Promise<number> {
  return price('^VIX', date, delay);
}
