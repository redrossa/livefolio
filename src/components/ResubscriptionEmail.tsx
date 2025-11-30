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
import { formatStrategyName, formatStrategyUrl } from '@/lib/email/format';
import { buildResubscribeUrl, buildUnsubscribeUrl } from '@/lib/email/urls';

interface StrategyInfo {
  id: string;
  name: string;
}

interface Props {
  subscriberEmail: string;
  verificationId: string;
  oldStrategy: StrategyInfo;
  newStrategy: StrategyInfo;
}

const ResubscriptionEmail = ({
  subscriberEmail,
  verificationId,
  oldStrategy,
  newStrategy,
}: Props) => {
  const oldStratUrl = formatStrategyUrl(oldStrategy.id);
  const oldStratName = formatStrategyName(oldStrategy.name);
  const newStratUrl = formatStrategyUrl(newStrategy.id);
  const newStratName = formatStrategyName(newStrategy.name);
  const unsubUrl = buildUnsubscribeUrl(verificationId);
  const resubUrl = buildResubscribeUrl(verificationId, newStrategy.id);
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>
            You requested to subscribe to strategy &#34;{newStratName}&#34;, but
            you are already subscribed to &#34;{oldStratName}&#34;. You can only
            subscribe to one strategy at a time. Confirm to change subscription.
          </Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>

            <Text className="text-base leading-6">Hi {subscriberEmail},</Text>
            <Text className="text-base leading-6">
              You requested to subscribe to{' '}
              <Link href={newStratUrl}>
                <strong>{newStratName}</strong>
              </Link>
              .
            </Text>

            <Text className="text-base leading-6">
              You are currently subscribed to{' '}
              <Link href={oldStratUrl}>
                <strong>{oldStratName}</strong>
              </Link>
              .
            </Text>

            <Text className="text-base leading-6 mt-4">
              You can only subscribe to <strong>one</strong> strategy at a time.
              Click the button below to replace your current subscription to the
              requested strategy.
            </Text>

            <Section className="text-center mt-6">
              <Button
                className="bg-zinc-900 rounded-sm text-white text-base no-underline text-center block p-3"
                href={resubUrl}
              >
                Replace subscription
              </Button>
            </Section>

            <Hr className="border-border my-5" />
            <Text className="text-zinc-400 text-xs">
              © 2025 Livefol.io | <Link href={unsubUrl}>Unsubscribe</Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResubscriptionEmail;
