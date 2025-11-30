import { headers } from 'next/headers';

export default async function resolveOrigin() {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto')!;
  const host = headersList.get('x-forwarded-host')!;
  return `${proto}://${host}`;
}
