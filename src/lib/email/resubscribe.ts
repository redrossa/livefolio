import { deleteSubscriber, insertSubscriber } from '@/lib/database/subscriber';
import {
  buildUnsubscribeToken,
  verifyUnsubscribeToken,
} from '@/lib/email/unsubscribe';

export function buildResubscribeUrl(
  email: string,
  strategyId: string,
  strategyName: string,
): string {
  const token = buildUnsubscribeToken(email);
  if (!token) {
    return '#';
  }

  const params = new URLSearchParams({
    s: strategyId,
    resubscribe_email: email,
    resubscribe_token: token,
    resubscribe_strategy_id: strategyId,
    resubscribe_strategy_name: strategyName,
  });

  return `${process.env.ORIGIN}/?${params.toString()}`;
}

export interface ResubscribeResult {
  email: string;
  newStrategyName: string;
  oldStrategyNames: string[];
}

export async function handleResubscribe(params: {
  resubscribe_email?: string;
  resubscribe_token?: string;
  resubscribe_strategy_id?: string;
  resubscribe_strategy_name?: string;
}): Promise<ResubscribeResult | null> {
  const email = params.resubscribe_email;
  const token = params.resubscribe_token;
  const strategyId = params.resubscribe_strategy_id;
  const strategyNameRaw = params.resubscribe_strategy_name ?? '';

  if (!email || !token || !strategyId) {
    return null;
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return null;
  }

  const oldStrategyNames = await deleteSubscriber(email);
  const inserted = await insertSubscriber(strategyId, email);

  if (!inserted) {
    return null;
  }

  const newStrategyName = strategyNameRaw.trim() || 'Untitled Strategy';

  return {
    email,
    newStrategyName,
    oldStrategyNames,
  };
}
