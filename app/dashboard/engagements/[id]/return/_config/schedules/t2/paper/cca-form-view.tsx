"use client";

import type { Control } from "react-hook-form";
import type { Client } from "@/api/clients";
import type { ComputedReturn } from "@/api/computed-returns";
import type { EngagementYear } from "@/api/engagements";
import type { NavigateToLine } from "../../at1/paper/resolve-line";
import { Schedule13FormView } from "../../at1/paper/schedule13-form-view";
import { Schedule8FormView } from "./schedule8-form-view";

/**
 * `t2/cca.ts` is ONE guided-editor schedule shared by both T2 and AT1
 * engagements — the same `classes` array holds the federal Schedule 8 columns
 * AND the Alberta Schedule 13 overrides side by side (`albertaOpeningUCC`,
 * `albertaClaim`). But `Schedule8FormView` (federal) and `Schedule13FormView`
 * (Alberta, in `at1/paper/`) were built as two separate, single-purpose
 * components and `formView` was wired to the federal one alone — so an AT1
 * preparer's Form View never showed the Alberta side at all: not the
 * nineteen-column S13 grid, not its "Totals carried to Schedule 12" section.
 *
 * This is the SAME defect `ReservesFormView` in this directory was written to
 * fix, on the same shape of schedule, and CCA never got the same treatment.
 * The Alberta view was emitted, hand-written, and reachable by nothing: the
 * guided editor collected `albertaOpeningUCC` and `albertaClaim`, the engine
 * computed Schedule 13 from them, and the only screen that renders that
 * schedule as TRA prints it was never mounted.
 *
 * ── Why the orphan test did not catch it ────────────────────────────────────
 *
 * `tests/forms-drift.test.ts`'s "no generated paper layout is orphaned" check
 * asks whether some view in the directory imports each emitted layout.
 * `at1/paper/schedule13-form-view.tsx` does import `generated/schedule13.layout`,
 * so the layout looked wired. The missing link was one level further up — a
 * VIEW that nothing renders — which that test does not look at. See the
 * companion assertion added beside it.
 *
 * Gated on the engagement's own program, so a plain T2 return keeps seeing
 * only the federal view it actually needs.
 */
export function CcaFormView(props: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	engagement?: EngagementYear;
	client?: Client;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const isAt1 = props.engagement?.program === "AT1";
	return (
		<div className="space-y-6">
			<Schedule8FormView
				control={props.control}
				disabled={props.disabled}
				computed={props.computed}
				onNavigate={props.onNavigate}
				highlightLine={props.highlightLine}
			/>
			{isAt1 && (
				<div className="space-y-2">
					<h3 className="px-1 text-sm font-semibold">
						Alberta Schedule 13 — Capital cost allowance
					</h3>
					<Schedule13FormView
						control={props.control}
						disabled={props.disabled}
						computed={props.computed}
						onNavigate={props.onNavigate}
						highlightLine={props.highlightLine}
					/>
				</div>
			)}
		</div>
	);
}
