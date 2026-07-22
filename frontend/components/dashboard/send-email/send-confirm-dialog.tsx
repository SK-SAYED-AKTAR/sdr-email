"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";

export function SendConfirmDialog({
  open,
  onOpenChange,
  count,
  sending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  sending: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Send {count} email{count === 1 ? "" : "s"}?
          </DialogTitle>
          <DialogDescription>
            This sends real emails to your prospects right now, from your connected inbox. This can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <LoadingButton loading={sending} onClick={onConfirm}>
            Send {count === 1 ? "Email" : `${count} Emails`}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
