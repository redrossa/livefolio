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
import { formatStrategyNameGroup } from '@/lib/format';

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

  const strategiesText = formatStrategyNameGroup(strategyNames);

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
