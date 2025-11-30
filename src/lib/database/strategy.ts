import sql from './sql';
import type { Strategy as TestfolioStrategy } from '@/lib/testfolio';
import { Subscription } from '@/lib/database/subscription';

export interface Strategy {
  id: number;
  linkId: string;
  definition: TestfolioStrategy;
  dateAdded: Date;
  formattedName: string;
}

// Raw DB row (snake_case, timestamptz as string)
interface StrategyRow {
  id: number;
  link_id: string;
  definition: TestfolioStrategy;
  date_added: string;
  formatted_name: string;
}

function mapStrategy(row: StrategyRow): Strategy {
  return {
    id: row.id,
    linkId: row.link_id,
    definition: row.definition,
    dateAdded: new Date(row.date_added),
    formattedName: row.formatted_name,
  };
}

export async function createStrategy(
  linkId: string,
  definition: unknown,
): Promise<Strategy> {
  const rows = (await sql`
    INSERT INTO "strategy" ("link_id", "definition")
    VALUES (${linkId}, ${definition}::jsonb) ON CONFLICT ("link_id") DO
    UPDATE
      SET "link_id" = EXCLUDED."link_id"
      RETURNING
      "id",
      "link_id",
      "definition",
      "date_added",
      "formatted_name";
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
      "date_added",
      "formatted_name"
    FROM "strategy"
    WHERE "id" = ${id};
  `) as StrategyRow[];

  console.log(rows);

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
      "date_added",
      "formatted_name"
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
      "date_added",
      "formatted_name"
    FROM "strategy"
    ORDER BY "date_added" DESC;
  `) as StrategyRow[];

  return rows.map(mapStrategy);
}

export type StrategyWithSubscriptions = Strategy & {
  subscriptions: Subscription[];
};

interface JoinedRow {
  // strategy fields
  strategy_id: number;
  strategy_link_id: string;
  strategy_definition: TestfolioStrategy;
  strategy_date_added: string;
  strategy_formatted_name: string;

  // subscription fields
  subscription_id: number;
  subscription_email: string;
  subscription_date_verified: string | null;
  subscription_strategy_id: number;
  subscription_verification_id: string;
}

function mapRowToStrategy(row: JoinedRow): Strategy {
  return {
    id: row.strategy_id,
    linkId: row.strategy_link_id,
    definition: row.strategy_definition,
    dateAdded: new Date(row.strategy_date_added),
    formattedName: row.strategy_formatted_name,
  };
}

function mapRowToSubscription(row: JoinedRow): Subscription {
  return {
    id: row.subscription_id,
    email: row.subscription_email,
    dateVerified: row.subscription_date_verified
      ? new Date(row.subscription_date_verified)
      : null,
    strategyId: row.subscription_strategy_id,
    verificationId: row.subscription_verification_id,
  };
}

export async function getStrategiesWithSubscriptions(): Promise<
  StrategyWithSubscriptions[]
> {
  const rows = (await sql`
    SELECT
      s.id              AS strategy_id,
      s.link_id         AS strategy_link_id,
      s.definition      AS strategy_definition,
      s.date_added      AS strategy_date_added,
      s.formatted_name  AS strategy_formatted_name,

      sub.id            AS subscription_id,
      sub.email         AS subscription_email,
      sub.date_verified AS subscription_date_verified,
      sub.strategy_id   AS subscription_strategy_id,
      sub.verification_id AS subscription_verification_id
    FROM "strategy" AS s
           JOIN "subscription" AS sub
                ON sub.strategy_id = s.id
    WHERE sub.date_verified IS NOT NULL;
  `) as JoinedRow[];

  const byStrategy = new Map<number, StrategyWithSubscriptions>();

  for (const row of rows) {
    let entry = byStrategy.get(row.strategy_id);
    if (!entry) {
      entry = {
        ...mapRowToStrategy(row),
        subscriptions: [],
      };
      byStrategy.set(row.strategy_id, entry);
    }

    entry.subscriptions.push(mapRowToSubscription(row));
  }

  return Array.from(byStrategy.values());
}
