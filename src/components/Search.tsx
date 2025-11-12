'use client';

import { FormEvent, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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

    // Update the URL with the new search parameters
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className="space-y-2">
      <form
        className="flex items-center gap-4 max-w-md"
        onSubmit={handleSubmit}
      >
        <input
          name="s"
          placeholder="https://testfol.io/tactical?s=..."
          className="w-full h-10 px-3 rounded-xs border border-solid border-foreground/10 outline-none focus:border-accent"
        />
        <button className="h-10 px-3 rounded-xs bg-foreground text-background hover:bg-foreground/80 font-medium transition-colors">
          Submit
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
