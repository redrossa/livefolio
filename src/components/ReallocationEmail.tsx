import * as React from 'react';
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { Strategy } from '@/lib/evaluators';
import { buildStrategyUrl, buildUnsubscribeUrl } from '@/lib/email/urls';

interface Props {
  subscriberEmail: string;
  verificationId: string;
  strategy: Strategy;
}

function joinWithAnd(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

const ReallocationEmail = async ({
  subscriberEmail,
  verificationId,
  strategy,
}: Props) => {
  const stratUrl = await buildStrategyUrl(strategy.linkId);
  const unsubscribeUrl = await buildUnsubscribeUrl(verificationId);
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>
            Your subscribed strategy &#34;{strategy.name}&#34; switched
            allocation at market close today. It now holds{' '}
            {joinWithAnd(
              strategy.allocation.holdings.map(
                (h) => `${h.ticker.display} (${h.distribution}%)`,
              ),
            )}
            .
          </Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>
            <Text className="text-base leading-6">Hi {subscriberEmail},</Text>
            <Text className="text-base leading-6">
              On market close today, your subscribed strategy{' '}
              <strong>{strategy.name}</strong> switched allocation to the
              following holdings:
            </Text>
            <AllocationTable
              holdings={strategy.allocation.holdings.map((h) => ({
                ticker: h.ticker.display,
                distribution: h.distribution,
              }))}
            />
            <Section className="text-center mt-6">
              <Button
                className="bg-zinc-900 rounded-sm text-white text-base no-underline text-center block p-3"
                href={stratUrl}
              >
                View strategy
              </Button>
            </Section>
            <Hr className="border-border my-5" />
            <Text className="text-zinc-400 text-xs">
              © 2025 Livefol.io |{' '}
              <Link href={unsubscribeUrl}>Unsubscribe</Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const AllocationTable = ({
  holdings,
}: {
  holdings: { ticker: string; distribution: number }[];
}) => {
  return (
    <Section className="w-full rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
      {/* Header */}
      <Row className="bg-zinc-50 border-b border-zinc-200">
        <Column width="50%" className="px-6 py-3 text-left align-middle">
          <Text className="m-0 text-sm font-medium text-zinc-700">
            Holdings
          </Text>
        </Column>
        <Column width="50%" className="px-6 py-3 text-left align-middle">
          <Text className="m-0 text-sm font-medium text-zinc-700">
            Distributions
          </Text>
        </Column>
      </Row>

      {/* Body */}
      {holdings.map((h, index) => (
        <Row
          key={`${h.ticker}-${h.distribution}-${index}`}
          className="bg-white border-b border-zinc-200"
        >
          <Column width="50%" className="px-6 py-4 text-left align-middle">
            <Text className="m-0 text-sm font-medium text-zinc-900 whitespace-nowrap">
              {h.ticker}
            </Text>
          </Column>
          <Column width="50%" className="px-6 py-4 text-left align-middle">
            <Text className="m-0 text-sm text-zinc-500">{h.distribution}%</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
};

export default ReallocationEmail;
