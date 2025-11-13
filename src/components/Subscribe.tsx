'use client';

import { useActionState } from 'react';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import handleSubscribe from '@/lib/actions/handleSubscribe';

interface Props {
  strategyId: string;
}

export default function Subscribe({ strategyId }: Readonly<Props>) {
  const [state, formAction] = useActionState(handleSubscribe, false);

  return (
    <form className="space-y-2 mt-4 max-w-3xl" action={formAction}>
      <Field>
        <FieldContent>
          <FieldLabel htmlFor="email">Subscribe to this strategy</FieldLabel>
          <FieldDescription>
            Get notified when a reallocation occurs.
          </FieldDescription>
        </FieldContent>
        <div className="flex gap-2 flex-col md:flex-row">
          <Input type="hidden" name="testfolio_id" value={strategyId} />
          <Input type="email" name="email" placeholder="Enter your email" />
          <Button type="submit" variant="default">
            Subscribe
          </Button>
        </div>
        {state && (
          <FieldError>
            Sorry, strategy alert subscription is still in development.
          </FieldError>
        )}
      </Field>
    </form>
  );
}
