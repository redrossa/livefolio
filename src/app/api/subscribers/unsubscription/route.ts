import { NextRequest, NextResponse } from 'next/server';
import { deleteSubscriber } from '@/lib/database/subscriber';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe';

export async function GET(req: NextRequest) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Unsubscribe secret not configured.' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    return NextResponse.json(
      { error: 'Missing email or token.' },
      { status: 400 },
    );
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
  }

  try {
    const strategyNames = await deleteSubscriber(email);
    if (!strategyNames.length) {
      return NextResponse.json(
        { error: 'Subscription not found.' },
        { status: 404 },
      );
    }

    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('unsubscribed', '1');
    redirectUrl.searchParams.set('unsubscribed_email', email);
    strategyNames.forEach((name) =>
      redirectUrl.searchParams.append('unsubscribed_strategy', name),
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Failed to unsubscribe subscriber', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again later.' },
      { status: 500 },
    );
  }
}
