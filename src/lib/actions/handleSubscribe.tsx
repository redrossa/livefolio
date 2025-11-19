'use server';

import SubscribeEmail from '@/components/SubscribeEmail';
import { insertSubscriber, Subscriber } from '@/lib/database/subscriber';
import { sendEmail } from '@/lib/email';

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
      message: 'Form data invalid',
    };
  }

  let inserted: Subscriber | null;
  try {
    inserted = await insertSubscriber(testfolio_id, email);
  } catch (error) {
    console.error((error as Error).message);
    return {
      status: 'error',
      message: `Something went wrong when subscribing. Please try again later.`,
    };
  }

  if (!inserted) {
    return {
      status: 'error',
      message: "You're already subscribed to this strategy.",
    };
  }

  try {
    await sendEmail(
      email,
      'Welcome to Livefol.io',
      <SubscribeEmail
        name={email}
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
