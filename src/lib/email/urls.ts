export function buildVerificationUrl(
  verificationId: string,
  strategyLinkId?: string,
) {
  const searchParams = new URLSearchParams();
  searchParams.set('token', verificationId);
  searchParams.set('action', 'verify');
  if (strategyLinkId) {
    searchParams.set('s', strategyLinkId);
  }

  return `${process.env.ORIGIN}?${searchParams.toString()}`;
}

export function buildUnsubscribeUrl(
  verificationId: string,
  strategyLinkId?: string,
) {
  const searchParams = new URLSearchParams();
  searchParams.set('token', verificationId);
  searchParams.set('action', 'unsubscribe');
  if (strategyLinkId) {
    searchParams.set('s', strategyLinkId);
  }

  return `${process.env.ORIGIN}?${searchParams.toString()}`;
}

export function buildResubscribeUrl(
  verificationId: string,
  strategyLinkId: string,
) {
  const searchParams = new URLSearchParams();
  searchParams.set('token', verificationId);
  searchParams.set('action', 'resubscribe');
  if (strategyLinkId) {
    searchParams.set('s', strategyLinkId);
  }

  return `${process.env.ORIGIN}?${searchParams.toString()}`;
}
