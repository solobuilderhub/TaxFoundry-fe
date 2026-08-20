"use client";

import Link from "next/link";
import { ArrowLeft, Calculator, FileText, Printer, SquarePen } from "lucide-react";
import { OutlineNav, type OutlineNode } from "@classytic/fluid/client/outline-nav";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEngagement } from "@/hooks/query/use-engagements";
import { useLatestComputedReturn } from "@/hooks/query/use-computed-returns";
import { useClient } from "@/hooks/query/use-clients";
import type { ReturnInput } from "../../return/_lib/return-input";
import { buildJacket } from "../../return/_lib/jacket-model";
import { JacketDocument } from "../../_shared/jacket-document";

const money = (v: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(v || 0);

const STATUS_VARIANT: Record<string, "secondary" | "default" | "outline"> = {
  filed: "default",
  ready: "secondary",
  in_progress: "outline",
  draft: "outline",
};

export function ReturnJacket({ id }: { id: string }) {
  const { data: engagement, isLoading } = useEngagement(id);
  const { latest: computed } = useLatestComputedReturn(id);
  const { data: client } = useClient(engagement?.clientId);

  if (isLoading || !engagement) {
    return <div className="p-6 text-muted-foreground">Loading jacket…</div>;
  }

  const year = new Date(engagement.taxYearEnd).getFullYear();
  const clientName = client?.name ?? engagement.clientId;

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <Link
          href={`/dashboard/engagements/${id}`}
          className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> {clientName}
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{engagement.program} jacket · {year}</h1>
          <Badge variant={STATUS_VARIANT[engagement.status] ?? "outline"} className="capitalize">
            {engagement.status.replace("_", " ")}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/engagements/${id}/return`} className={buttonVariants({ variant: "outline" })}>
          <SquarePen className="size-4" /> Edit return
        </Link>
        <Link href={`/dashboard/engagements/${id}/print`} className={buttonVariants({ variant: "outline" })}>
          <Printer className="size-4" /> Print / PDF
        </Link>
        <Link href={`/dashboard/engagements/${id}/t183`} className={buttonVariants({ variant: "outline" })}>
          <FileText className="size-4" /> T183
        </Link>
      </div>
    </div>
  );

  // Not computed yet → guide the preparer to compute first.
  if (!computed) {
    return (
      <div className="space-y-4">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Calculator className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This return hasn’t been computed yet — the jacket appears once you compute it.
            </p>
            <Link href={`/dashboard/engagements/${id}/return`} className={buttonVariants()}>
              <Calculator className="size-4" /> Go to the return editor
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const doc = buildJacket({
    program: engagement.program,
    status: engagement.status,
    taxYearStart: engagement.taxYearStart,
    taxYearEnd: engagement.taxYearEnd,
    fields: (computed.fields ?? []) as { line: string; value: unknown; provenance: "engine" | "imported" | "human" }[],
    returnInput: (engagement.returnInput as ReturnInput | undefined) ?? {},
    identity: {
      corporation: client?.name ?? "",
      businessNumber: client?.businessNumber ?? "",
      ...(client?.corpType ? { corpType: client.corpType } : {}),
    },
  });

  // At-a-glance figures from the computed fields.
  const fieldVal = (line: string) => {
    const f = (computed.fields ?? []).find((x) => x.line === line);
    if (!f) return undefined;
    const n = Number(f.value);
    return line === "totalOwing" ? n / 100 : n;
  };
  const stats = [
    { label: "Taxable income", value: fieldVal("taxableIncome") ?? fieldVal("quebecTaxableIncome") ?? fieldVal("albertaTaxableIncome") },
    { label: "Part I / provincial tax", value: fieldVal("partITaxPayable") ?? fieldVal("quebecTaxPayable") ?? fieldVal("albertaTaxPayable") },
    { label: "Total tax payable", value: fieldVal("totalOwing") },
    { label: doc.bottomLine.label, value: doc.bottomLine.value, strong: true },
  ].filter((s) => s.value != null);

  const nodes: OutlineNode[] = doc.sections.map((s) => ({
    id: s.id,
    title: s.title,
    ...(s.num ? { number: s.num } : {}),
  }));

  return (
    <div className="space-y-4">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className={cn(s.strong && "border-primary/40 bg-primary/5")}>
            <CardContent className="py-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className={cn("mt-1 tabular-nums", s.strong ? "text-2xl font-bold" : "text-xl font-semibold")}>
                {money(s.value as number)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-4">
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Sections</p>
            <OutlineNav
              nodes={nodes}
              defaultExpanded="all"
              onNodeClick={(node) =>
                document.getElementById(`jacket-${node.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <JacketDocument doc={doc} />
        </div>
      </div>
    </div>
  );
}
