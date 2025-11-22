import * as React from 'react';
import {
  Body,
  Button,
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
  subscriberName: string;
  strategyName: string;
  strategyId: string;
  evaluationDate: string;
  currAllocation: Allocation;
  prevAllocationName: string;
}

function formatHoldings(allocation: Allocation): string {
  return allocation.holdings
    .map((holding) => `${holding.ticker.display}: ${holding.distribution}%`)
    .join(' | ');
}

const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short', // "Sat"
  month: 'short', // "Nov"
  day: '2-digit', // "22"
  year: 'numeric', // "2025"
});

const ReallocationEmail = ({
  subscriberName,
  strategyName,
  strategyId,
  currAllocation,
  prevAllocationName,
  evaluationDate,
}: Props) => {
  const holdingsSummary = formatHoldings(currAllocation);
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
            <Text className="text-base leading-6">Hi {subscriberName},</Text>
            <Text className="text-base leading-6">
              The allocation for <strong>{strategyName}</strong> just changed
              based on the latest market close signals on{' '}
              {dateTimeFormat.format(new Date(evaluationDate))}.
            </Text>
            <Text className="text-base leading-6">
              New allocation: <strong>{currAllocation.name}</strong>
            </Text>
            <Text className="text-base leading-6">Holdings:</Text>
            <Text className="text-base leading-6">{holdingsSummary}</Text>
            <Text className="text-base leading-6">
              Previous allocation: {prevAllocationName}
            </Text>
            <Section className="text-center">
              <Button
                className="bg-zinc-900 rounded-sm text-white text-base no-underline text-center block p-3"
                href={`https://livefol.io?s=${strategyId}`}
              >
                View strategy
              </Button>
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
