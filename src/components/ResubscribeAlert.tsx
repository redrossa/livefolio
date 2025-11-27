'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ResubscribeResult } from '@/lib/email/resubscribe';
import { formatStrategyNameGroup } from '@/lib/format';

interface Props {
  resubscribe: ResubscribeResult | null;
}

export default function ResubscribeAlert({ resubscribe }: Readonly<Props>) {
  const email = resubscribe?.email;
  const newStrategyName = resubscribe?.newStrategyName;
  const oldStrategyNames = resubscribe?.oldStrategyNames ?? [];
  const router = useRouter();
  const shouldShow = Boolean(email && newStrategyName);
  const [open, setOpen] = useState(shouldShow);

  useEffect(() => {
    setOpen(shouldShow);
  }, [shouldShow]);

  useEffect(() => {
    if (!open && shouldShow) {
      const url = new URL(window.location.href);
      [
        'resubscribe_email',
        'resubscribe_token',
        'resubscribe_strategy_id',
        'resubscribe_strategy_name',
      ].forEach((param) => url.searchParams.delete(param));
      router.replace(url.pathname + url.search);
    }
  }, [open, shouldShow, router]);

  if (!shouldShow) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscription replaced</DialogTitle>
          <DialogDescription>
            {email} has been subscribed to {newStrategyName}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
