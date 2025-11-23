import { price } from '@/lib/indicators';

export default async function vix(
  date: string,
  delay = 0,
): Promise<[number, string]> {
  return price('^VIX', date, delay);
}
