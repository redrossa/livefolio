import { Suspense } from 'react';
import { getStrategy } from '@/lib/strategies';
import { Metadata, ResolvingMetadata } from 'next';
import { Strategy, StrategySkeleton } from '@/components/Strategy';

interface Props {
  searchParams: Promise<{ s?: string }>;
}

export async function generateMetadata(
  { searchParams }: Readonly<Props>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const strategyId = (await searchParams).s;
  const resolvedMetadata = await parent;
  const strategy = strategyId ? await getStrategy(strategyId) : null;
  const name = String(strategy?.name).trim() || 'Untitled Strategy';
  return {
    title: strategy ? `Livefol.io | ${name}` : 'Livefol.io',
    description: resolvedMetadata.description,
  };
}

export default async function Home({ searchParams }: Readonly<Props>) {
  const strategyId = (await searchParams).s;
  if (!strategyId) {
    return null;
  }
  return (
    <Suspense key={strategyId} fallback={<StrategySkeleton />}>
      {<Strategy strategyId={strategyId} />}
    </Suspense>
  );
}
