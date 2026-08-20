"use client";

import { useState } from "react";
import { CloudDownload, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DialogWrapper } from "@classytic/fluid/client/dialog-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEngagementActions } from "@/hooks/query/use-engagements";

/**
 * CRA Auto-fill My Return (AFR). Confirms the business number + RC program account
 * and shows the CRA authorization notice, then pulls the corporation's carryforward
 * balances and identification from CRA — filling only blank fields (a preparer's
 * entries are never overwritten). Fail-closed: until the org is CRA-enrolled the
 * server returns 503 and this surfaces a clear "not configured" message.
 */
export function AutoFillDialog({
  open,
  onOpenChange,
  engagementId,
  businessNumber,
  onApplied,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
  businessNumber?: string;
  onApplied: () => void;
}) {
  const { autoFill } = useEngagementActions();
  const [programAccount, setProgramAccount] = useState("0001");

  const run = async () => {
    try {
      const res = (await autoFill.mutateAsync({ id: engagementId, programAccount })) as
        | { data?: { filled?: string[] }; filled?: string[] }
        | undefined;
      const filled = (res?.data?.filled ?? res?.filled ?? []).length;
      toast.success(
        filled > 0
          ? `CRA Auto-fill imported ${filled} field${filled === 1 ? "" : "s"} (blanks only — your entries were kept).`
          : "CRA Auto-fill returned no new data to fill.",
      );
      onApplied();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "CRA Auto-fill failed");
    }
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Auto-fill from CRA"
      description="Retrieve the corporation's carryforward balances and identification from the CRA Auto-fill (AFR) service, then continue in the schedules."
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={run} disabled={autoFill.isPending || !businessNumber}>
            <CloudDownload className="size-4" />
            {autoFill.isPending ? "Retrieving…" : "Retrieve from CRA"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Business number</Label>
            <Input value={businessNumber ?? ""} disabled readOnly />
            {!businessNumber && (
              <p className="text-xs text-destructive">No business number on the client record.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rc-account">RC program account</Label>
            <Input
              id="rc-account"
              value={programAccount}
              onChange={(e) => setProgramAccount(e.target.value)}
              maxLength={4}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="flex gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <p>
            You are requesting corporate tax data from the Canada Revenue Agency. This requires the
            firm to be registered with CRA <span className="font-medium">My Business Account</span> or{" "}
            <span className="font-medium">Represent a Client</span> (a RepID with a valid RC59 business
            authorization on file). Auto-fill pulls carryforward balances and identification — it fills
            only blank fields and never overwrites what you have entered.
          </p>
        </div>
      </div>
    </DialogWrapper>
  );
}
