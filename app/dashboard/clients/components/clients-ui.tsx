"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { ResourceDashboard } from "@classytic/fluid/dashboard/resource-dashboard";
import { HeaderSection } from "@classytic/fluid/dashboard";
import { SchemaFormSheet } from "@classytic/fluid/formkit";
import { useClients, useClientActions } from "@/hooks/query/use-clients";
import type { Client, ClientInput } from "@/api/clients";
import { clientColumns, clientReadiness } from "../_config/client-columns";
import { getClientFormSchema } from "../_config/client-form-config";

/**
 * Clients list surface — fluid ResourceDashboard fed by arc-next `useListQuery`,
 * with create/edit driven by fluid's SchemaFormSheet + a formkit schema. No
 * hand-rolled table, pagination, or form wiring.
 */
export function ClientsUI() {
  const [page, setPage] = useState(1);
  const { items, pagination, isLoading, isError, error, refetch } = useClients({
    page,
    limit: 20,
  });
  const { create, update } = useClientActions();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);

  const schema = getClientFormSchema();

  // State-aware header signal — how many clients on this page still need the data
  // required to file (scoped to the visible page; accurate, not a full-set claim).
  const incompleteOnPage = (items ?? []).filter((c) => !clientReadiness(c).ready).length;

  return (
    <>
      <ResourceDashboard<Client>
        header={
          <HeaderSection
            title="Clients"
            description="Taxpayer corporations you file federal T2 and Alberta AT1 returns for."
            icon={Building2}
            badge={
              incompleteOnPage > 0
                ? { text: `${incompleteOnPage} incomplete`, variant: "secondary" }
                : undefined
            }
            actions={[
              { text: "Add client", icon: Plus, onClick: () => setCreateOpen(true) },
            ]}
          />
        }
        columns={clientColumns}
        result={{ items, isLoading, isError, error, refetch, pagination }}
        onPageChange={setPage}
        onRowClick={setEditTarget}
        emptyState={{
          title: "No clients yet",
          description: "Add your first taxpayer corporation to start a return.",
        }}
      />

      <SchemaFormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New client"
        submitLabel="Create client"
        submitLoading={create.isPending}
        schema={schema}
        defaultValues={{ jurisdiction: "AB" }}
        onSubmit={async (values: Record<string, unknown>) => {
          await create.mutateAsync(values as Partial<ClientInput>);
          setCreateOpen(false);
        }}
      />

      <SchemaFormSheet
        open={!!editTarget}
        onOpenChange={(open: boolean) => !open && setEditTarget(null)}
        title={editTarget ? `Edit ${editTarget.name}` : ""}
        submitLabel="Save changes"
        submitLoading={update.isPending}
        schema={schema}
        defaultValues={(editTarget ?? {}) as Record<string, unknown>}
        resetKey={editTarget?._id}
        onSubmit={async (values: Record<string, unknown>) => {
          if (!editTarget) return;
          await update.mutateAsync({
            id: editTarget._id,
            data: values as Partial<ClientInput>,
          });
          setEditTarget(null);
        }}
      />
    </>
  );
}
