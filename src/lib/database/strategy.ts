import type { Strategy as TestfolioStrategy } from '@/lib/testfolio';
import sql from '@/lib/database/sql';

export interface Strategy {
  id: number;
  testfolio_id: string;
  definition: TestfolioStrategy;
  date_added: Date;
}

export interface StrategyWithSubscribers extends Strategy {
  subscribers: string[];
}

export async function insertStrategy(
  testfolio_id: string,
  definition: TestfolioStrategy,
) {
  const inserted = await sql`
    INSERT INTO strategy (testfolio_id, definition)
    VALUES (${testfolio_id}, ${JSON.stringify(definition)}) ON CONFLICT (testfolio_id) DO NOTHING;
  `;
  return !inserted.length ? null : (inserted[0] as Strategy);
}

export async function getStrategiesWithSubscribers(): Promise<
  StrategyWithSubscribers[]
> {
  const result = await sql`
    SELECT s.id, s.testfolio_id, s.definition, s.date_added, ARRAY_AGG(sub.email) as subscribers
    FROM strategy s
           INNER JOIN subscriber sub ON sub.testfolio_id = s.testfolio_id
    GROUP BY s.id
  `;
  return result as unknown as StrategyWithSubscribers[];
}
