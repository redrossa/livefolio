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

interface Props {
  name: string;
  strategyName: string;
  strategyId: string;
}

const SubscribeEmail = ({ name, strategyName, strategyId }: Props) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-background">
          <Preview>
            Signal alerts are still in development, but you are on the list.
          </Preview>
          <Container className="mx-auto py-5 pb-12">
            <Heading as="h1" className="mx-auto font-bold">
              Livefol.io
            </Heading>
            <Text className="text-base leading-6">Hi {name},</Text>
            <Text className="text-base leading-6">
              Thanks for subscribing to Livefol.io strategy signals for{' '}
              <strong>{strategyName}</strong>.
            </Text>
            <Text className="text-base leading-6">
              Signal alerts are still in development, but you are confirmed on
              the list and will be among the first to know once they are live.
            </Text>
            <Section className="text-center">
              <Button
                className="bg-zinc-900 rounded-sm text-white text-base no-underline text-center block p-3"
                href={`https://livefol.io?s=${strategyId}`}
              >
                View strategy
              </Button>
            </Section>
            <Text className="text-base leading-6">
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

export default SubscribeEmail;
