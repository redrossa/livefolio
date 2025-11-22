import { NextRequest, NextResponse } from 'next/server';
import ReallocationEmail from '@/components/ReallocationEmail';
import { getStrategiesWithSubscribers } from '@/lib/database/strategy';
import { evalStrategy } from '@/lib/evaluators';
import { sendEmail } from '@/lib/email';
import {
  getLatestAllocationByStrategy,
  insertAllocation,
} from '@/lib/database/allocation';
import { toUTCMarketClose } from '@/lib/market/dates';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const strategies = await getStrategiesWithSubscribers();
    if (!strategies.length) {
      return NextResponse.json({ evaluated: 0, reallocated: 0, emailed: 0 });
    }

    let emailsSent = 0;
    let reallocatedCount = 0;
    for (const strategy of strategies) {
      const evaluated = await evalStrategy(
        strategy.definition,
        strategy.testfolio_id,
      );

      const previous = await getLatestAllocationByStrategy(
        strategy.testfolio_id,
      );

      if (!previous) {
        // newly subscribed strategy
        await insertAllocation(
          strategy.testfolio_id,
          toUTCMarketClose(evaluated.date),
          evaluated.allocation.name,
        );
        continue;
      }

      if (previous.name !== evaluated.name) {
        reallocatedCount++;
        await insertAllocation(
          strategy.testfolio_id,
          toUTCMarketClose(evaluated.date),
          evaluated.allocation.name,
        );

        for (const subscriber of strategy.subscribers) {
          emailsSent++;
          await sendEmail(
            subscriber,
            `Your strategy ${evaluated.name} switched allocation!`,
            ReallocationEmail({
              prevAllocationName: previous.name,
              subscriberName: subscriber,
              strategyName: evaluated.name,
              strategyId: evaluated.id,
              currAllocation: evaluated.allocation,
              evaluationDate: evaluated.date,
            }),
          );
        }
      }
    }

    return NextResponse.json({
      evaluated: strategies.length,
      reallocated: reallocatedCount,
      emailed: emailsSent,
    });
  } catch (error) {
    console.error('Failed to run strategy evaluation cron', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
