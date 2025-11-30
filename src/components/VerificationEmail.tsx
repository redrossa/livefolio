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
import { buildUnsubscribeUrl, buildVerificationUrl } from '@/lib/email/urls';

interface Props {
  subscriberEmail: string;
  verificationId: string;
  strategyName: string;
  strategyLinkId: string;
}

const VerificationEmail = ({
  subscriberEmail,
  verificationId,
  strategyName,
  strategyLinkId,
}: Props) => {
  const verificationUrl = buildVerificationUrl(verificationId, strategyLinkId);
  const unsubUrl = buildUnsubscribeUrl(verificationUrl);
  const stratUrl = formatStrategyUrl(strategyLinkId);
  const stratName = formatStrategyName(strategyName);
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>
            Verify email to subscribe to strategy &#34;{stratName}&#34;
          </Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>
            <Text className="text-base leading-6">Hi {subscriberEmail},</Text>
            <Text className="text-base leading-6">
              Thanks for requesting to subscribe to Livefol.io strategy signals
              for{' '}
              <Link href={stratUrl}>
                <strong>{stratName}</strong>
              </Link>
              .
            </Text>
            <Text className="text-base leading-6">
              Click the button below to verify your email and start receiving
              notifications whenever your subscribed strategy switches
              allocation.
            </Text>
            <Section className="text-center">
              <Button
                className="bg-zinc-900 rounded-sm text-white text-base no-underline text-center block p-3"
                href={verificationUrl}
              >
                Verify email
              </Button>
            </Section>
            <Text className="text-base leading-6">
              Best,
              <br />
              The Livefol.io team
            </Text>
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

export default VerificationEmail;
