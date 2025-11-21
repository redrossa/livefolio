import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import type { Allocation } from '@/lib/evaluators';

interface Props {
  strategyName: string;
  strategyId: string;
  evaluationDate: string;
  allocation: Allocation;
}

function formatHoldings(allocation: Allocation): string {
  return allocation.holdings
    .map(
      (holding) =>
        `${holding.ticker.display}: ${holding.distribution.toFixed(2)}%`,
    )
    .join(' | ');
}

const ReallocationEmail = ({
  strategyName,
  strategyId,
  allocation,
  evaluationDate,
}: Props) => {
  const holdingsSummary = formatHoldings(allocation);
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>{`${strategyName} reallocated on ${evaluationDate}`}</Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>
            <Text className="text-base leading-6">
              The allocation for <strong>{strategyName}</strong> changed based on
              the latest market close signals on {evaluationDate}.
            </Text>
            <Text className="text-base leading-6">
              New allocation: <strong>{allocation.name}</strong>.
            </Text>
            <Section className="mt-4">
              <Text className="text-base leading-6">Holdings</Text>
              <Text className="text-base leading-6">{holdingsSummary}</Text>
            </Section>
            <Text className="text-base leading-6 mt-4">
              You can review the full strategy details at any time:
            </Text>
            <Section className="mt-2">
              <a
                className="text-base text-zinc-900 underline"
                href={`https://livefol.io?s=${strategyId}`}
              >
                Open strategy
              </a>
            </Section>
            <Text className="text-base leading-6 mt-6">
              Best,
              <br />
              The Livefol.io team
            </Text>
            <Hr className="border-border my-5" />
            <Text className="text-zinc-100 text-xs">© 2025 Livefol.io</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReallocationEmail;
