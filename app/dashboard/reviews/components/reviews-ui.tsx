"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { ResourceDashboard } from "@classytic/fluid/dashboard/resource-dashboard";
import { HeaderSection } from "@classytic/fluid/dashboard";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogWrapper } from "@classytic/fluid/client/dialog-wrapper";
import { useReviewMemos, useReviewMemoActions } from "@/hooks/query/use-review-memos";
import { useEngagements } from "@/hooks/query/use-engagements";
import type { FlagSeverity, ReviewMemo } from "@/api/review-memos";
import { createReviewColumns } from "../_config/review-columns";

const SEV_VARIANT: Record<FlagSeverity, "destructive" | "secondary" | "outline"> = {
  red: "destructive",
  amber: "secondary",
  green: "outline",
};

/**
 * Review queue — signed-off memos gate filing. Row-click opens the cited flag
 * list where a preparer resolves each red diagnostic (each links to its ITA/CRA
 * reference), then signs off; the governed `sign-off` action fails closed (422)
 * until every red flag is resolved.
 */
export function ReviewsUI() {
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const { items, pagination, isLoading, isError, error, refetch } =
    useReviewMemos({ page, limit: 20 });
  const { signOff, resolveFlag } = useReviewMemoActions();
  const { items: engagements } = useEngagements({ limit: 200 });

  const engagementLabel = useMemo(() => {
    const map = new Map(
      (engagements ?? []).map((e) => [
        e._id,
        `${e.program} · FYE ${e.taxYearEnd?.slice(0, 10) ?? ""}`,
      ]),
    );
    return (id: string) => map.get(id) ?? `Engagement ${id.slice(-6)}`;
  }, [engagements]);

  // Re-derive from the live list so resolving a flag reflects immediately.
  const detailMemo = (items ?? []).find((m) => m._id === detailId) ?? null;
  const flags = detailMemo?.flags ?? [];
  const unresolvedReds = flags.filter((f) => f.severity === "red" && !f.resolved).length;

  const onSignOff = async (id: string) => {
    try {
      await signOff.mutateAsync(id);
      toast.success("Review signed off");
      setDetailId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Sign-off blocked. Resolve red flags first",
      );
    }
  };

  const columns = useMemo(
    () =>
      createReviewColumns({
        engagementLabel,
        signingId: signOff.isPending ? (signOff.variables as string) : null,
        onSignOff: (row) => onSignOff(row._id),
      }),
    [engagementLabel, signOff],
  );

  return (
    <>
      <ResourceDashboard<ReviewMemo>
        header={
          <HeaderSection
            title="Reviews"
            description="Open a memo to work its cited flags. A return can't transmit with unresolved red flags."
            icon={ClipboardCheck}
          />
        }
        columns={columns}
        result={{ items, isLoading, isError, error, refetch, pagination }}
        onPageChange={setPage}
        onRowClick={(row) => setDetailId(row._id)}
        emptyState={{
          title: "No review memos",
          description:
            "Review memos appear here once a return is computed and queued for review.",
        }}
      />

      <DialogWrapper
        open={!!detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
        size="lg"
        title="Review flags"
        description={detailMemo ? engagementLabel(String(detailMemo.engagementYearId)) : ""}
        footer={
          <Button
            disabled={
              !detailMemo ||
              detailMemo.status === "signed_off" ||
              unresolvedReds > 0 ||
              signOff.isPending
            }
            onClick={() => detailMemo && onSignOff(detailMemo._id)}
          >
            {detailMemo?.status === "signed_off"
              ? "Signed off"
              : unresolvedReds > 0
                ? `Resolve ${unresolvedReds} red flag(s) to sign off`
                : "Sign off"}
          </Button>
        }
      >
        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {flags.length === 0 && (
              <p className="text-sm text-muted-foreground">No flags on this memo.</p>
            )}
            {flags.map((f, i) => (
              <div key={`${f.code}-${i}`} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={SEV_VARIANT[f.severity] ?? "outline"}>{f.severity}</Badge>
                    {f.resolved && <Badge variant="outline">resolved</Badge>}
                    <span className="font-mono text-xs text-muted-foreground">{f.code}</span>
                  </div>
                  <p className="mt-1 text-sm">{f.message}</p>
                  {(f.citation || f.line) && (
                    <p className="text-xs text-muted-foreground">
                      {[f.citation, f.line ? `CRA ${f.line}` : ""].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                {!f.resolved && f.severity !== "green" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resolveFlag.isPending}
                    onClick={async () => {
                      if (!detailMemo || !f.code) return;
                      await resolveFlag.mutateAsync({ id: detailMemo._id, code: f.code });
                      toast.success("Flag resolved");
                    }}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            ))}
          </div>
      </DialogWrapper>
    </>
  );
}
