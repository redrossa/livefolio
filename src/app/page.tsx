import { Suspense } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { Strategy, StrategySkeleton } from '@/components/Strategy';
import { getStrategy } from '@/lib/testfolio';
import { handleUnsubscribe } from '@/lib/email/unsubscribe';
import UnsubscribeAlert from '@/components/UnsubscribeAlert';

interface Props {
  searchParams: Promise<{
    s?: string;
    unsubscribe_email?: string;
    unsubscribe_token?: string;
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
  return (
    <>
      <UnsubscribeAlert unsubscribe={unsubscribeInfo} />
      {strategyId && (
        <Suspense key={strategyId} fallback={<StrategySkeleton />}>
          {<Strategy strategyId={strategyId} />}
        </Suspense>
      )}
    </>
  );
}
