'use client';

import { FormEvent, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import Link from 'next/link';

const EXPECTED_DOMAIN = 'testfol.io';
const EXPECTED_PATH = '/tactical';

export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission and page reload
    const formData = new FormData(event.currentTarget);
    const rawInput = formData.get('testfolioLink');

    if (typeof rawInput !== 'string' || rawInput.trim().length === 0) {
      setError('Please provide a link to your strategy.');
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawInput.trim());
    } catch {
      setError('Enter a valid https URL.');
      return;
    }

    if (parsedUrl.protocol !== 'https:') {
      setError('Only https links are supported.');
      return;
    }

    if (parsedUrl.hostname !== EXPECTED_DOMAIN) {
      setError('Link must be on testfol.io.');
      return;
    }

    if (parsedUrl.pathname !== EXPECTED_PATH) {
      setError('Link must point to /tactical.');
      return;
    }

    const sParam = parsedUrl.searchParams.get('s')?.trim();
    if (!sParam) {
      setError('Missing required query parameter s.');
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('s', sParam);
    setError('');

    // Update the URL with the new search parameters
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <Field>
        <FieldLabel htmlFor="testfolioLink">
          <span>
            Enter a link to a{' '}
            <Link
              href="https://testfol.io/tactical"
              target="_blank"
              className="link"
            >
              Testfol.io
            </Link>{' '}
            tactical allocation strategy.
          </span>
        </FieldLabel>
        <div className="flex gap-2">
          <Input
            id="testfolioLink"
            name="testfolioLink"
            placeholder="https://testfol.io/tactical?s=..."
            aria-invalid={!!error}
          />
          <Button type="submit" variant="ghost" size="icon">
            <SendHorizontal />
          </Button>
        </div>
        <FieldError>{error}</FieldError>
      </Field>
    </form>
  );
}
