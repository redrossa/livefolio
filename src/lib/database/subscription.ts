import sql from './sql';

export interface Subscription {
  id: number;
  email: string;
  isVerified: boolean;
  dateVerified: Date | null;
  strategyId: number;
  verificationId: string;
}

// Raw DB row
interface SubscriptionRow {
  id: number;
  email: string;
  is_verified: boolean;
  date_verified: string | null;
  strategy_id: number;
  verification_id: string;
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    email: row.email,
    isVerified: row.is_verified,
    dateVerified: row.date_verified ? new Date(row.date_verified) : null,
    strategyId: row.strategy_id,
    verificationId: row.verification_id,
  };
}

/**
 * Insert or update a subscription by email + strategyLinkId.
 * - First subscription for an email: inserts row, generates verification_id.
 * - Existing email: updates strategy_id, keeps verification_id the same.
 * - Returns null if strategyLinkId is invalid.
 */
export async function insertOrUpdateSubscriptionByEmail(
  email: string,
  strategyLinkId: string,
): Promise<Subscription | null> {
  const rows = (await sql`
    WITH selected_strategy AS (SELECT "id"
                               FROM "strategy"
                               WHERE "link_id" = ${strategyLinkId}
                               LIMIT 1)
    INSERT
    INTO "subscription" ("email", "strategy_id")
    SELECT ${email}, s."id"
    FROM selected_strategy s
    ON CONFLICT ("email") DO UPDATE
      SET "strategy_id" = EXCLUDED."strategy_id"
    RETURNING
      "id",
      "email",
      "is_verified",
      "date_verified",
      "strategy_id",
      "verification_id";
  `) as SubscriptionRow[];

  if (rows.length === 0) {
    // No strategy with that link_id
    return null;
  }

  return mapSubscription(rows[0]);
}

/**
 * Get a subscription by its verification token.
 */
export async function getSubscriptionByVerificationId(
  token: string,
): Promise<Subscription | null> {
  const rows = (await sql`
    SELECT
      "id",
      "email",
      "is_verified",
      "date_verified",
      "strategy_id",
      "verification_id"
    FROM "subscription"
    WHERE "verification_id" = ${token};
  `) as SubscriptionRow[];

  return rows.length ? mapSubscription(rows[0]) : null;
}

/**
 * Mark subscription as verified using verification token.
 * Call from /api/verify?token=...
 */
export async function verifySubscriptionByToken(
  token: string,
): Promise<Subscription | null> {
  const rows = (await sql`
    UPDATE "subscription"
    SET
      "is_verified"   = true,
      "date_verified" = NOW()
    WHERE "verification_id" = ${token}
    RETURNING
      "id",
      "email",
      "is_verified",
      "date_verified",
      "strategy_id",
      "verification_id";
  `) as SubscriptionRow[];

  return rows.length ? mapSubscription(rows[0]) : null;
}

/**
 * Change the strategy for a subscription using the secure token and strategy.link_id.
 * This is the “change strategy” endpoint that doesn't trust a user-supplied email.
 */
export async function updateSubscriptionStrategyByToken(
  token: string,
  strategyLinkId: string,
): Promise<Subscription | null> {
  const rows = (await sql`
    WITH sub AS (
      SELECT "id"
      FROM "subscription"
      WHERE "verification_id" = ${token}
      -- optional: only allow changes if verified
      -- AND "is_verified" = true
      LIMIT 1
    ),
    strat AS (
      SELECT "id"
      FROM "strategy"
      WHERE "link_id" = ${strategyLinkId}
      LIMIT 1
    )
    UPDATE "subscription" AS s
    SET
      "strategy_id" = strat."id"
    FROM sub, strat
    WHERE s."id" = sub."id"
    RETURNING
      s."id",
      s."email",
      s."is_verified",
      s."date_verified",
      s."strategy_id",
      s."verification_id";
  `) as SubscriptionRow[];

  // If token invalid OR strategyLinkId invalid → no rows
  return rows.length ? mapSubscription(rows[0]) : null;
}

/**
 * Optional: delete a subscription entirely using its token.
 * You can swap this for a status flag later if you want soft-unsubscribe.
 */
export async function deleteSubscriptionByToken(
  token: string,
): Promise<boolean> {
  const result = (await sql`
    DELETE FROM "subscription"
    WHERE "verification_id" = ${token}
    RETURNING 1;
  `) as { '1': 1 }[];

  return result.length > 0;
}

export async function getSubscriptionByEmail(
  email: string,
): Promise<Subscription | null> {
  const rows = (await sql`
    SELECT
      "id",
      "email",
      "is_verified",
      "date_verified",
      "strategy_id",
      "verification_id"
    FROM "subscription"
    WHERE "email" = ${email};
  `) as SubscriptionRow[];

  return rows.length ? mapSubscription(rows[0]) : null;
}
