import { price } from '@/lib/indicators';

export default async function t10y(date: string, delay = 0): Promise<number> {
  return price('^TNX', date, delay);
}
