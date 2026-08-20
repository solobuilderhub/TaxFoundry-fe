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

const toIso = (v: unknown) =>
  v ? new Date(v as string).toISOString() : undefined;

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
    () => getEngagementFormSchema(clientOptions),
    [clientOptions],
  );

  const toPayload = (values: Record<string, unknown>): Partial<EngagementInput> => ({
    clientId: values.clientId as string,
    program: values.program as EngagementInput["program"],
    firstReturn: Boolean(values.firstReturn),
    taxYearStart: toIso(values.taxYearStart),
    taxYearEnd: toIso(values.taxYearEnd),
  });

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
