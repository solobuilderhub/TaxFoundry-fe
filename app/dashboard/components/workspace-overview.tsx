"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { CardWrapper, StatsGrid } from "@classytic/fluid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/query/use-clients";
import { useEngagements } from "@/hooks/query/use-engagements";
import type { EngagementStatus } from "@/api/engagements";

/**
 * Workspace summary for the dashboard home.
 *
 * The Overview used to be a single header card, which is why the app read as
 * black-and-white however the tokens were set — there was nothing on the page
 * for a brand colour to land on. These tiles give the shell its colour surface,
 * and every tone comes from a theme token (`brand`, `brand-accent`, `warning`,
 * `success`) rather than a raw Tailwind palette colour, so the whole thing
 * re-themes at once and stays inside the AA-checked pairs.
 */

/** status → token-backed tone. Colour is never the only signal: each is labelled. */
const STATUS_TONE: Record<EngagementStatus, string> = {
  draft: "border-border bg-muted text-muted-foreground",
  in_progress: "border-brand/35 bg-brand/10 text-brand",
  ready: "border-brand-accent/40 bg-brand-accent/10 text-brand-accent",
  filed: "border-success/40 bg-success/10 text-success",
};

type Tone = "brand" | "accent" | "warning" | "success";

const TILE_TONE: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand",
  accent: "bg-brand-accent/12 text-brand-accent",
  warning: "bg-warning/12 text-warning",
  success: "bg-success/12 text-success",
};

function StatTile({
  icon: Icon,
  tone,
  value,
  label,
  hint,
  href,
}: {
  icon: LucideIcon;
  tone: Tone;
  value: number | string;
  label: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-accent/40"
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex size-9 items-center justify-center rounded-lg", TILE_TONE[tone])}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}

export function WorkspaceOverview() {
  const { items: clients, isLoading: clientsLoading } = useClients({ limit: 200 });
  const { items: engagements, isLoading: engLoading } = useEngagements({ limit: 200 });

  const rows = engagements ?? [];
  const byStatus = (s: EngagementStatus) => rows.filter((e) => e.status === s).length;
  const loading = clientsLoading || engLoading;
  const n = (v: number) => (loading ? "—" : v);

  const clientName = (id: string) => (clients ?? []).find((c) => c._id === id)?.name ?? id;
  const recent = rows.slice(0, 5);

  return (
    <div className="space-y-6">
      <StatsGrid columns={{ default: 1, sm: 2, lg: 4 }} gap="default">
        <StatTile
          icon={Building2}
          tone="brand"
          value={n((clients ?? []).length)}
          label="Clients"
          hint="Corporations on file"
          href="/dashboard/clients"
        />
        <StatTile
          icon={FileText}
          tone="accent"
          value={n(rows.length)}
          label="Engagements"
          hint="Tax years in flight"
          href="/dashboard/engagements"
        />
        <StatTile
          icon={ClipboardCheck}
          tone="warning"
          value={n(byStatus("ready"))}
          label="Awaiting review"
          hint="Computed, not signed off"
          href="/dashboard/reviews"
        />
        <StatTile
          icon={CheckCircle2}
          tone="success"
          value={n(byStatus("filed"))}
          label="Filed"
          hint="Transmitted returns"
          href="/dashboard/engagements"
        />
      </StatsGrid>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <CardWrapper
          title="Recent engagements"
          description="Most recently created tax years"
          action={
            <Button render={<Link href="/dashboard/engagements" />} nativeButton={false} variant="ghost" size="sm">
              View all
              <ArrowUpRight className="size-4" />
            </Button>
          }
          contentClassName="p-0"
        >
          {recent.length ? (
            <div className="divide-y border-t">
              {recent.map((e) => (
                <Link
                  key={e._id}
                  href={`/dashboard/engagements/${e._id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{clientName(e.clientId)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {e.program} · {new Date(e.taxYearEnd).getFullYear()}
                    </span>
                  </span>
                  <Badge variant="outline" className={cn("shrink-0 capitalize", STATUS_TONE[e.status])}>
                    {e.status.replace("_", " ")}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
              {loading ? "Loading…" : "No engagements yet. Add a client, then open a tax year."}
            </p>
          )}
        </CardWrapper>

        <CardWrapper title="Start here" description="The usual first three steps">
          <div className="flex flex-col gap-2">
            <Button render={<Link href="/dashboard/clients" />} nativeButton={false} className="justify-start">
              <Plus className="size-4" />
              Add a client
            </Button>
            <Button
              render={<Link href="/dashboard/engagements" />}
              nativeButton={false}
              variant="outline"
              className="justify-start"
            >
              <FileText className="size-4" />
              Open a tax year
            </Button>
            <Button
              render={<Link href="/dashboard/reviews" />}
              nativeButton={false}
              variant="outline"
              className="justify-start"
            >
              <ClipboardCheck className="size-4" />
              Clear the review queue
            </Button>
          </div>
        </CardWrapper>
      </div>
    </div>
  );
}
