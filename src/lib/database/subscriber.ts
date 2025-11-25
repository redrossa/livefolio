import sql from '@/lib/database/sql';
import { type Strategy } from '@/lib/database/strategy';

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

export interface SubscriberStrategies {
  id: number;
  email: string;
  strategies: Strategy[];
}

export async function getAllSubscribers(): Promise<SubscriberStrategies[]> {
  const rows = await sql`
    SELECT
      s.id as subscriber_id,
      s.email as subscriber_email,
      st.id as strategy_id,
      st.testfolio_id,
      st.definition,
      st.date_added
    FROM subscriber s
    INNER JOIN strategy st ON st.testfolio_id = s.testfolio_id;
  `;

  const grouped = new Map<string, SubscriberStrategies>();

  for (const row of rows) {
    const subscriber_id = row.subscriber_id as number;
    const subscriber_email = row.subscriber_email as string;
    const strategy: Strategy = {
      id: row.strategy_id as number,
      testfolio_id: row.testfolio_id as string,
      definition: row.definition as Strategy['definition'],
      date_added: new Date(row.date_added as string | number | Date),
    };

    if (!grouped.has(subscriber_email)) {
      grouped.set(subscriber_email, {
        id: subscriber_id,
        email: subscriber_email,
        strategies: [],
      });
    }

    grouped.get(subscriber_email)?.strategies.push(strategy);
  }

  return Array.from(grouped.values());
}
