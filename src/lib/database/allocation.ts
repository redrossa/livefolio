import sql from '@/lib/database/sql';

export interface Allocation {
  id: number;
  testfolio_id: string;
  date_evaluated: Date;
  name: string;
}

export async function insertAllocation(
  testfolio_id: string,
  date_evaluated: Date,
  name: string,
): Promise<Allocation | null> {
  const inserted = await sql`
    INSERT INTO allocation (testfolio_id, date_evaluated, name)
    VALUES (${testfolio_id}, ${date_evaluated}, ${name})`;
  return !inserted.length ? null : (inserted[0] as Allocation);
}

export async function getLatestAllocationByStrategy(
  testfolio_id: string,
): Promise<Allocation | null> {
  const result = await sql`
    SELECT *
    FROM allocation
    WHERE testfolio_id = ${testfolio_id}
    ORDER BY date_evaluated DESC
    LIMIT 1;
  `;
  return !result.length ? null : (result[0] as Allocation);
}
