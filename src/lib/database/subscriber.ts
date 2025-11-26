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
    const subscriber_email = row.subscriber_email as string;
    const strategy: Strategy = {
      id: row.strategy_id as number,
      testfolio_id: row.testfolio_id as string,
      definition: row.definition as Strategy['definition'],
      date_added: new Date(row.date_added as string | number | Date),
    };

    if (!grouped.has(subscriber_email)) {
      grouped.set(subscriber_email, {
        email: subscriber_email,
        strategies: [],
      });
    }

    grouped.get(subscriber_email)?.strategies.push(strategy);
  }

  return Array.from(grouped.values());
}

export async function deleteSubscriber(email: string): Promise<string[]> {
  const deleted = await sql`
    WITH removed AS (
      DELETE FROM subscriber
      WHERE email = ${email}
      RETURNING testfolio_id
    )
    SELECT st.testfolio_id, st.definition
    FROM removed r
    INNER JOIN strategy st ON st.testfolio_id = r.testfolio_id;
  `;

  return deleted.map((row) => {
    const definition = row.definition as Strategy['definition'];
    const name = definition.name.trim();
    return name || 'Untitled Strategy';
  });
}

export async function getSubscriberByEmail(
  email: string,
): Promise<SubscriberStrategies | null> {
  const rows = await sql`
    SELECT
      s.email as subscriber_email,
      st.id as strategy_id,
      st.testfolio_id,
      st.definition,
      st.date_added
    FROM subscriber s
    INNER JOIN strategy st ON st.testfolio_id = s.testfolio_id
    WHERE s.email = ${email}
    ORDER BY st.date_added DESC
  `;

  if (!rows.length) {
    return null;
  }

  return {
    email: rows[0].subscriber_email as string,
    strategies: rows.map((row) => ({
      id: row.strategy_id as number,
      testfolio_id: row.testfolio_id as string,
      definition: row.definition as Strategy['definition'],
      date_added: new Date(row.date_added as string | number | Date),
    })),
  };
}
