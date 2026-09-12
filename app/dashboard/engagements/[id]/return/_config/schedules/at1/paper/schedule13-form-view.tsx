"use client";

import { type Control, useFieldArray, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { CcaClass, CcaValues } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	type ClassGridColumn,
	type ClassGridRow,
	PaperClassGrid,
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
} from "./components/paper-primitives";
import {
	AT1_SCHEDULE_13_FIELDS,
	AT1_SCHEDULE_13_FOOTNOTES,
	AT1_SCHEDULE_13_GRID_COLUMNS,
} from "./generated/schedule13.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

/** The two Alberta-specific override fields Schedule 13 collects — everything else is assumed equal to federal (or computed by the engine) and shown read-only. */
const FIELD_NAME: Partial<Record<string, keyof CcaClass>> = {
	"013001001": "ccaClass",
	"013003001": "albertaOpeningUCC",
	"013019001": "albertaClaim",
};

const SCHEDULE_ID = "013";

/** The three totals (023/025/027) — always engine-computed, never a box a preparer fills; resolved from the last filed values the same way Schedule 21's read-only Part 1 is. */
function buildTotalsResolveLine(
	filedByFieldOccurrence: Map<string, string | number>,
): ResolveLine {
	return (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		return {
			editable: false,
			value: filedByFieldOccurrence.get(`${field}-1`) as
				| string
				| number
				| undefined,
		};
	};
}

/**
 * AT1 Schedule 13 paper Form View — one row per CCA class, added and removed
 * here, across all TWENTY-FOUR printed columns (nineteen numbered, five the
 * page shows as arithmetic and does not number).
 *
 * Only class number, Alberta opening UCC and the Alberta claim override are
 * editable; the rest is read from the last computed return, matching the same
 * "don't render a computed figure as a box" rule the card editor's generator
 * enforces.
 *
 * Reached through the CCA (S8) nav entry's Form View, not an entry of its own
 * — `t2/cca.ts` holds the `classes` array both schedules share, so its
 * `formView` renders `CcaFormView`, which stacks the federal Schedule 8 grid
 * and this one. Wired to `Schedule8FormView` alone, as it was, this component
 * was reachable from nowhere at all.
 */
export function Schedule13FormView({
	control,
	disabled,
	computed,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const ccaControl = control as unknown as Control<CcaValues>;
	const classes = useWatch({ control: ccaControl, name: "classes" }) ?? [];
	// Watched above for the row LABELS (which follow the class number as it is
	// typed); the field array is what adds and removes them.
	const { append, remove } = useFieldArray({
		control: ccaControl,
		name: "classes",
	});

	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === SCHEDULE_ID,
	);
	const filedByFieldOccurrence = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed
				? [[`${parsed.field}-${parsed.occurrence}`, v.value] as const]
				: [];
		}),
	);
	const resolveTotalsLine = buildTotalsResolveLine(filedByFieldOccurrence);
	const totalsFields = AT1_SCHEDULE_13_FIELDS.filter(
		(f) => f.section === "totals",
	);

	const rows: ClassGridRow[] = classes.map((c, i) => ({
		key: `class-${i}`,
		label: c?.ccaClass ? `Class ${c.ccaClass}` : `Row ${i + 1}`,
		arrayIndex: i,
	}));

	/*
	 * All 24 printed columns, including the five the page does not number.
	 *
	 * Those five (10, 13, 15-17) are the whole path from the entered figures to
	 * the CCA claim at column 23, and until the emitter stopped skipping them
	 * this grid drew nineteen — jumping 9 → 11, 12 → 14 and 14 → 18 while the
	 * headings that survived went on citing the ones that were missing.
	 *
	 * They get no `line` and no `fieldName`, so `PaperClassGrid` renders them
	 * read-only and `resolveCell` has nothing to look up: the engine derives
	 * each inside `computeSchedule13` and none is an AT1 line, so none reaches
	 * `schedulePayloads`. The column number, heading and arithmetic are what
	 * this view can honestly show, and they are what was absent.
	 */
	const columns: ClassGridColumn[] = AT1_SCHEDULE_13_GRID_COLUMNS.map((c) => ({
		// The printed three-digit number, or the column number in parentheses
		// where the page gives none — never a blank header cell.
		line: c.line ? c.line.slice(3, 6) : `(${c.column})`,
		caption: c.caption,
		kind: c.kind,
		fieldName: c.line ? FIELD_NAME[c.line] : undefined,
		printedHeading: c.printedHeading,
	}));

	return (
		<div className="space-y-4">
			<PaperSection
				title="Alberta capital cost allowance by class"
				description="One row per class. Class number, Alberta opening UCC, and the Alberta claim override are editable; the rest is assumed equal to federal — see the last computed return where available."
				formId="AT1SCH13"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="classes"
						rows={rows}
						columns={columns}
						control={ccaControl}
						disabled={disabled}
						/*
						 * Rows are added and removed here. This grid used to be
						 * display-only, so the view told a preparer to "add one in
						 * Guided view first" — the same instruction three other
						 * schedules had already been given a bespoke table to avoid.
						 * `PaperClassGrid` grew the two callbacks instead.
						 *
						 * The array is the FEDERAL `classes` list: one row per CCA
						 * class, shared with Schedule 8. Adding a class here adds it
						 * to both returns, which is correct — a class only exists on
						 * the Alberta schedule because it exists federally.
						 */
						onAppend={() => append({})}
						onRemove={(i) => remove(i)}
						addLabel="+ Add a CCA class"
						resolveCell={(row, col) => {
							// column.line was rewritten to the bare field above; re-derive the
							// full occurrence-scoped lookup key (CCA classes file with
							// occurrence = array index + 1, the convention this engine uses
							// elsewhere for repeating schedule rows).
							if (row.arrayIndex === undefined) return undefined;
							return filedByFieldOccurrence.get(
								`${col.line}-${row.arrayIndex + 1}`,
							) as string | number | undefined;
						}}
					/>
				</div>
			</PaperSection>
			{rows.length === 0 && (
				<p className="px-1 text-sm text-muted-foreground">
					No CCA classes yet — add one above, or in Guided view.
				</p>
			)}
			<PaperSection title="Totals carried to Schedule 12">
				{totalsFields.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={parseAt1LineItemId(f.line)?.field ?? f.line}
						caption={f.caption}
						kind={f.kind}
						role={f.role}
						note={f.note}
						to={f.to}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={ccaControl}
						resolveLine={resolveTotalsLine}
						disabled={disabled}
					/>
				))}
				<PaperFootnotes notes={AT1_SCHEDULE_13_FOOTNOTES} />
			</PaperSection>
		</div>
	);
}
