import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { type Strategy as TestfolioStrategy } from '@/lib/testfolio';
import { evalStrategy, Strategy } from '@/lib/evaluators';
import { sendEmail } from '@/lib/email';
import ReallocationEmail from '@/components/ReallocationEmail';

export interface EvaluationPayload {
  subscriberEmail: string;
  strategies: {
    [testfolio_id: string]: TestfolioStrategy;
  };
}

async function handler(req: NextRequest) {
  const { subscriberEmail, strategies } =
    (await req.json()) as EvaluationPayload;

  const evaluatedStrategies: Strategy[] = [];
  for (const [testfolio_id, strategy] of Object.entries(strategies)) {
    const result = await evalStrategy(strategy, testfolio_id);
    evaluatedStrategies.push(result);
  }

  await sendEmail(
    subscriberEmail,
    'Updates on your subscribed strategies',
    ReallocationEmail({
      subscriberEmail: subscriberEmail,
      evaluatedStrategies,
    }),
  );

  return NextResponse.json({
    subscriberEmail,
    strategyIds: evaluatedStrategies.map((s) => s.id),
  });
}

export const POST = verifySignatureAppRouter(handler);
