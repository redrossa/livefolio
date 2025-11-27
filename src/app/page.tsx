import { Suspense } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { Strategy, StrategySkeleton } from '@/components/Strategy';
import { getStrategy } from '@/lib/testfolio';
import { handleUnsubscribe } from '@/lib/email/unsubscribe';
import { handleResubscribe } from '@/lib/email/resubscribe';
import UnsubscribeAlert from '@/components/UnsubscribeAlert';
import ResubscribeAlert from '@/components/ResubscribeAlert';

interface Props {
  searchParams: Promise<{
    s?: string;
    unsubscribe_email?: string;
    unsubscribe_token?: string;
    resubscribe_email?: string;
    resubscribe_token?: string;
    resubscribe_strategy_id?: string;
    resubscribe_strategy_name?: string;
  }>;
}

export async function generateMetadata(
  { searchParams }: Readonly<Props>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const strategyId = (await searchParams).s;
  const resolvedMetadata = await parent;

  let strategy;
  try {
    strategy = strategyId ? await getStrategy(strategyId) : null;
  } catch (e) {
    console.error((e as Error).message);
    return {
      title: resolvedMetadata.title,
      description: resolvedMetadata.description,
    };
  }

  const name = String(strategy?.name).trim() || 'Untitled Strategy';
  return {
    title: strategy ? `Livefol.io | ${name}` : 'Livefol.io',
    description: resolvedMetadata.description,
  };
}

export default async function Home({ searchParams }: Readonly<Props>) {
  const resolvedParams = await searchParams;
  const strategyId = resolvedParams.s;
  const unsubscribeInfo = await handleUnsubscribe(resolvedParams);
  const resubscribeInfo = await handleResubscribe(resolvedParams);
  return (
    <>
      <UnsubscribeAlert unsubscribe={unsubscribeInfo} />
      <ResubscribeAlert resubscribe={resubscribeInfo} />
      {strategyId && (
        <Suspense key={strategyId} fallback={<StrategySkeleton />}>
          {<Strategy strategyId={strategyId} />}
        </Suspense>
      )}
    </>
  );
}
