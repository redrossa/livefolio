import { price } from '@/lib/indicators';

export default async function t2y(
  date: string,
  delay = 0,
): Promise<[number, string]> {
  return price('2YY=F', date, delay);
}
