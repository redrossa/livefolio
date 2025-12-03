import { NextRequest, NextResponse } from 'next/server';
import { PublishBatchRequest } from '@upstash/qstash';

import { getStrategiesWithSubscriptions } from '@/lib/database/strategy';
import qstash from '@/lib/qstash/qstash';
import type { EvaluationPayload } from '@/app/api/subscribers/evaluation/route';
import resolveOrigin from '@/lib/headers/resolveOrigin';

const NOTIFY_SUBSCRIBERS_PATH = '/api/subscribers/evaluation';

export async function GET(req: NextRequest) {
  // Simple auth so only your cron (or QStash cron) can trigger this
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const origin = await resolveOrigin();

  // Each item: Strategy & { subscriptions: Subscription[] }
  const strategies = await getStrategiesWithSubscriptions();

  const totalStrategies = strategies.length;
  const totalSubscribers = new Set(
    strategies.flatMap((s) => s.subscriptions.map((sub) => sub.email)),
  ).size;

  const batchRequest: PublishBatchRequest<EvaluationPayload>[] = strategies.map(
    (strategy) => ({
      url: `${origin}${NOTIFY_SUBSCRIBERS_PATH}`,
      headers: {
        'x-vercel-protection-bypass':
          process.env.VERCEL_AUTOMATION_BYPASS_SECRET!,
      },
      body: {
        strategyLinkId: strategy.linkId,
        strategyDefinition: strategy.definition,
        subscribers: strategy.subscriptions.map((sub) => ({
          email: sub.email,
          verificationId: sub.verificationId,
        })),
      },
    }),
  );

  try {
    const responses = await qstash.batchJSON(batchRequest);

    return NextResponse.json({
      totalStrategies,
      totalSubscribers,
      responses,
    });
  } catch (error) {
    console.error('QStash batch error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
