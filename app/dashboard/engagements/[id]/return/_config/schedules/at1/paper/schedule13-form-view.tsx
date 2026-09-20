"use client";

import { type Control, useFieldArray, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type {
	AlbertaCca13Row,
	AlbertaCca13Values,
} from "../../../../_lib/return-input";
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

/**
 * The per-class columns THIS schedule collects, on its own `albertaCca13` slice.
 *
 * §3.2.3.14 gives acquisitions, net adjustments, dispositions and the DIEP
 * figure the same "if the Alberta amount differs from federal, enter it;
 * otherwise take fed 0082xx" rule that opening UCC and the claim have always
 * had, and the engine has accepted all of them as overrides from the start —
 * only the contract and this map were narrower, so four columns the preparer
 * was entitled to state rendered as read-only federal figures.
 *
 * Two collected fields are deliberately NOT here, because neither fits a
 * money column in this grid:
 *
 *   aiip          column 14 (013029) prints a DOLLAR amount; the engine models
 *                 the AIIP designation as a per-class boolean, so there is no
 *                 figure to put in the box. Collected in the guided editor.
 *   classEmptied  not a printed column at all — it is the fact behind the
 *                 terminal loss at 017, which the form shows as the computed
 *                 result. Also guided-only.
 *
 * 013045 (immediate expensing) is bound nowhere for the same reason it has no
 * separate field: one entry at 039 drives both printed columns.
 */
const FIELD_NAME: Partial<Record<string, keyof AlbertaCca13Row>> = {
	"013001001": "ccaClass",
	"013003001": "openingUCC",
	"013005001": "additions",
	"013007001": "netAdjustments",
	"013009001": "dispositions",
	"013039001": "immediateExpensing",
	"013019001": "claim",
};

/** 013125 — per RETURN, so it is a single row above the grid, not a column in it. */
const LIMIT_LINE = "013125001";

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
 * The columns §3.2.3.14 lets Alberta state for itself are editable — class
 * number, opening UCC, acquisitions, net adjustments, dispositions, the DIEP
 * figure and the claim — plus the per-return immediate expensing limit above
 * the grid. The rest is read from the last computed return, matching the same
 * "don't render a computed figure as a box" rule the card editor's generator
 * enforces.
 *
 * Its own nav entry now, at num "013" (`at1/alberta-cca13.ts`). The Alberta
 * columns used to live on the FEDERAL `cca.classes` slice, and the registry
 * pins one nav entry per `ReturnInput` key — so this form could only ever be a
 * second grid inside federal Schedule 8's row, invisible under "AT1 only". A
 * row here pairs to the federal class by class NUMBER, so the two lists can
 * differ in length and order.
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
	const ccaControl = control as unknown as Control<AlbertaCca13Values>;
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

	/*
	 * 013125 rendered nowhere at all until now: it is tagged `section: "grid"`
	 * but is a per-RETURN field rather than one of the grid's columns, so the
	 * column list below never picked it up and the `section === "totals"` filter
	 * above excluded it too. It fell through the only two collections this view
	 * renders.
	 */
	const limitField = AT1_SCHEDULE_13_FIELDS.find((f) => f.line === LIMIT_LINE);
	const resolveLimitLine: ResolveLine = () => ({
		editable: true,
		name: "immediateExpensingLimit",
	});

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
			{limitField && (
				<PaperSection title="Immediate expensing limit" formId="AT1SCH13">
					<PaperLeaderRow
						line={parseAt1LineItemId(limitField.line)?.field ?? limitField.line}
						caption={limitField.caption}
						kind={limitField.kind}
						role={limitField.role}
						note={limitField.note}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={ccaControl}
						resolveLine={resolveLimitLine}
						disabled={disabled}
					/>
				</PaperSection>
			)}
			<PaperSection
				title="Alberta capital cost allowance by class"
				description="One row per class. The Alberta columns the specification lets you state — opening UCC, acquisitions, net adjustments, dispositions, DIEP and the claim — are editable; the rest is computed or assumed equal to federal. The AIIP designation and 'class emptied' are collected in Guided view, since neither fits a money column here."
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
						 * The array is THIS schedule's own `classes` list — Alberta
						 * overrides only. Adding a row here does not add a class to
						 * the federal return; it records that an existing class's
						 * Alberta UCC or claim differs, which is the only thing this
						 * form exists to say.
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
