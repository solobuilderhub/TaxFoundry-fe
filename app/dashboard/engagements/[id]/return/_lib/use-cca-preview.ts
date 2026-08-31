"use client";

/**
 * Live CCA total for the return editor's summary strip — debounced calls to
 * the server's `preview-cca` action, which runs the real engine
 * `computeCcaClass` (see `apps/server/src/engine/cca-preview.service.ts`).
 *
 * This is the client half of closing the duplication the review flagged:
 * `_lib/calc.ts` used to carry its own hand-written re-implementation of the
 * same declining-balance / half-year / AIIP / immediate-expensing rules
 * purely so this one summary number could update without a full compute.
 * That is a second tax implementation to keep in sync by hand — this hook
 * instead debounces the preparer's edits and asks the authoritative engine.
 *
 * Keeps the LAST successful total on screen while a new one is in flight —
 * a preview flickering to 0 (or disappearing) on every keystroke would read
 * as the schedule having been cleared, which it hasn't.
 */
import { useEffect, useRef, useState } from "react";
import { useEngagementActions } from "@/hooks/query/use-engagements";
import type { CcaClass } from "./return-input";

const DEBOUNCE_MS = 400;

export function useCcaPreviewTotal(
	engagementId: string,
	classes: CcaClass[] | undefined,
): { total: number; loading: boolean } {
	const { previewCca } = useEngagementActions();
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	// Guards against a slow, now-stale request overwriting a faster, later one.
	const requestId = useRef(0);

	// Rows with no class code yet contribute nothing and aren't worth a
	// round-trip for — same "nothing to preview" gate the server applies.
	const previewable = (classes ?? []).filter((c) => c.ccaClass);
	const key = JSON.stringify(previewable);

	useEffect(() => {
		if (previewable.length === 0) {
			setTotal(0);
			setLoading(false);
			return;
		}
		const thisRequest = ++requestId.current;
		setLoading(true);
		const timer = setTimeout(() => {
			previewCca
				.mutateAsync({ id: engagementId, classes: previewable })
				.then(({ previews }) => {
					if (requestId.current !== thisRequest) return; // superseded
					setTotal(previews.reduce((sum, p) => sum + (p?.ccaClaimed ?? 0), 0));
				})
				.catch(() => {
					// Leave the last known total on screen — a transient preview
					// failure shouldn't blank a number the preparer was reading.
				})
				.finally(() => {
					if (requestId.current === thisRequest) setLoading(false);
				});
		}, DEBOUNCE_MS);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `key` is the intentional dependency, `previewable`/`classes` are derived from it each render.
	}, [key, engagementId]);

	return { total, loading };
}
