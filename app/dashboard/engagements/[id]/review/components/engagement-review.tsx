"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { HeaderSection } from "@classytic/fluid/dashboard";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEngagement } from "@/hooks/query/use-engagements";
import { useClient } from "@/hooks/query/use-clients";
import { useReviewMemos, useReviewMemoActions } from "@/hooks/query/use-review-memos";
import type { FlagSeverity } from "@/api/review-memos";

const SEV_VARIANT: Record<FlagSeverity, "destructive" | "secondary" | "outline"> = {
  red: "destructive",
  amber: "secondary",
  green: "outline",
};

/**
 * Engagement-scoped review — the deep-linked target of the workflow's "Open
 * review" step. Shows this engagement's cited diagnostics inline (no hunting the
 * global list), lets the preparer resolve each red flag, then sign off. The
 * governed `sign-off` action fails closed until every red flag is resolved.
 */
export function EngagementReview({ id }: { id: string }) {
  const router = useRouter();
  const { data: engagement } = useEngagement(id);
  const { data: client } = useClient(engagement?.clientId);
  const { items: memos, isLoading } = useReviewMemos({
    engagementYearId: id,
    limit: 1,
    sort: "-createdAt",
  });
  const { signOff, resolveFlag } = useReviewMemoActions();

  const memo = memos?.[0];
  const flags = memo?.flags ?? [];
  const unresolvedReds = flags.filter((f) => f.severity === "red" && !f.resolved).length;
  const signedOff = memo?.status === "signed_off";

  const backToEngagement = () => router.push(`/dashboard/engagements/${id}`);

  const onSignOff = async () => {
    if (!memo) return;
    try {
      await signOff.mutateAsync(memo._id);
      toast.success("Review signed off");
      backToEngagement();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Sign-off blocked. Resolve red flags first",
      );
    }
  };

  const onResolve = async (code?: string) => {
    if (!memo || !code) return;
    await resolveFlag.mutateAsync({ id: memo._id, code });
    toast.success("Flag resolved");
  };

  return (
    <div className="space-y-6">
      <HeaderSection
        title="Review"
        description={
          client?.name
            ? `${client.name} · ${engagement?.program ?? ""}`
            : "Cited diagnostics for this return"
        }
        icon={ClipboardCheck}
        badge={
          memo
            ? signedOff
              ? { text: "signed off", variant: "default" }
              : unresolvedReds > 0
                ? { text: `${unresolvedReds} red open`, variant: "destructive" }
                : { text: "ready to sign off", variant: "secondary" }
            : undefined
        }
      />

      <Button variant="ghost" size="sm" className="-ml-2 w-fit" onClick={backToEngagement}>
        <ArrowLeft className="size-4" /> Back to engagement
      </Button>

      {isLoading && <p className="text-muted-foreground">Loading review…</p>}

      {!isLoading && !memo && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No review memo yet. Compute the return to generate the cited review.
          </CardContent>
        </Card>
      )}

      {memo && (
        <>
          <div className="space-y-2">
            {flags.map((f, i) => (
              <Card key={`${f.code}-${i}`}>
                <CardContent className="flex items-start justify-between gap-3 py-3">
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
                      className="shrink-0"
                      disabled={resolveFlag.isPending}
                      onClick={() => onResolve(f.code)}
                    >
                      Resolve
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              {signedOff
                ? "This review has been signed off. The return can be filed."
                : unresolvedReds > 0
                  ? `Resolve ${unresolvedReds} red flag${unresolvedReds > 1 ? "s" : ""} to enable sign-off.`
                  : "No unresolved red flags. This review can be signed off."}
            </p>
            <Button
              className="shrink-0"
              disabled={!memo || signedOff || unresolvedReds > 0 || signOff.isPending}
              onClick={onSignOff}
            >
              {signedOff ? "Signed off" : "Sign off"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
