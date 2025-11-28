import sql from './sql';
import type { Strategy as TestfolioStrategy } from '@/lib/testfolio';

export interface Strategy {
  id: number;
  linkId: string;
  definition: TestfolioStrategy;
  dateAdded: Date;
}

// Raw DB row (snake_case, timestamptz as string)
interface StrategyRow {
  id: number;
  link_id: string;
  definition: TestfolioStrategy;
  date_added: string;
}

function mapStrategy(row: StrategyRow): Strategy {
  return {
    id: row.id,
    linkId: row.link_id,
    definition: row.definition,
    dateAdded: new Date(row.date_added),
  };
}

export async function createStrategy(
  linkId: string,
  definition: unknown,
): Promise<Strategy> {
  const rows = (await sql`
    INSERT INTO "strategy" ("link_id", "definition")
    VALUES (${linkId}, ${definition}::jsonb)
    RETURNING
      "id",
      "link_id",
      "definition",
      "date_added";
  `) as StrategyRow[];

  if (rows.length === 0) {
    throw new Error('Failed to insert strategy');
  }

  return mapStrategy(rows[0]);
}

export async function getStrategyById(id: number): Promise<Strategy | null> {
  const rows = (await sql`
    SELECT
      "id",
      "link_id",
      "definition",
      "date_added"
    FROM "strategy"
    WHERE "id" = ${id};
  `) as StrategyRow[];

  return rows.length ? mapStrategy(rows[0]) : null;
}

export async function getStrategyByLinkId(
  linkId: string,
): Promise<Strategy | null> {
  const rows = (await sql`
    SELECT
      "id",
      "link_id",
      "definition",
      "date_added"
    FROM "strategy"
    WHERE "link_id" = ${linkId};
  `) as StrategyRow[];

  return rows.length ? mapStrategy(rows[0]) : null;
}

export async function listStrategies(): Promise<Strategy[]> {
  const rows = (await sql`
    SELECT
      "id",
      "link_id",
      "definition",
      "date_added"
    FROM "strategy"
    ORDER BY "date_added" DESC;
  `) as StrategyRow[];

  return rows.map(mapStrategy);
}
