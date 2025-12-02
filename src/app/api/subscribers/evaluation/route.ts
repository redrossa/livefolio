import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { type Strategy as TestfolioStrategy } from '@/lib/testfolio';
import { evalStrategy, Strategy } from '@/lib/evaluators';
import ReallocationEmail from '@/components/ReallocationEmail';
import resend from '@/lib/email/resend'; // your Resend client (new Resend(API_KEY))
import {
  getStrategyByLinkId,
  updateLatestAllocationName,
} from '@/lib/database/strategy';

export interface EvaluationPayload {
  strategyLinkId: string;
  strategyDefinition: TestfolioStrategy;
  subscribers: {
    email: string;
    verificationId: string; // used to build unsubscribe URL in the email
  }[];
}

async function handler(req: NextRequest) {
  const { strategyLinkId, strategyDefinition, subscribers } =
    (await req.json()) as EvaluationPayload;

  // 1) Evaluate the strategy once
  const evaluatedStrategy: Strategy = await evalStrategy(
    strategyDefinition,
    strategyLinkId,
  );

  const strategy = await getStrategyByLinkId(strategyLinkId);

  if (!strategy) {
    return NextResponse.json(
      { strategyLinkId, error: 'Strategy not found' },
      { status: 404 },
    );
  }

  const evaluatedAllocationName = evaluatedStrategy.allocation.name;
  const hasNewAllocation =
    strategy.latestAllocationName !== evaluatedAllocationName;

  if (!hasNewAllocation) {
    return NextResponse.json(
      {
        strategyLinkId,
        subscriberCount: subscribers?.length ?? 0,
        skipped: true,
      },
      { status: 200 },
    );
  }

  // Nothing to do for this job
  if (!subscribers || subscribers.length === 0) {
    await updateLatestAllocationName(strategy.id, evaluatedAllocationName);

    return NextResponse.json(
      { strategyLinkId, subscriberCount: 0, skipped: true },
      { status: 200 },
    );
  }

  const from = process.env.NOTIFICATIONS_SENDER_EMAIL;
  if (!from) {
    throw new Error('No sender email provided.');
  }

  // 2) Build batch input: one email per subscriber, passing verificationId
  const batchInput = subscribers.map(({ email, verificationId }) => ({
    from,
    to: email,
    subject: `Update on strategy "${evaluatedStrategy.name}"`,
    // Resend supports React components here
    react: ReallocationEmail({
      subscriberEmail: email,
      verificationId, // let the component build the unsubscribe URL
      strategy: evaluatedStrategy,
    }),
  }));

  // 3) Send all emails in one batch call
  const { data, error } = await resend.batch.send(batchInput);

  if (error) {
    console.error('Resend batch error:', error);
    return NextResponse.json(
      { strategyLinkId, error: 'Failed to send batch emails' },
      { status: 500 },
    );
  }

  await updateLatestAllocationName(strategy.id, evaluatedAllocationName);

  return NextResponse.json({
    strategyLinkId,
    subscriberCount: subscribers.length,
    data,
  });
}

// QStash signature verification wrapper
export const POST = verifySignatureAppRouter(handler);
