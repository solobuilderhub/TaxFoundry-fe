"use client";

import Link from "next/link";
import { FileText, Printer } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useEngagement } from "@/hooks/query/use-engagements";
import { useLatestComputedReturn } from "@/hooks/query/use-computed-returns";
import { useClient } from "@/hooks/query/use-clients";
import type { ReturnInput } from "../../return/_lib/return-input";
import { buildJacket } from "../../return/_lib/jacket-model";
import { JacketDocument } from "../../_shared/jacket-document";

/**
 * Printable jacket. Renders the SAME `JacketDocument` as the on-screen jacket view
 * (built from `buildJacket`), so the PDF and the screen can never diverge.
 */
export function ReturnPrint({ id }: { id: string }) {
  const { data: engagement, isLoading } = useEngagement(id);
  const { latest: computed } = useLatestComputedReturn(id);
  const { data: client } = useClient(engagement?.clientId);

  if (isLoading || !engagement) {
    return <div className="p-6 text-muted-foreground">Loading return…</div>;
  }

  const doc = buildJacket({
    program: engagement.program,
    status: engagement.status,
    taxYearStart: engagement.taxYearStart,
    taxYearEnd: engagement.taxYearEnd,
    fields: (computed?.fields ?? []) as { line: string; value: unknown; provenance: "engine" | "imported" | "human" }[],
    returnInput: (engagement.returnInput as ReturnInput | undefined) ?? {},
    identity: {
      corporation: client?.name ?? "",
      businessNumber: client?.businessNumber ?? "",
      ...(client?.corpType ? { corpType: client.corpType } : {}),
    },
  });

  return (
    <div>
      {/* Toolbar — hidden in print via the document print stylesheet's screen-only rules */}
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Print preview. Use your browser’s “Save as PDF” to export.</p>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/engagements/${id}/jacket`} className={buttonVariants({ variant: "outline" })}>
            <FileText className="size-4" /> Jacket view
          </Link>
          <Link href={`/dashboard/engagements/${id}/t183`} className={buttonVariants({ variant: "outline" })}>
            <FileText className="size-4" /> T183 authorization
          </Link>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {!computed && (
        <div className="no-print mb-4 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm">
          This return hasn’t been computed yet — the jacket below shows identification only. Compute the return before filing.
        </div>
      )}

      <JacketDocument doc={doc} />
    </div>
  );
}
