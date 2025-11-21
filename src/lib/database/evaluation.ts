import sql from '@/lib/database/sql';
import type { Allocation } from '@/lib/evaluators';

export interface StrategyEvaluation {
  id: number;
  strategy_id: number;
  allocation: Allocation;
  evaluated_at: Date;
}

function parseAllocation(allocation: unknown): Allocation {
  if (typeof allocation === 'string') {
    return JSON.parse(allocation) as Allocation;
  }

  return allocation as Allocation;
}

function mapRow(row: StrategyEvaluation & { allocation: unknown }) {
  return {
    ...row,
    allocation: parseAllocation(row.allocation),
  } satisfies StrategyEvaluation;
}

export async function insertStrategyEvaluation(
  strategyId: number,
  allocation: Allocation,
  evaluatedAt: string,
): Promise<StrategyEvaluation | null> {
  const inserted = await sql`
    INSERT INTO strategy_evaluation (strategy_id, allocation, evaluated_at)
    VALUES (${strategyId}, ${JSON.stringify(allocation)}, ${evaluatedAt})
    RETURNING *;
  `;

  return !inserted.length ? null : mapRow(inserted[0] as StrategyEvaluation);
}

export async function getLatestStrategyEvaluation(
  strategyId: number,
): Promise<StrategyEvaluation | null> {
  const result = await sql`
    SELECT * FROM strategy_evaluation
    WHERE strategy_id = ${strategyId}
    ORDER BY evaluated_at DESC
    LIMIT 1;
  `;

  return !result.length ? null : mapRow(result[0] as StrategyEvaluation);
}
