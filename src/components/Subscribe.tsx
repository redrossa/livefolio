'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Subscribe() {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string>();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('Sorry, strategy alerts subscription is still in development.');
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Subscribe for alerts</CardTitle>
        <CardDescription>
          We&apos;ll email you when your strategy triggers a reallocation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
          onSubmit={handleSubmit}
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={value}
              onChange={onChange}
              required
            />
          </div>
          <Button type="submit" className="sm:w-auto">
            Subscribe
          </Button>
        </form>
      </CardContent>
      {message && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardFooter>
      )}
    </Card>
  );
}
