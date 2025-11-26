'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  strategyId: string;
  strategyName: string;
}

export default function Subscribe({
  strategyId,
  strategyName,
}: Readonly<Props>) {
  const [state, formAction] = useActionState(handleSubscribe, { status: null });
  const formRef = useRef<HTMLFormElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const shouldPrompt =
    state.status === 'error' && Boolean(state.existingStrategies?.length);
  const [dialogDismissed, setDialogDismissed] = useState(false);
  const dialogOpen = shouldPrompt && !dialogDismissed;

  const handleProceed = () => {
    if (replaceRef.current) {
      replaceRef.current.value = 'true';
    }
    formRef.current?.requestSubmit();
  };

  const handleDialogClose = () => {
    if (replaceRef.current) {
      replaceRef.current.value = '';
    }
    setDialogDismissed(true);
  };

  useEffect(() => {
    setDialogDismissed(false);
    if (state.status !== 'error' && replaceRef.current) {
      replaceRef.current.value = '';
    }
  }, [state.status, state.message, state.existingStrategies, shouldPrompt]);
  return (
    <>
      <form
        className="space-y-2 mt-4 max-w-3xl"
        action={formAction}
        ref={formRef}
      >
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="email">Subscribe to this strategy</FieldLabel>
            <FieldDescription>
              Get notified when a reallocation occurs.
            </FieldDescription>
          </FieldContent>
          <div className="flex gap-2 flex-col md:flex-row">
            <Input type="hidden" name="testfolio_id" value={strategyId} />
            <Input
              type="hidden"
              name="testfolio_name"
              value={strategyName || 'Untitled Strategy'}
            />
            <Input ref={replaceRef} type="hidden" name="replace" value="" />
            <Input type="email" name="email" placeholder="Enter your email" />
            <Button type="submit" variant="default">
              Subscribe
            </Button>
          </div>
          {state.status === 'error' && !state.existingStrategies && (
            <FieldError>{state.message}</FieldError>
          )}
          {state.status === 'success' && (
            <span className="text-sm">{state.message}</span>
          )}
        </Field>
      </form>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace subscription?</DialogTitle>
            <DialogDescription>{state.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleProceed}>
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
