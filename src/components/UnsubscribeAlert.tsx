'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { UnsubscribeResult } from '@/lib/email/unsubscribe';
import { Button } from '@/components/ui/button';

interface Props {
  unsubscribe: UnsubscribeResult | null;
}

export default function UnsubscribeAlert({ unsubscribe }: Readonly<Props>) {
  const email = unsubscribe?.email;
  const strategyNames = unsubscribe?.strategyNames;
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(email));

  useEffect(() => {
    if (!open && email) {
      const url = new URL(window.location.href);
      ['unsubscribe_email', 'unsubscribe_token'].forEach((param) =>
        url.searchParams.delete(param),
      );
      router.replace(url.pathname + url.search);
    }
  }, [open, email, router]);

  if (!email || !strategyNames?.length) {
    return null;
  }

  const normalizedNames = strategyNames.map(
    (name) => name.trim() || 'Untitled Strategy',
  );

  let strategiesText = '';
  if (normalizedNames.length === 1) {
    strategiesText = normalizedNames[0];
  } else if (normalizedNames.length > 1) {
    const last = normalizedNames[normalizedNames.length - 1];
    const initial = normalizedNames.slice(0, -1);
    strategiesText = `${initial.join(', ')} and ${last}`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>We&#39;re sorry to see you go</DialogTitle>
          <DialogDescription>
            {email} has been unsubscribed from {strategiesText}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
