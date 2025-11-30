import resolveOrigin from '@/lib/headers/resolveOrigin';

export async function buildStrategyUrl(strategyLinkId: string) {
  const origin = await resolveOrigin();
  const searchParams = new URLSearchParams();
  searchParams.set('s', strategyLinkId);
  return `${origin}?${searchParams.toString()}`;
}

export async function buildVerificationUrl(
  verificationId: string,
  strategyLinkId?: string,
) {
  const origin = await resolveOrigin();
  const searchParams = new URLSearchParams();
  searchParams.set('token', verificationId);
  searchParams.set('action', 'verify');
  if (strategyLinkId) {
    searchParams.set('s', strategyLinkId);
  }

  return `${origin}?${searchParams.toString()}`;
}

export async function buildUnsubscribeUrl(
  verificationId: string,
  strategyLinkId?: string,
) {
  const origin = await resolveOrigin();
  const searchParams = new URLSearchParams();
  searchParams.set('token', verificationId);
  searchParams.set('action', 'unsubscribe');
  if (strategyLinkId) {
    searchParams.set('s', strategyLinkId);
  }

  return `${origin}?${searchParams.toString()}`;
}

export async function buildResubscribeUrl(
  verificationId: string,
  strategyLinkId: string,
) {
  const origin = await resolveOrigin();
  const searchParams = new URLSearchParams();
  searchParams.set('token', verificationId);
  searchParams.set('action', 'resubscribe');
  if (strategyLinkId) {
    searchParams.set('s', strategyLinkId);
  }

  return `${origin}?${searchParams.toString()}`;
}
