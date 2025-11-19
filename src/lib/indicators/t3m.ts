import { price } from '@/lib/indicators';

export default async function t3m(date: string, delay = 0): Promise<number> {
  return price('^IRX', date, delay);
}
