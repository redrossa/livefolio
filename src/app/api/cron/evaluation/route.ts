import { NextRequest, NextResponse } from 'next/server';
import { getAllSubscribers } from '@/lib/database/subscriber';
import { PublishBatchRequest } from '@upstash/qstash';
import { EvaluationPayload } from '@/app/api/subscribers/evaluation/route';
import qstash from '@/lib/qstash/qstash';

const NOTIFY_SUBSCRIBERS_PATH = '/api/subscribers/evaluation';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(req.url);
  const baseUrl = url.origin;

  const subs = await getAllSubscribers();
  const totalSubscribers = subs.length;
  const totalStrategies = [
    ...new Set(subs.flatMap((s) => s.strategies).map((s) => s.testfolio_id)),
  ].length;

  const batchRequest: PublishBatchRequest<EvaluationPayload>[] = subs.map(
    (sub) => ({
      url: `${baseUrl}${NOTIFY_SUBSCRIBERS_PATH}`,
      body: {
        subscriberEmail: sub.email,
        strategies: Object.fromEntries(
          sub.strategies.map((s) => [s.testfolio_id, s.definition]),
        ),
      },
    }),
  );

  try {
    const responses = await qstash.batchJSON(batchRequest);
    return NextResponse.json({ totalSubscribers, totalStrategies, responses });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
