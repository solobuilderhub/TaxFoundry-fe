"use client";

import { useListQuery } from "@classytic/arc-next/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewMemosApi, type ReviewMemo } from "@/api/review-memos";

const REVIEW_MEMOS_KEY = ["review-memos"];

/** Paged review-memo queue, normalized for fluid's ResourceDashboard. */
export function useReviewMemos(params: Record<string, unknown> = {}) {
  return useListQuery<ReviewMemo>({
    queryKey: [...REVIEW_MEMOS_KEY, "list", params],
    queryFn: () => reviewMemosApi.getAll({ params }),
  });
}

/** `signOff` dispatches the governed `sign-off` action (422 on unresolved reds). */
export function useReviewMemoActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: REVIEW_MEMOS_KEY });

  const signOff = useMutation({
    mutationFn: (id: string) =>
      reviewMemosApi.dispatchAction({ id, action: "sign-off", data: {} }),
    onSuccess: invalidate,
  });
  const resolveFlag = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      reviewMemosApi.dispatchAction({ id, action: "resolve-flag", data: { code } }),
    onSuccess: invalidate,
  });

  return { signOff, resolveFlag };
}
