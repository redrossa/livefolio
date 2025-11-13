'use server';

import { neon } from '@neondatabase/serverless';

function isString(v: FormDataEntryValue | null): v is string {
  return typeof v === 'string';
}

export default async function handleSubscribe(
  prevState: boolean,
  formData: FormData,
) {
  const email = formData.get('email');
  const testfolio_id = formData.get('testfolio_id');
  if (isString(email) && isString(testfolio_id)) {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql`
        INSERT INTO subscriber (email, testfolio_id)
        VALUES (${email}, ${testfolio_id})
        ON CONFLICT (email, testfolio_id) DO NOTHING;
    `;
  }
  return true;
}
