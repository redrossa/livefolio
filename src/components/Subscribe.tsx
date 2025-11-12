'use client';

import { FormEvent, useState } from 'react';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Subscribe() {
  const [isSubmitted, setIsSubmitted] = useState<boolean>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <form className="space-y-2 mt-4 max-w-2xl" onSubmit={handleSubmit}>
      <Field>
        <FieldContent>
          <FieldLabel htmlFor="testfolioLink">
            Subscribe to this strategy
          </FieldLabel>
          <FieldDescription>
            Get notified when a reallocation occurs.
          </FieldDescription>
        </FieldContent>
        <div className="flex gap-2">
          <Input
            type="email"
            name="testfolioLink"
            placeholder="Enter your email"
          />
          <Button type="submit" variant="default">
            Subscribe
          </Button>
        </div>
        {isSubmitted && (
          <FieldError>
            Sorry, strategy alert subscription is still in development.
          </FieldError>
        )}
      </Field>
    </form>
  );
}
