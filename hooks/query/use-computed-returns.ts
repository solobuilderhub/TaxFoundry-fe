"use client";

import { useListQuery } from "@classytic/arc-next/query";
import { computedReturnsApi, type ComputedReturn } from "@/api/computed-returns";

/**
 * Latest computed return for an engagement. Computed returns are immutable
 * folds (create/get/list/delete, no update) — the newest by `createdAt` is the
 * current one. Returns the single latest fold, or `undefined`.
 */
export function useLatestComputedReturn(engagementYearId: string) {
  const query = useListQuery<ComputedReturn>({
    queryKey: ["computed-returns", "latest", engagementYearId],
    queryFn: () =>
      computedReturnsApi.getAll({
        params: { engagementYearId, limit: 1, sort: "-createdAt" },
      }),
    enabled: !!engagementYearId,
  });
  return { ...query, latest: query.items[0] as ComputedReturn | undefined };
}
