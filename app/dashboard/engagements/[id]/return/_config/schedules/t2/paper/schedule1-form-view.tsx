"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { NetIncomeValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type {
	LineValue,
	NavigateToLine,
	ResolveLine,
} from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_1_FIELDS,
	T2_SCHEDULE_1_SECTIONS,
} from "./generated/schedule1.layout";
import { filedValuesFor } from "./paper-form-sections";

const ROLE_BY_LINE = new Map(T2_SCHEDULE_1_FIELDS.map((f) => [f.line, f.role]));

/**
 * `T2_SCHEDULE_1`'s `input` fields bind directly to the SAME `lines.NNN`
 * field this schedule's own guided editor (`net-income.ts`) already
 * collects — one input, two views, never two copies of the value.
 *
 * Every other line renders read-only, showing the figure the last compute
 * filed against it.
 *
 * That used to be impossible and this comment used to say so: `schedulePayloads`
 * was Alberta-only, so a federal Schedule 1 showed "not available" on every
 * computed line. It is not Alberta-only now. `federalSchedulePayloads` emits
 * `T2SCH1` unconditionally, and Schedule 1 is the one schedule that needed no
 * line table to do it — `Schedule1Line` has carried its own CRA line since the
 * schedule was built, precisely so a reconciling item could not end up with an
 * amount and nowhere to go.
 *
 * A line the engine did not compute still shows nothing. Nothing here
 * re-derives a figure client-side, which would drift from `computeSchedule1`.
 */
function buildResolveLine(filed: Map<string, string | number>): ResolveLine {
	return (line: string): LineValue => {
		if (ROLE_BY_LINE.get(line) === "input") {
			return { editable: true, name: `lines.${line}` };
		}
		// Occurrence 1 — Schedule 1's open rows (135, 295, 395, 495) can repeat,
		// but the leader-row layout has one row per line, so a second occurrence
		// has nowhere to render and is deliberately not shown here.
		return { editable: false, value: filed.get(`${line}-1`) };
	};
}

/**
 * Federal T2 Schedule 1 — Net income (loss) for income tax purposes, as a
 * paper Form View. The book-to-tax reconciliation: every line the printed
 * form has, laid out in the same 4 sections (Add / Deduct / Add continued /
 * Deduct continued) the form itself uses.
 */
export function Schedule1FormView({
	control,
	computed,
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	computed?: ComputedReturn;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const c = control as unknown as Control<NetIncomeValues>;
	const resolveLine = buildResolveLine(filedValuesFor(computed, "T2SCH1"));

	return (
		<div className="space-y-4">
			{T2_SCHEDULE_1_SECTIONS.map((section) => {
				const fields = T2_SCHEDULE_1_FIELDS.filter(
					(f) => f.section === section.id,
				);
				if (fields.length === 0) return null;
				return (
					<PaperSection
						key={section.id}
						title={section.title}
						description={section.description}
						formId={section.id === "add-1" ? "T2SCH1" : undefined}
					>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								to={f.to}
								onNavigate={onNavigate}
								highlightLine={highlightLine}
								control={c}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
		</div>
	);
}
