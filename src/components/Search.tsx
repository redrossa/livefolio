'use client';

import { FormEvent, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const EXPECTED_DOMAIN = 'testfol.io';
const EXPECTED_PATH = '/tactical';

export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawInput = formData.get('s');

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

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Check your strategy</CardTitle>
        <CardDescription>
          Paste the link to your Testfol.io tactical allocation backtester.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
          onSubmit={handleSubmit}
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="strategy-url">Strategy URL</Label>
            <Input
              id="strategy-url"
              name="s"
              placeholder="https://testfol.io/tactical?s=..."
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="sm:w-auto">
            Submit
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
