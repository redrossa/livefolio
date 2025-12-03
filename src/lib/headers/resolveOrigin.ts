import { headers } from 'next/headers';

export default async function resolveOrigin() {
  const vercelEnv = process.env.VERCEL_ENV;
  const productionDomain =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

  if (vercelEnv === 'production' && productionDomain) {
    return `https://${productionDomain}`;
  }

  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto')!;
  const host = headersList.get('x-forwarded-host')!;
  return `${proto}://${host}`;
}
