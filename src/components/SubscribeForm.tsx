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
import { Badge } from '@/components/ui/badge';

interface Props {
  strategyId: string;
  strategyName: string;
}

export default function SubscribeForm({
  strategyId,
  strategyName,
}: Readonly<Props>) {
  const [state, formAction] = useActionState(handleSubscribe, { status: null });
  return (
    <form className="space-y-2 mt-4 max-w-3xl" action={formAction}>
      <Field>
        <FieldContent>
          <FieldLabel htmlFor="email">
            Subscribe to this strategy{' '}
            <Badge variant="secondary">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />{' '}
              Now live
            </Badge>
          </FieldLabel>
          <FieldDescription>
            Get notified when a reallocation occurs.
          </FieldDescription>
        </FieldContent>
        <div className="flex gap-2 flex-col md:flex-row">
          <Input type="hidden" name="testfolio_id" value={strategyId} />
          <Input type="hidden" name="testfolio_name" value={strategyName} />
          <Input type="email" name="email" placeholder="Enter your email" />
          <Button type="submit" variant="default">
            Subscribe
          </Button>
        </div>
        {state.status === 'error' && <FieldError>{state.message}</FieldError>}
        {state.status === 'success' && (
          <span className="text-sm">{state.message}</span>
        )}
      </Field>
    </form>
  );
}
