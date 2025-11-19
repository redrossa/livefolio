import type { Strategy as TestfolioStrategy } from '@/lib/testfolio';
import sql from '@/lib/database/sql';

export interface Strategy {
  id: number;
  testfolio_id: string;
  definition: TestfolioStrategy;
  date_added: Date;
}

export async function insertStrategy(
  testfolio_id: string,
  definition: Strategy,
) {
  const inserted = await sql`
    INSERT INTO strategy (testfolio_id, definition)
    VALUES (${testfolio_id}, ${JSON.stringify(definition)}) ON CONFLICT (testfolio_id) DO NOTHING;
  `;
  return !inserted.length ? null : (inserted[0] as Strategy);
}
