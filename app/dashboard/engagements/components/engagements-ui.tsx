"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { ResourceDashboard } from "@classytic/fluid/dashboard/resource-dashboard";
import { HeaderSection } from "@classytic/fluid/dashboard";
import { SchemaFormSheet } from "@classytic/fluid/formkit";
import { useEngagements, useEngagementActions } from "@/hooks/query/use-engagements";
import { useClients } from "@/hooks/query/use-clients";
import type { EngagementInput, EngagementYear } from "@/api/engagements";
import { createEngagementColumns } from "../_config/engagement-columns";
import { getEngagementFormSchema } from "../_config/engagement-form-config";

/**
 * A tax-year boundary is a CALENDAR DATE, not an instant.
 *
 * The date picker hands back a `Date` at *local* midnight. Calling
 * `toISOString()` on that moves the calendar day backwards for every timezone
 * east of UTC — picking "Sep 1, 2024" in UTC+6 stored `2024-08-31T18:00:00Z`.
 * The AT1 renderer formats dates from UTC parts (`fmtDate`, ca-tax
 * `at1-line-items.ts`), so the return filed taxation year begin/end 000036 /
 * 000037 as 20240831 / 20250830 — one day early at BOTH ends, on a return that
 * goes to TRA.
 *
 * Take the calendar date the user actually picked and pin it to UTC midnight,
 * which is what every downstream date-only consumer already assumes.
 */
const toIso = (v: unknown) => {
  if (!v) return undefined;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return `${v}T00:00:00.000Z`;
  }
  const d = new Date(v as string | number | Date);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00:00.000Z`;
};

/** One engagement = a client's tax year; the row-level "Compute return" action
 *  dispatches the governed `compute` arc action (runs the T2/AT1 engine). */
export function EngagementsUI() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { items, pagination, isLoading, isError, error, refetch } = useEngagements(
    { page, limit: 20 },
  );
  const { create, update } = useEngagementActions();
  const { items: clients } = useClients({ limit: 200 });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EngagementYear | null>(null);

  const clientOptions = useMemo(
    () =>
      (clients ?? []).map((c) => ({
        value: c._id,
        label: `${c.name} (${c.businessNumber})`,
      })),
    [clients],
  );

  const clientName = useMemo(() => {
    const map = new Map((clients ?? []).map((c) => [c._id, c.name]));
    return (id: string) => map.get(id) ?? id;
  }, [clients]);

  // Candidate targets for "amends a prior engagement" — deliberately unfiltered
  // by client/program/tax year (see engagement-form-config.ts's docstring): the
  // server is the actual gate. Drawn from the current page only, same as the
  // rest of this dashboard — fine for the size of engagement lists this app
  // handles today; a search-as-you-type picker is the natural upgrade if that
  // stops being true. Excludes the row being edited so an engagement can't
  // amend itself.
  const amendableOptions = useMemo(
    () =>
      (items ?? [])
        .filter((e) => e._id !== editTarget?._id)
        .map((e) => ({
          value: e._id,
          // Status + the id's last 6 chars disambiguate two engagements that
          // otherwise render an identical label (same client/program/year) —
          // e.g. an old, superseded attempt sitting alongside the real one.
          label: `${clientName(e.clientId)} — ${e.program} — ${e.taxYearEnd?.slice(0, 10)} — ${e.status} — #${e._id.slice(-6)}`,
        })),
    [items, editTarget, clientName],
  );

  const columns = useMemo(
    () =>
      createEngagementColumns({
        clientName,
        onEdit: setEditTarget,
        onOpen: (row) => router.push(`/dashboard/engagements/${row._id}`),
      }),
    [clientName, router],
  );

  const schema = useMemo(
    () => getEngagementFormSchema(clientOptions, amendableOptions),
    [clientOptions, amendableOptions],
  );

  const toPayload = (values: Record<string, unknown>): Partial<EngagementInput> => {
    const amendsEngagementYearId = String(values.amendsEngagementYearId ?? "").trim();
    return {
      clientId: values.clientId as string,
      program: values.program as EngagementInput["program"],
      firstReturn: Boolean(values.firstReturn),
      taxYearStart: toIso(values.taxYearStart),
      taxYearEnd: toIso(values.taxYearEnd),
      // Explicit null clears a previously-set amendment on edit, rather than
      // the update silently leaving a stale reference in place because an
      // empty string was dropped instead of sent.
      amendsEngagementYearId: amendsEngagementYearId || null,
      amendmentDescription: amendsEngagementYearId
        ? String(values.amendmentDescription ?? "").trim() || null
        : null,
    };
  };

  const editDefaults = editTarget
    ? {
        ...editTarget,
        taxYearStart: editTarget.taxYearStart?.slice(0, 10),
        taxYearEnd: editTarget.taxYearEnd?.slice(0, 10),
      }
    : {};

  return (
    <>
      <ResourceDashboard<EngagementYear>
        header={
          <HeaderSection
            title="Engagements"
            description="One filing engagement per client tax year. Compute, review, and file."
            icon={FileText}
            actions={[
              { text: "New engagement", icon: Plus, onClick: () => setCreateOpen(true) },
            ]}
          />
        }
        columns={columns}
        result={{ items, isLoading, isError, error, refetch, pagination }}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/engagements/${row._id}`)}
        emptyState={{
          title: "No engagements yet",
          description: "Create an engagement for a client's tax year to begin.",
        }}
      />

      <SchemaFormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New engagement"
        submitLabel="Create engagement"
        submitLoading={create.isPending}
        schema={schema}
        defaultValues={{ program: "T2" }}
        onSubmit={async (values: Record<string, unknown>) => {
          await create.mutateAsync(toPayload(values));
          setCreateOpen(false);
        }}
      />

      <SchemaFormSheet
        open={!!editTarget}
        onOpenChange={(open: boolean) => !open && setEditTarget(null)}
        title={editTarget ? "Edit engagement" : ""}
        submitLabel="Save changes"
        submitLoading={update.isPending}
        schema={schema}
        defaultValues={editDefaults as Record<string, unknown>}
        resetKey={editTarget?._id}
        onSubmit={async (values: Record<string, unknown>) => {
          if (!editTarget) return;
          await update.mutateAsync({ id: editTarget._id, data: toPayload(values) });
          setEditTarget(null);
        }}
      />
    </>
  );
}
