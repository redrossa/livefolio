import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
  Row,
  Column,
  Section,
  Link,
} from '@react-email/components';
import { Strategy } from '@/lib/evaluators';

interface Props {
  subscriberName: string;
  evaluatedStrategies: Strategy[];
}

const ReallocationEmail = ({ subscriberName, evaluatedStrategies }: Props) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>
            Some of your subscribed strategies switched allocation at market
            close today.
          </Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>
            <Text className="text-base leading-6">Hi {subscriberName},</Text>
            <Text className="text-base leading-6">
              The following strategies switched allocations to these holdings at
              market close today:
            </Text>
            {evaluatedStrategies.map(
              ({ name, allocation: { holdings }, id }) => (
                <>
                  <Heading as="h3" className="mt-8">
                    <Link href={`https://livefol.io?s=${id}`}>{name}</Link>
                  </Heading>
                  <AllocationTable
                    holdings={holdings.map((h) => ({
                      ticker: h.ticker.display,
                      distribution: h.distribution,
                    }))}
                  />
                </>
              ),
            )}
            <Text className="text-base leading-6 mt-8">
              Best,
              <br />
              The Livefol.io team
            </Text>
            <Hr className="border-border my-5" />
            <Text className="text-zinc-400 text-xs">© 2025 Livefol.io</Text>
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
        <Row key={index} className="bg-white border-b border-zinc-200">
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
