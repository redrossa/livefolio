'use server';

import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import VerificationEmail from '@/components/VerificationEmail';
import ResubscriptionEmail from '@/components/ResubscriptionEmail';

import {
  getSubscriptionByEmail,
  insertOrUpdateSubscriptionByEmail,
} from '@/lib/database/subscription';
import { getStrategyById } from '@/lib/database/strategy';

export interface SubscribeResult {
  status: 'success' | 'error' | null;
  message?: string;
}

const SubscribeSchema = z.object({
  email: z.string().min(3),
});

export default async function subscribe(
  strategyLinkId: string,
  strategyName: string,
  prevState: SubscribeResult,
  formData: FormData,
): Promise<SubscribeResult> {
  const parseResult = SubscribeSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parseResult.success) {
    return {
      status: 'error',
      message: 'Email address invalid.',
    };
  }

  const { email } = parseResult.data;

  try {
    const existing = await getSubscriptionByEmail(email);

    // CASE 1 & 2: new email OR existing but not verified
    if (!existing?.dateVerified) {
      // Insert or update subscription + strategy immediately
      const subscription = await insertOrUpdateSubscriptionByEmail(
        email,
        strategyLinkId,
      );

      if (!subscription) {
        return {
          status: 'error',
          message: 'Invalid strategy. Please refresh and try again.',
        };
      }

      await sendEmail(
        email,
        'Welcome to Livefol.io!',
        VerificationEmail({
          subscriberEmail: email,
          verificationId: subscription.verificationId,
          strategyName,
          strategyLinkId,
        }),
      );

      return {
        status: 'success',
        message: 'Request sent. Please check your inbox for verification.',
      };
    }

    // CASE 3: existing email AND already verified
    // Do NOT change strategy yet. Send confirm-replacement email.

    // Get old strategy info (current subscription strategy)
    const oldStrategy = await getStrategyById(existing.strategyId);
    if (!oldStrategy) {
      return {
        status: 'error',
        message:
          'Current subscription is in an invalid state. Please try again later.',
      };
    }

    if (oldStrategy.linkId === strategyLinkId) {
      return {
        status: 'error',
        message: 'You are already subscribed to this strategy.',
      };
    }

    await sendEmail(
      email,
      'Confirm your strategy subscription change',
      ResubscriptionEmail({
        subscriberEmail: email,
        verificationId: existing.verificationId,
        oldStrategy: {
          id: oldStrategy.linkId, // strategy.link_id
          name: oldStrategy.definition.name, // or derive a nicer name if you have one
        },
        newStrategy: {
          id: strategyLinkId, // strategy.link_id (same as strategyLinkId)
          name: strategyName, // human-friendly name passed into the action
        },
      }),
    );

    return {
      status: 'success',
      message:
        'Please check your inbox to confirm the change to your subscribed strategy.',
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to send request. Please try again later.',
    };
  }
}
