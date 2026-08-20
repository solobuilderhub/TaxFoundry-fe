"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listApiKeys, createApiKey, deleteApiKey, type ApiKey } from "@/api/api-keys";

const KEY = ["api-keys"] as const;

/** API keys for the signed-in user, scoped to the active org by `metadata.orgId`. */
export function useApiKeys(orgId?: string) {
  const query = useQuery<ApiKey[]>({ queryKey: KEY, queryFn: listApiKeys });
  const items = (query.data ?? []).filter((k) => !orgId || k.metadata?.orgId === orgId);
  return { ...query, items };
}

export function useApiKeyActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: ({ name, orgId }: { name: string; orgId: string }) => createApiKey(name, orgId),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (keyId: string) => deleteApiKey(keyId),
    onSuccess: invalidate,
  });
  return { create, remove };
}
