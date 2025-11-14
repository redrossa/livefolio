'use server';

import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import SubscribeEmail from '@/components/SubscribeEmail';

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

  let inserted;
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    inserted = await sql`
      INSERT INTO subscriber (email, testfolio_id)
      VALUES (${email}, ${testfolio_id}) ON CONFLICT (email, testfolio_id) DO NOTHING
        RETURNING *;
    `;
  } catch (error) {
    return {
      status: 'error',
      message: `Something went wrong: ${(error as Error).message}`,
    };
  }

  try {
    if (inserted.length > 0) {
      await sendEmail(email, testfolio_name, testfolio_id);
    } else {
      return {
        status: 'error',
        message: "You're already subscribed to this strategy.",
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Something went wrong: ${(error as Error).message}`,
    };
  }

  return {
    status: 'success',
    message:
      "You're now subscribed to this strategy! Please check your inbox for a confirmation email from us.",
  };
}

async function sendEmail(to: string, strategyName: string, strategyId: string) {
  const email = process.env.NOTIFICATIONS_EMAIL;
  if (!email) {
    throw new Error('No sender email provided.');
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: email,
    to,
    subject: 'Welcome to Lovefol.io',
    react: (
      <SubscribeEmail
        name={to}
        strategyName={strategyName}
        strategyId={strategyId}
      />
    ),
  });
  if (error) throw error;
}
