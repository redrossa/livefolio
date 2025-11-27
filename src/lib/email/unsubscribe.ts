import { createHmac, timingSafeEqual } from 'crypto';
import { deleteSubscriber } from '@/lib/database/subscriber';

export function buildUnsubscribeToken(email: string): string | null {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    return null;
  }

  return createHmac('sha256', secret).update(email).digest('hex');
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret || !token) {
    return false;
  }

  const expected = createHmac('sha256', secret).update(email).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);

  if (expectedBuffer.length !== tokenBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, tokenBuffer);
}

export function buildUnsubscribeUrl(email: string): string {
  const token = buildUnsubscribeToken(email);
  if (!token) {
    return '#';
  }

  const params = new URLSearchParams({
    unsubscribe_email: email,
    unsubscribe_token: token,
  });

  return `${process.env.HOST}/?${params.toString()}`;
}

export interface UnsubscribeResult {
  email: string;
  strategyNames: string[];
}

export async function handleUnsubscribe(params: {
  unsubscribe_email?: string;
  unsubscribe_token?: string;
}): Promise<UnsubscribeResult | null> {
  const email = params.unsubscribe_email;
  const token = params.unsubscribe_token;

  if (!email || !token) {
    return null;
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return null;
  }

  const strategyNames = await deleteSubscriber(email);
  if (!strategyNames.length) {
    return null;
  }

  return { email, strategyNames };
}
