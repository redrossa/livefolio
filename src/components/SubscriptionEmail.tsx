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
import { buildStrategyUrl, buildUnsubscribeUrl } from '@/lib/email/urls';

interface Props {
  subscriberEmail: string;
  verificationId: string;
  strategyName: string;
  strategyLinkId: string;
}

const SubscriptionEmail = async ({
  subscriberEmail,
  verificationId,
  strategyName,
  strategyLinkId,
}: Props) => {
  const stratUrl = await buildStrategyUrl(strategyLinkId);
  const unsubUrl = await buildUnsubscribeUrl(verificationId);
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>
            You subscribed to &#34;{strategyName}&#34;. We&#39;ll send you a
            notification whenever this strategy changes allocation.
          </Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>

            <Text className="text-base leading-6">Hi {subscriberEmail},</Text>
            <Text className="text-base leading-6">
              You are now subscribed to <strong>{strategyName}</strong>. We will
              send you notifications when this strategy switches allocation on
              market close ET.
            </Text>

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
              © 2025 Livefol.io | <Link href={unsubUrl}>Unsubscribe</Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SubscriptionEmail;
