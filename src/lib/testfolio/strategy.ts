import { Strategy } from '@/lib/testfolio';
import { cache } from 'react';
import { createStrategy } from '@/lib/database/strategy';

export async function fetchStrategy(id: string) {
  const response = await fetch(`https://testfol.io/api/link/${id}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch strategy ${id}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  try {
    await createStrategy(id, payload);
  } catch (error) {
    if ((error as Error).message === 'Failed to insert strategy') {
      throw error;
    }
    // ignore since strategy already exists
  }
  return payload as Strategy;
}

export const getStrategy = cache(fetchStrategy);
