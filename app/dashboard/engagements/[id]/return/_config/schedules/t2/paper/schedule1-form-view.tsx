"use client";

import type { Control } from "react-hook-form";
import type { NetIncomeValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_1_FIELDS,
	T2_SCHEDULE_1_SECTIONS,
} from "./generated/schedule1.layout";

const ROLE_BY_LINE = new Map(T2_SCHEDULE_1_FIELDS.map((f) => [f.line, f.role]));

/**
 * `T2_SCHEDULE_1`'s `input` fields bind directly to the SAME `lines.NNN`
 * field this schedule's own guided editor (`net-income.ts`) already
 * collects — one input, two views, never two copies of the value.
 *
 * `total`/`carried-in` lines (500, 510, 403, 107, …) have nowhere to resolve
 * a value from yet: unlike AT1, `ComputedReturn.schedulePayloads` is
 * AT1-only (see its own doc comment) — federal T2 does not persist a
 * per-line computed breakdown for Schedule 1, only the jacket's line 300
 * total. They render read-only with an honest "not available" state rather
 * than a client-side re-derivation that could drift from the engine's own
 * `computeSchedule1`.
 */
function buildResolveLine(): ResolveLine {
	return (line: string): LineValue => {
		if (ROLE_BY_LINE.get(line) === "input") {
			return { editable: true, name: `lines.${line}` };
		}
		return { editable: false, value: undefined };
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
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const c = control as unknown as Control<NetIncomeValues>;
	const resolveLine = buildResolveLine();

	return (
		<div className="space-y-4">
			{T2_SCHEDULE_1_SECTIONS.map((section) => {
				const fields = T2_SCHEDULE_1_FIELDS.filter((f) => f.section === section.id);
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
