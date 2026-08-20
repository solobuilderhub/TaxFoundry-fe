"use client";

import { useListQuery } from "@classytic/arc-next/query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, type Client, type ClientInput } from "@/api/clients";

const CLIENTS_KEY = ["clients"] as const;

/**
 * Single client by id (getById → the doc directly). Authoritative for a name
 * lookup — the paged list can page a given client out of view, so never rely on
 * it to resolve one specific client.
 */
export function useClient(id?: string) {
  return useQuery({
    queryKey: [...CLIENTS_KEY, "detail", id],
    queryFn: () => clientsApi.getById({ id: id as string }) as Promise<Client>,
    enabled: !!id,
  });
}

/**
 * Paged client list. `useListQuery` (arc-next) normalizes the arc envelope
 * into `{ items, pagination, isLoading, isError, error, refetch }` — the exact
 * shape fluid's `ResourceDashboard` `result`/`pagination` props consume.
 */
export function useClients(params: Record<string, unknown> = {}) {
  return useListQuery<Client>({
    queryKey: [...CLIENTS_KEY, "list", params],
    queryFn: () => clientsApi.getAll({ params }),
  });
}

/** Create / update / delete mutations, invalidating the client list on success. */
export function useClientActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: CLIENTS_KEY });

  const create = useMutation({
    mutationFn: (data: Partial<ClientInput>) => clientsApi.create({ data }),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientInput> }) =>
      clientsApi.update({ id, data }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => clientsApi.delete({ id }),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
