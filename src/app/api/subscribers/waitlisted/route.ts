import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import WaitlistedVerificationEmail from '@/components/WaitlistedVerificationEmail';
import resend from '@/lib/email/resend';
import { getUnverifiedSubscriptions } from '@/lib/database/subscription';
import { getStrategyById } from '@/lib/database/strategy';

export async function handler(_req: NextRequest) {
  const from = process.env.NOTIFICATIONS_SENDER_EMAIL;
  if (!from) {
    throw new Error('No sender email provided.');
  }

  const subscriptions = await getUnverifiedSubscriptions();

  if (!subscriptions.length) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  // Hydrate strategy metadata once per strategy id
  const strategyIds = Array.from(
    new Set(subscriptions.map((sub) => sub.strategyId)),
  );
  const strategyEntries = await Promise.all(
    strategyIds.map(async (id) => [id, await getStrategyById(id)] as const),
  );
  const strategies = new Map<
    number,
    Awaited<ReturnType<typeof getStrategyById>>
  >();
  strategyEntries.forEach(([id, strategy]) => strategies.set(id, strategy));

  const batchInput = await Promise.all(
    subscriptions.map(async (subscription) => {
      const strategy = strategies.get(subscription.strategyId);
      if (!strategy) {
        console.warn(
          `Subscription ${subscription.id} references missing strategy ${subscription.strategyId}`,
        );
        return null;
      }

      return {
        from,
        to: subscription.email,
        subject: `Strategy alerts are now live!`,
        react: WaitlistedVerificationEmail({
          subscriberEmail: subscription.email,
          verificationId: subscription.verificationId,
          strategyName: strategy.formattedName,
          strategyLinkId: strategy.linkId,
        }),
      };
    }),
  );

  if (!batchInput.length) {
    return NextResponse.json({
      sent: 0,
      skipped: subscriptions.length,
      reason: 'No valid strategies found for subscriptions.',
    });
  }

  const { data, error } = await resend.batch.send(
    batchInput as NonNullable<(typeof batchInput)[number]>[],
  );

  if (error) {
    console.error('Resend batch error:', error);
    return NextResponse.json(
      { error: 'Failed to send batch emails' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    sent: batchInput.length,
    skipped: subscriptions.length - batchInput.length,
    data,
  });
}

// QStash signature verification wrapper
export const POST = verifySignatureAppRouter(handler);
