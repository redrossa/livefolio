import { ReactNode } from 'react';
import resend from '@/lib/email/resend';

export default async function sendEmail(
  to: string,
  subject: string,
  content: ReactNode,
) {
  const email = process.env.NOTIFICATIONS_SENDER_EMAIL;
  if (!email) {
    throw new Error('No sender email provided.');
  }

  const { error } = await resend.emails.send({
    from: email,
    to,
    subject,
    react: content,
  });
  if (error) {
    throw error;
  }
}
