import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { buildUnsubscribeUrl } from '@/lib/email/unsubscribe';
import { buildResubscribeUrl } from '@/lib/email/resubscribe';

interface StrategyInfo {
  id: string;
  name: string;
}

interface Props {
  subscriberEmail: string;
  oldStrategies: StrategyInfo[];
  newStrategy: StrategyInfo;
}

const strategyHref = (id: string) => `https://livefol.io?s=${id}`;

const ResubscribeEmail = ({
  subscriberEmail,
  oldStrategies,
  newStrategy,
}: Props) => {
  const unsubscribeUrl = buildUnsubscribeUrl(subscriberEmail);
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>Do you want to replace your subscribed strategy?</Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>

            <Text className="text-base leading-6">
              You requested to subscribe to{' '}
              <Link href={strategyHref(newStrategy.id)}>
                <strong>{newStrategy.name}</strong>
              </Link>
              .
            </Text>
            {oldStrategies.length > 1 ? (
              <>
                <Text className="text-base leading-6 mb-0">
                  You are currently subscribed to:
                </Text>
                <Section>
                  {oldStrategies.map((s) => (
                    <Text key={s.id} className="text-base m-0">
                      •{' '}
                      <Link href={strategyHref(s.id)}>
                        <strong>{s.name}</strong>
                      </Link>
                    </Text>
                  ))}
                </Section>
              </>
            ) : (
              <Text className="text-base leading-6">
                You are currently subscribed to{' '}
                <Link href={strategyHref(oldStrategies[0].id)}>
                  <strong>{oldStrategies[0].name}</strong>
                </Link>
                .
              </Text>
            )}

            <Text className="text-base leading-6 mt-4">
              You can only subscribe to one strategy at a time. Click the button
              below to replace your current{' '}
              {oldStrategies.length > 1 ? 'subscriptions' : 'subscription'} to
              the requested strategy.
            </Text>

            <Section className="text-center mt-6">
              <Button
                className="bg-zinc-900 rounded-sm text-white text-base no-underline text-center block p-3"
                href={buildResubscribeUrl(
                  subscriberEmail,
                  newStrategy.id,
                  newStrategy.name,
                )}
              >
                Replace subscription
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

export default ResubscribeEmail;
