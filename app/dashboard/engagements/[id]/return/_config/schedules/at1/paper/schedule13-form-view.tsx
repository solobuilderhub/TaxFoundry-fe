"use client";

import { BooleanCheckbox } from "@classytic/fluid/forms";
import { type Control, useFieldArray, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type {
	AlbertaCca13Row,
	AlbertaCca13Values,
	ReturnInput,
} from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import { DivergenceGateNotice } from "./components/divergence-gate-notice";
import {
	type ClassGridColumn,
	type ClassGridRow,
	PaperClassGrid,
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
} from "./components/paper-primitives";
import {
	WorksheetMoneyField,
	WorksheetTable,
} from "./components/worksheet-table";
import {
	AT1_SCHEDULE_13_FIELDS,
	AT1_SCHEDULE_13_FOOTNOTES,
	AT1_SCHEDULE_13_GRID_COLUMNS,
} from "./generated/schedule13.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

/**
 * Every column of the printed grid that a preparer fills in, bound to the field
 * behind it. Fourteen of the twenty-four; the other ten are arithmetic the form
 * states in terms of these.
 *
 * This map held THREE for a long time, which is why the grid read as mostly
 * greyed-out: a column with no binding renders read-only regardless of whether
 * the specification lets Alberta state it. §3.2.3.14 gives acquisitions, net
 * adjustments, dispositions, the DIEP figures, the assistance breakdown and the
 * AIIP amount the same "if the Alberta amount differs from federal, enter it;
 * otherwise take fed 0082xx" rule that opening UCC and the claim always had.
 *
 * Two things the schedule collects are not columns of this grid, so they sit
 * BELOW it, as a tick box per class and two supporting worksheets:
 *
 *   classEmptied   not printed at all. It is the FACT behind the terminal loss
 *                  at 017, which the form itself shows as a computed result: a
 *                  terminal loss is definitionally the residual balance of an
 *                  emptied class, so there is nothing to choose.
 *   class13/14     straight-line classes, with layers and properties rather
 *                  than a row of pool movements.
 */
const FIELD_NAME: Partial<Record<string, keyof AlbertaCca13Row>> = {
	"013001001": "ccaClass",
	"013003001": "openingUCC",
	"013005001": "additions",
	"013039001": "diepAcquisitions",
	"013007001": "netAdjustments",
	"013031001": "assistanceReceived",
	"013033001": "assistanceRepaid",
	"013009001": "dispositions",
	"013041001": "diepProceeds",
	"013043001": "diepUcc",
	"013045001": "immediateExpensing",
	"013029001": "aiipAcquisitions",
	"013013001": "rate",
	"013019001": "claim",
};

/** A straight-line class's opening UCC and claim, above its worksheet. Blank = federal. */
function StraightLineHeader({
	control,
	disabled,
	opening,
	claim,
}: {
	control: Control<AlbertaCca13Values>;
	disabled?: boolean;
	opening: "class13OpeningUCC" | "class14OpeningUCC";
	claim: "class13Claim" | "class14Claim";
}) {
	return (
		<div className="pt-1">
			<WorksheetMoneyField
				control={control}
				name={opening}
				label="Opening UCC"
				placeholder="Federal"
				disabled={disabled}
			/>
			<WorksheetMoneyField
				control={control}
				name={claim}
				label="Alberta claim"
				placeholder="Federal"
				disabled={disabled}
			/>
		</div>
	);
}

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
 * All fourteen columns §3.2.3.14 lets Alberta state for itself are editable,
 * plus the per-return immediate expensing limit above the grid. The remaining
 * ten are arithmetic the form states in terms of them and are read from the
 * last computed return, matching the same "don't render a computed figure as a
 * box" rule the card editor's generator enforces.
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
	returnInput,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	returnInput?: ReturnInput;
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
	/*
	 * `display` first, then `values`, so a transmitted figure always wins.
	 *
	 * The five columns the form numbers nowhere (10, 13, 15-17) arrive on the
	 * display channel under a synthetic `9nn` field keyed by column number —
	 * they are arithmetic the page prints but does not transmit, and rendering
	 * a dash where the form shows a figure is what made this grid read as
	 * unimplemented.
	 */
	const filedByFieldOccurrence = new Map(
		[...(filed?.display ?? []), ...(filed?.values ?? [])].flatMap((v) => {
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
		/*
		 * The printed three-digit number, or the column number in parentheses
		 * where the page gives none — never a blank header cell.
		 *
		 * `resolveCell` looks a cell up by this string, so an unnumbered column
		 * must resolve to the synthetic `9nn` field the engine puts its computed
		 * value on, not to the "(10)" label a preparer reads.
		 */
		line: c.line ? c.line.slice(3, 6) : `(${c.column})`,
		lookup: c.line
			? c.line.slice(3, 6)
			: `9${String(c.column).padStart(2, "0")}`,
		caption: c.caption,
		kind: c.kind,
		fieldName: c.line ? FIELD_NAME[c.line] : undefined,
		printedHeading: c.printedHeading,
	}));

	return (
		<div className="space-y-4">
			<DivergenceGateNotice
				returnInput={returnInput}
				hasEntries={classes.length > 0}
				schedule="Schedule 13"
				onNavigate={onNavigate}
			/>
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
				description="One row per class. Every column the specification lets Alberta state is editable here; the remaining ten are arithmetic on them, shown from the last computed return. 'Class emptied' and the straight-line classes 13 and 14 are below the grid."
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
							// CCA classes file with occurrence = array index + 1, the
							// convention this engine uses for repeating schedule rows.
							if (row.arrayIndex === undefined) return undefined;
							return filedByFieldOccurrence.get(
								`${col.lookup ?? col.line}-${row.arrayIndex + 1}`,
							) as string | number | undefined;
						}}
					/>
				</div>
			</PaperSection>
			{rows.length === 0 && (
				<p className="px-1 text-sm text-muted-foreground">
					No CCA classes yet — add one above.
				</p>
			)}
			{rows.length > 0 && (
				<PaperSection
					title="Classes emptied this year"
					description="Tick a class with no property left at year-end. Its remaining balance is then a terminal loss at column 22 (line 017), computed — never typed."
				>
					<div className="flex flex-wrap gap-x-6 gap-y-2 px-4 py-3">
						{rows.map((r) => (
							<BooleanCheckbox
								key={r.key}
								control={ccaControl}
								name={`classes.${r.arrayIndex}.classEmptied`}
								label={`${r.label} — class emptied`}
								disabled={disabled}
							/>
						))}
					</div>
				</PaperSection>
			)}
			<PaperSection
				title="Class 13 worksheet — leasehold interests"
				description="Supports a class 13 row: straight-line, one layer per leasehold improvement. Needed only when there is no federal Schedule 8 to read the layers from — blanks take the federal figures."
			>
				<StraightLineHeader
					control={ccaControl}
					disabled={disabled}
					opening="class13OpeningUCC"
					claim="class13Claim"
				/>
				<WorksheetTable
					control={ccaControl}
					name="class13Layers"
					disabled={disabled}
					addLabel="+ Add a leasehold layer"
					emptyText="No layers added this year."
					columns={[
						{ name: "description", label: "Description", kind: "text" },
						{ name: "capitalCost", label: "Capital cost", kind: "money" },
						{
							name: "leaseEnd",
							label: "Lease end",
							kind: "date",
							hint: "The 12-month period count is derived from this and the tax year start.",
						},
						{
							name: "firstRenewalEnd",
							label: "First renewal end",
							kind: "date",
							hint: "Where the lease grants renewal rights — replaces the lease end for the period count.",
						},
						{
							name: "claimedToDate",
							label: "CCA claimed in prior years",
							kind: "money",
						},
						{ name: "proceeds", label: "Disposition proceeds", kind: "money" },
						{ name: "isFirstYear", label: "First tax year", kind: "bool" },
						{ name: "aiip", label: "AIIP", kind: "bool" },
					]}
				/>
			</PaperSection>
			<PaperSection
				title="Class 14 worksheet — limited-life intangibles"
				description="Supports a class 14 row: straight-line, prorated per property by the life it had left when acquired."
			>
				<StraightLineHeader
					control={ccaControl}
					disabled={disabled}
					opening="class14OpeningUCC"
					claim="class14Claim"
				/>
				<WorksheetTable
					control={ccaControl}
					name="class14Properties"
					disabled={disabled}
					addLabel="+ Add a property"
					emptyText="No properties added this year."
					columns={[
						{ name: "description", label: "Description", kind: "text" },
						{ name: "capitalCost", label: "Capital cost", kind: "money" },
						{
							name: "lifeDaysAtAcquisition",
							label: "Days of life remaining at acquisition",
							kind: "number",
							hint: "Days the property had REMAINING when the cost was incurred — not its total life.",
						},
					]}
				/>
			</PaperSection>
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
