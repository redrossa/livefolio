import { Suspense } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { Strategy, StrategySkeleton } from '@/components/Strategy';
import { getStrategy } from '@/lib/testfolio';
import {
  deleteSubscriptionByToken,
  Subscription,
  updateSubscriptionStrategyByToken,
  verifySubscriptionByToken,
} from '@/lib/database/subscription';
import { redirect, RedirectType } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import SubscriptionEmail from '@/components/SubscriptionEmail';
import { getStrategyById } from '@/lib/database/strategy';

interface Props {
  searchParams: Promise<{
    s?: string;
    token?: string;
    action?: 'verify' | 'unsubscribe' | 'resubscribe';
  }>;
}

export async function generateMetadata(
  { searchParams }: Readonly<Props>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const strategyLinkId = (await searchParams).s;
  const resolvedMetadata = await parent;

  let strategy;
  try {
    strategy = strategyLinkId ? await getStrategy(strategyLinkId) : null;
  } catch (e) {
    console.error((e as Error).message);
    return {
      title: resolvedMetadata.title,
      description: resolvedMetadata.description,
    };
  }

  const name = String(strategy?.name).trim() || 'Untitled Strategy';
  return {
    title: strategy ? `Livefol.io | ${name}` : 'Livefol.io',
    description: resolvedMetadata.description,
  };
}

export default async function Home({ searchParams }: Readonly<Props>) {
  const resolvedParams = await searchParams;
  const strategyLinkId = resolvedParams.s;
  const token = resolvedParams.token;
  const action = resolvedParams.action;

  if (token && action === 'verify') {
    await handleVerify(token);
  } else if (token && action === 'unsubscribe') {
    await handleUnsubscribe(token);
  } else if (token && strategyLinkId && action === 'resubscribe') {
    await handleResubscribe(token, strategyLinkId);
  }

  return (
    <>
      {strategyLinkId && (
        <Suspense key={strategyLinkId} fallback={<StrategySkeleton />}>
          {<Strategy strategyLinkId={strategyLinkId} />}
        </Suspense>
      )}
    </>
  );
}

async function handleVerify(token: string): Promise<never> {
  const sub = await verifySubscriptionByToken(token);
  if (!sub) {
    redirect('/', RedirectType.replace);
  }

  return handleSubscribe(sub);
}

async function handleResubscribe(
  token: string,
  strategyLinkId: string,
): Promise<never> {
  const sub = await updateSubscriptionStrategyByToken(token, strategyLinkId);
  if (!sub) {
    redirect('/', RedirectType.replace);
  }

  return handleSubscribe(sub);
}

async function handleSubscribe(sub: Subscription): Promise<never> {
  const strategy = await getStrategyById(sub.strategyId);
  if (!strategy) {
    redirect('/', RedirectType.replace);
  }

  await sendEmail(
    sub.email,
    `You just subscribed to strategy "${strategy.formattedName}"`,
    <SubscriptionEmail
      subscriberEmail={sub.email}
      verificationId={sub.verificationId}
      strategyName={strategy.formattedName}
      strategyLinkId={strategy.linkId}
    />,
  );
  redirect(`/?s=${strategy.linkId}`, RedirectType.replace);
}

async function handleUnsubscribe(token: string): Promise<never> {
  await deleteSubscriptionByToken(token);
  redirect('/', RedirectType.replace);
}
