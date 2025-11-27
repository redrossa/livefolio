'use server';

import SubscribeEmail from '@/components/SubscribeEmail';
import {
  getSubscriberByEmail,
  insertSubscriber,
} from '@/lib/database/subscriber';
import { sendEmail } from '@/lib/email';
import ResubscribeEmail from '@/components/ResubscribeEmail';

function isString(v: FormDataEntryValue | null): v is string {
  return typeof v === 'string';
}

export interface SubscribeResult {
  status: 'success' | 'error' | null;
  message?: string;
}

export default async function handleSubscribe(
  prevState: SubscribeResult,
  formData: FormData,
): Promise<SubscribeResult> {
  const email = formData.get('email');
  const testfolio_id = formData.get('testfolio_id');
  const testfolio_name = formData.get('testfolio_name');

  if (
    !isString(email) ||
    !isString(testfolio_id) ||
    !isString(testfolio_name)
  ) {
    return {
      status: 'error',
      message: 'Form data invalid.',
    };
  }

  if (email.length === 0) {
    return {
      status: 'error',
      message: "Email address can't be empty.",
    };
  }

  try {
    const subscriber = await getSubscriberByEmail(email);
    if (
      subscriber &&
      !subscriber.strategies.map((s) => s.testfolio_id).includes(testfolio_id)
    ) {
      try {
        await sendEmail(
          email,
          'Manage your current strategy subscription',
          ResubscribeEmail({
            subscriberEmail: email,
            oldStrategies: subscriber.strategies.map((s) => ({
              id: s.testfolio_id,
              name: s.definition.name || 'Untitled Strategy',
            })),
            newStrategy: { id: testfolio_id, name: testfolio_name },
          }),
        );
      } catch (error) {
        console.error((error as Error).message);
        return {
          status: 'error',
          message: `Something went wrong when sending an email. Please try again later.`,
        };
      }

      return {
        status: 'error',
        message: `You can only subscribe to one strategy at a time. Please check your inbox to manage your current subscription.`,
      };
    }

    const inserted = await insertSubscriber(testfolio_id, email);
    if (!inserted) {
      return {
        status: 'error',
        message: "You're already subscribed to this strategy.",
      };
    }
  } catch (error) {
    console.error((error as Error).message);
    return {
      status: 'error',
      message: 'Something went wrong when subscribing. Please try again later.',
    };
  }

  try {
    await sendEmail(
      email,
      'Welcome to Livefol.io',
      <SubscribeEmail
        subscriberEmail={email}
        strategyName={testfolio_name}
        strategyId={testfolio_id}
      />,
    );
  } catch (error) {
    console.error((error as Error).message);
    return {
      status: 'error',
      message: `Something went wrong when sending an email, but you've been subscribed.`,
    };
  }

  return {
    status: 'success',
    message:
      "You're now subscribed to this strategy! Please check your inbox for a confirmation email from us.",
  };
}
