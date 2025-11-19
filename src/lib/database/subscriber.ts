import sql from '@/lib/database/sql';

export interface Subscriber {
  id: number;
  email: string;
  testfolio_id: string;
}

export async function insertSubscriber(testfolio_id: string, email: string) {
  const inserted = await sql`
    INSERT INTO subscriber (email, testfolio_id)
    VALUES (${email}, ${testfolio_id}) ON CONFLICT (email, testfolio_id) DO NOTHING
      RETURNING *;
  `;
  return !inserted.length ? null : (inserted[0] as Subscriber);
}
