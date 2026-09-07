"use client";

import { useListQuery } from "@classytic/arc-next/query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type Certification,
	type EngagementInput,
	type EngagementYear,
	engagementsApi,
	type T183AuthorizationInput,
} from "@/api/engagements";

const ENGAGEMENTS_KEY = ["engagement-years"];

/** Paged engagement list, normalized for fluid's ResourceDashboard. */
export function useEngagements(params: Record<string, unknown> = {}) {
	return useListQuery<EngagementYear>({
		queryKey: [...ENGAGEMENTS_KEY, "list", params],
		queryFn: () => engagementsApi.getAll({ params }),
	});
}

/**
 * Engagement mutations. `compute` dispatches the governed `compute` arc action
 * (`POST /:id/action`), which runs the T2/AT1 engine and persists the return.
 */
export function useEngagementActions() {
	const qc = useQueryClient();
	const invalidate = () => qc.invalidateQueries({ queryKey: ENGAGEMENTS_KEY });

	const create = useMutation({
		mutationFn: (data: Partial<EngagementInput>) =>
			engagementsApi.create({ data }),
		onSuccess: invalidate,
	});
	const update = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<EngagementInput>;
		}) => engagementsApi.update({ id, data }),
		onSuccess: invalidate,
	});
	const remove = useMutation({
		mutationFn: (id: string) => engagementsApi.delete({ id }),
		onSuccess: invalidate,
	});
	const compute = useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: string;
			input: Record<string, unknown>;
		}) => engagementsApi.dispatchAction({ id, action: "compute", data: input }),
		// `compute` persists a NEW computed-return fold (see `useLatestComputedReturn`'s
		// own doc comment: immutable folds, newest-by-createdAt is current) — the
		// engagement-years cache alone doesn't cover that. Without this, a schedule
		// view reading `useLatestComputedReturn` kept showing the PRE-recompute data
		// until a full page reload forced a fresh query — a preparer could recompute,
		// navigate to a schedule, and see stale figures with no indication they were
		// stale (found via live QA on Schedule 12 right after this fix's own build-out).
		onSuccess: () => {
			invalidate();
			qc.invalidateQueries({ queryKey: ["computed-returns"] });
		},
	});
	const prepare = useMutation({
		mutationFn: ({
			id,
			certification,
		}: {
			id: string;
			certification: Certification;
		}) =>
			engagementsApi.dispatchAction({
				id,
				action: "prepare-netfile",
				data: { certification },
			}),
		onSuccess: invalidate,
	});
	const prepareCif = useMutation<
		{ payloadHash: string; xml: string },
		Error,
		string
	>({
		mutationFn: (id: string) =>
			engagementsApi.dispatchAction({ id, action: "prepare-cif", data: {} }),
		onSuccess: invalidate,
	});
	/**
	 * Québec's CO-17 draft payload.
	 *
	 * A sibling of `prepareCif`, and like it needs no certifier — `prepare-co17`
	 * renders a draft for review, not a transmission. This was missing, so the
	 * export screen fell through its `isT2` check and dispatched `prepare-netfile`
	 * for a Québec engagement, which refuses anything that is not AT1. The button
	 * read "Generate Net File", collected an officer's name it never needed, and
	 * then failed with 400.
	 */
	const prepareCo17 = useMutation<
		{ payloadHash: string; xml: string },
		Error,
		string
	>({
		mutationFn: (id: string) =>
			engagementsApi.dispatchAction({ id, action: "prepare-co17", data: {} }),
		onSuccess: invalidate,
	});
	/**
	 * The federal engagement that belongs beside a provincial one.
	 *
	 * A corporation with an Alberta permanent establishment owes two returns, and
	 * an engagement here is one filing, so it needs two. The provincial one
	 * already holds the whole federal dataset — Alberta is computed FROM the
	 * federal figures — so this opens the federal engagement with that data
	 * already in it instead of asking for the same return a second time.
	 *
	 * Idempotent on the server: pressing it twice gives one federal return.
	 */
	const createCompanionFiling = useMutation<
		{
			engagementYearId: string;
			program: string;
			created: boolean;
			returnInputCopied: boolean;
		},
		Error,
		string
	>({
		mutationFn: (id: string) =>
			engagementsApi.dispatchAction({
				id,
				action: "create-companion-filing",
				data: {},
			}),
		onSuccess: invalidate,
	});
	/**
	 * Form T183CORP — the officer's authorization, bound to the CURRENT computed
	 * return. `transmit` refuses (409) without one, and a recompute invalidates a
	 * prior authorization, so this is captured after the final compute.
	 */
	const authorizeT183 = useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: string;
			input: T183AuthorizationInput;
		}) =>
			engagementsApi.dispatchAction({
				id,
				action: "authorize-t183",
				data: { ...input },
			}),
		onSuccess: invalidate,
	});
	const transmit = useMutation({
		mutationFn: ({
			id,
			certification,
		}: {
			id: string;
			certification: Certification;
		}) =>
			engagementsApi.dispatchAction({
				id,
				action: "transmit",
				data: { certification },
			}),
		onSuccess: invalidate,
	});
	const saveInput = useMutation({
		mutationFn: ({ id, returnInput }: { id: string; returnInput: unknown }) =>
			engagementsApi.dispatchAction({
				id,
				action: "save-input",
				data: { returnInput },
			}),
		onSuccess: invalidate,
	});
	/**
	 * Live CCA preview for the schedule-editor summary strip — runs the real
	 * engine `computeCcaClass` server-side, not a client-side approximation
	 * (see `_lib/use-cca-preview.ts`, the debounced hook that calls this).
	 * Read-only: does not invalidate the engagement list.
	 */
	const previewCca = useMutation({
		mutationFn: ({ id, classes }: { id: string; classes: unknown[] }) =>
			engagementsApi.dispatchAction({
				id,
				action: "preview-cca",
				data: { classes },
			}) as Promise<{ previews: ({ ccaClaimed: number } | null)[] }>,
	});
	const autoFill = useMutation({
		mutationFn: ({
			id,
			programAccount,
		}: {
			id: string;
			programAccount?: string;
		}) =>
			engagementsApi.dispatchAction({
				id,
				action: "auto-fill",
				data: { programAccount },
			}),
		onSuccess: invalidate,
	});

	return {
		create,
		update,
		remove,
		compute,
		prepare,
		prepareCif,
		prepareCo17,
		createCompanionFiling,
		authorizeT183,
		transmit,
		saveInput,
		previewCca,
		autoFill,
	};
}

/** Single engagement detail (getById → the doc directly). */
export function useEngagement(id: string) {
	return useQuery({
		queryKey: [...ENGAGEMENTS_KEY, "detail", id],
		queryFn: () => engagementsApi.getById({ id }) as Promise<EngagementYear>,
		enabled: !!id,
	});
}
