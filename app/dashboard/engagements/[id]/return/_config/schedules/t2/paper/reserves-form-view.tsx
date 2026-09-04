"use client";

import type { Client } from "@/api/clients";
import type { ComputedReturn } from "@/api/computed-returns";
import type { EngagementYear } from "@/api/engagements";
import type { Control } from "react-hook-form";
import type { NavigateToLine } from "../../at1/paper/resolve-line";
import { Schedule17FormView } from "../../at1/paper/schedule17-form-view";
import { Schedule13FormView } from "./schedule13-form-view";

/**
 * `t2/reserves.ts` is ONE guided-editor schedule shared by both T2 and AT1
 * engagements — the same `rows` array holds federal opening/transfer/closing
 * AND the Alberta override fields side by side (`albertaOpening` etc.). But
 * `Schedule13FormView` (federal) and `Schedule17FormView` (Alberta) were
 * built as two separate, single-purpose components, and `formView` was
 * wired to `Schedule13FormView` alone — meaning an AT1 preparer's Form View
 * never showed the Alberta side (the override grid, its "Totals carried to
 * Schedule 12" section, or the federal-defaults reference table) at all.
 * This wrapper shows both, gated on the engagement's own program so a plain
 * T2 return keeps seeing only the federal view it actually needs.
 */
export function ReservesFormView(props: {
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
			<Schedule13FormView
				control={props.control}
				disabled={props.disabled}
				onNavigate={props.onNavigate}
				highlightLine={props.highlightLine}
			/>
			{isAt1 && (
				<div className="space-y-2">
					<h3 className="px-1 text-sm font-semibold">Alberta Schedule 17 — Continuity of reserves</h3>
					<Schedule17FormView
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
