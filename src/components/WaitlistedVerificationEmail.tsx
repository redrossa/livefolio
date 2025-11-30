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
import {
  buildStrategyUrl,
  buildUnsubscribeUrl,
  buildVerificationUrl,
} from '@/lib/email/urls';

interface Props {
  subscriberEmail: string;
  verificationId: string;
  strategyName: string;
  strategyLinkId: string;
}

const WaitlistedVerificationEmail = async ({
  subscriberEmail,
  verificationId,
  strategyName,
  strategyLinkId,
}: Props) => {
  const verificationUrl = await buildVerificationUrl(
    verificationId,
    strategyLinkId,
  );
  const unsubUrl = await buildUnsubscribeUrl(verificationUrl);
  const stratUrl = await buildStrategyUrl(strategyLinkId);
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>
            Strategy alerts are now live! Verify email to start receiving
            notifications on &#34;{strategyName}&#34;.
          </Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>
            <Text className="text-base leading-6">Hi {subscriberEmail},</Text>
            <Text className="text-base leading-6">
              You are receiving this email because you previously waitlisted to
              subscribe to strategy{' '}
              <Link href={stratUrl}>
                <strong>{strategyName}</strong>
              </Link>
              .
            </Text>
            <Text className="text-base leading-6">
              We want to inform you that our strategy alerts are now live, but
              you need to verify your email before you can start receiving
              notifications on your subscribed strategy.
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

export default WaitlistedVerificationEmail;
