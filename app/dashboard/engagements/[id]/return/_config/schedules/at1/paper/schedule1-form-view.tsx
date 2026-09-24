"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import { type Control, useFieldArray, useWatch } from "react-hook-form";
import type {
	AlbertaSbdCalculationTable,
	ComputedReturn,
} from "@/api/computed-returns";
import { cn } from "@/lib/utils";
import type {
	AlbertaSbdValues,
	ReturnInput,
} from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import { PaperMoney, PaperText } from "./components/paper-inputs";
import {
	formatSignedMoney,
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
	readFootnotePlacement,
} from "./components/paper-primitives";
import {
	AT1_SCHEDULE_1_AGREEMENT_COLUMNS,
	AT1_SCHEDULE_1_AGREEMENT_TOTALS_LABEL,
	AT1_SCHEDULE_1_AREA_B_LARGE_CORPORATIONS,
	AT1_SCHEDULE_1_AREA_B_PREAMBLE,
	AT1_SCHEDULE_1_AREA_B_STEPS,
	AT1_SCHEDULE_1_AREA_B_TITLE,
	AT1_SCHEDULE_1_BLOCK_HEADINGS,
	AT1_SCHEDULE_1_COLUMNS,
	AT1_SCHEDULE_1_FIELDS,
	AT1_SCHEDULE_1_FOOTNOTE_PLACEMENT,
	AT1_SCHEDULE_1_FOOTNOTES,
	AT1_SCHEDULE_1_RATE_PERIODS,
	AT1_SCHEDULE_1_SECTIONS,
	AT1_SCHEDULE_1_TOTAL_DAYS_LABEL,
	type PaperField,
} from "./generated/schedule1.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

import { filedByFieldFor, valueAt } from "./resolve-line";
import {
	AREA_B_AMOUNT,
	AREA_B_BLANK_REASON,
	isSupersededPre2022C,
} from "./schedule1-area-b-map";

const SCHEDULE_ID = "001";

/**
 * Lines 005 and 011 both file the SAME entered value (`royaltyTaxDeduction`)
 * against two different income bases — see `schedule1.ts`'s own doc comment.
 * Everything else on this schedule is carried in from elsewhere, computed, or
 * (for 015/019/020/021/031/044) printed on the page but not collected by this
 * product at all; each of those carries a note saying so.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaSbdValues>> = {
	"005": "royaltyTaxDeduction",
	"011": "royaltyTaxDeduction",
};

/** Area A's editable columns, bound to `associatedCorpAgreement`'s row shape. */
const AGREEMENT_FIELD: Record<string, string | undefined> = {
	"041": "name",
	"043": "albertaCan",
	// 044 is printed but not collected — the page derives 045 from it, and this
	// product collects the dollars at 045 directly. See the field's own note.
	"044": undefined,
	"045": "allocatedAmount",
};

/**
 * Federal figures this schedule DISPLAYS but does not own — a box showing the
 * derived figure, which writes to the one place the figure actually lives.
 *
 * Line 003 is "Income from active businesses carried on in Canada as reported
 * on the T2 line 400 OR on Schedule 12, line 106". It is genuinely carried in,
 * and making it an ordinary input here would give one fact two homes. But it
 * rendered as a dead read-only cell, so a preparer whose T2 was prepared
 * ELSEWHERE — no federal return in this app to derive it from — had a
 * permanently empty box on the mandatory line the whole deduction is computed
 * from, and no way to fill it.
 *
 * `LinkedSlot` is the mechanism the app already uses for exactly this on
 * Schedule 21 (taxable dividends deductible, the Part VI.1 deduction,
 * prospector's shares). The write goes to `sbd.activeBusinessIncome`, the same
 * slot the federal Small Business Deduction schedule edits, so the two cannot
 * state different active business income.
 *
 * NOT line 009: Alberta taxable income is derived by the engine from the
 * federal taxable income and the allocation factor, and the preparer's own
 * override for it already exists as `alberta.albertaTaxableIncome` — a
 * different slot with a different meaning, reported separately in review.
 */
const T2_SLOTS: Record<string, { path: string; label: string }> = {
	"003": {
		path: "sbd.activeBusinessIncome",
		label: "T2 line 400 — active business income",
	},
};

const printed = (line: string) => parseAt1LineItemId(line)?.field ?? line;

/**
 * The base amount Area A allocates, as the page prints it.
 *
 * $200,000, NOT the $500,000 threshold: page 1 column B multiplies this by
 * 250% to reach the threshold, and the page's own footnote spells the history
 * out ("Before April 1, 2001: $200,000 … after March 31, 2009: $500,000").
 * Checking the allocation against $500,000 would let a group allocate two and
 * a half times its base amount without complaint.
 */
const AGREEMENT_BASE_AMOUNT = 200_000;

/** Two decimals, as the page's own percentages are printed. */
const formatPercent = (n: number) => `${n.toFixed(2)}%`;

function buildResolveLine(
	computed: ComputedReturn | undefined,
	returnInput?: ReturnInput,
	writeInput?: (path: string, value: number | undefined) => Promise<void>,
): ResolveLine {
	const filedByField = filedByFieldFor(
		computed,
		SCHEDULE_ID,
		(l) => parseAt1LineItemId(l)?.field,
	);

	return (line: string): LineValue => {
		const field = printed(line);
		const ownName = OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		const value = filedByField.get(field) as string | number | undefined;
		const t2 = T2_SLOTS[field];
		if (t2 && writeInput) {
			return {
				editable: false,
				value,
				linked: {
					backing: "global",
					path: t2.path,
					label: t2.label,
					stored: valueAt(returnInput, t2.path),
					write: (v) => writeInput(t2.path, v),
				},
			};
		}
		return { editable: false, value };
	};
}

/**
 * AT1 Schedule 1 paper Form View — the page's five boxes, in order.
 *
 * ── What changed on 2026-09-13 ──────────────────────────────────────────────
 *
 * This rendered two boxes. The page has five, and the three that were missing
 * held the association question the whole schedule turns on (001), the
 * allocation factor the deduction is scaled by (019/020/021), and the deduction
 * itself (031, "Total of column G", the figure the page says to enter on AT1
 * page 2 line 070). Neither the form definition nor this view had any of them.
 *
 * Line 001 was absent for a documented reason that turned out to answer a
 * different question: the ANSWER files on the AT1 jacket, at 000001001, and
 * four accepted certification samples prove it never files at 001001001. True,
 * and nothing to do with whether the box is printed — it is the first thing on
 * the page. The field now carries a `to` ref at the jacket line and a note
 * saying so; the payload invariant is still pinned by a test in ca-tax.
 *
 * Three further things the page prints and this did not:
 *
 *   - **The calculation table.** Seven lettered columns across six pre-printed
 *     rate periods. The engine reaches jacket 070 as a residual rather than
 *     through these columns, so every cell is read-only — but a preparer
 *     checking a return against the form needs to see the table that is on it.
 *   - **Six in-box headings**, one of which does real routing: "Corporations
 *     with permanent establishments only in Alberta, ignore lines 019, 020 and
 *     021 and go directly to the table below" is the difference between three
 *     boxes to fill and three to skip, and no caption says it.
 *   - **The footnotes, where the page puts them.** All five are set mid-page at
 *     the foot of the box they qualify; they were collected into one list at the
 *     bottom, so the asterisk on line 003 led nowhere. `footnotePlacement` in
 *     the form definition is what moved them, and it carries the glyph too —
 *     "*" means three different things on this form, once per box.
 *
 * Area A's table was `PaperClassGrid`, which showed field NAMES as column
 * headers and "not added" in every cell until rows existed — the same defect
 * Schedules 13 and 17 had. It is the page's four columns now, with its
 * pre-printed "Totals: 100% $200,000" row.
 */
export function Schedule1FormView({
	control,
	disabled,
	computed,
	onNavigate,
	highlightLine,
	returnInput,
	writeInput,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	returnInput?: ReturnInput;
	writeInput?: (path: string, value: number | undefined) => Promise<void>;
}) {
	const sbdControl = control as unknown as Control<AlbertaSbdValues>;
	const resolveLine = buildResolveLine(computed, returnInput, writeInput);
	const footnotes = readFootnotePlacement(
		AT1_SCHEDULE_1_FOOTNOTES,
		AT1_SCHEDULE_1_FOOTNOTE_PLACEMENT,
	);

	const sectionFields = (id: string) =>
		AT1_SCHEDULE_1_FIELDS.filter((f) => f.section === id);

	const row = (f: PaperField) => (
		<PaperLeaderRow
			key={f.line}
			line={printed(f.line)}
			caption={f.caption}
			kind={f.kind}
			role={f.role}
			note={f.note}
			sourceText={f.sourceText}
			from={f.from}
			to={f.to}
			footnoteMarks={f.footnoteMarks}
			footnotes={AT1_SCHEDULE_1_FOOTNOTES}
			footnoteSymbol={(mark) => footnotes.marks[mark]}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			control={sbdControl}
			resolveLine={resolveLine}
			disabled={disabled}
		/>
	);

	/** A row, preceded by whatever the page prints immediately above it. */
	const rowWithHeadings = (f: PaperField) => {
		const headings = AT1_SCHEDULE_1_BLOCK_HEADINGS.filter(
			(h) => h.aboveLine === printed(f.line),
		);
		if (headings.length === 0) return row(f);
		return (
			<div key={f.line}>
				{headings.map((h) => (
					<p
						key={h.text}
						className="px-4 pb-1 pt-3 text-sm font-semibold leading-tight"
					>
						{h.text}
						{h.footnoteMarks?.map((mark) => {
							const text = AT1_SCHEDULE_1_FOOTNOTES[mark];
							if (!text) return null;
							return (
								<TooltipWrapper key={mark} content={text} side="top">
									<sup className="ml-0.5 cursor-help font-mono text-muted-foreground">
										{footnotes.marks[mark] ?? "*"}
									</sup>
								</TooltipWrapper>
							);
						})}
					</p>
				))}
				{row(f)}
			</div>
		);
	};

	const meta = (id: string) => AT1_SCHEDULE_1_SECTIONS.find((s) => s.id === id);
	const notesFor = (id: string) => (
		<PaperFootnotes
			notes={AT1_SCHEDULE_1_FOOTNOTES}
			only={footnotes.forSection(id)}
			marks={footnotes.marks}
		/>
	);

	const association = meta("association");

	return (
		<div className="space-y-4">
			{/*
			 * The eligibility sentence, where the page prints it: between the
			 * identification box and the FIRST heading, which is the association
			 * box. It sat on the `deduction` section while that was first, so it
			 * moved when the association box appeared. It used to also be footnote
			 * 0 — carrying both is how Schedule 20 rendered its medicine-gift
			 * paragraph twice.
			 */}
			{association?.printedBefore && (
				<p className="px-1 text-sm font-medium text-muted-foreground">
					{association.printedBefore}
				</p>
			)}

			{(["association", "deduction", "eligible"] as const).map((id, i) => {
				const m = meta(id);
				if (!m) return null;
				return (
					<PaperSection
						key={id}
						title={m.title}
						description={m.description}
						formId={i === 0 ? "AT1SCH1" : undefined}
					>
						{sectionFields(id).map(rowWithHeadings)}
						{/*
						 * Text the page prints inside the box BELOW its last line —
						 * 'If "Yes", complete AREA A on page 2.' on the association
						 * box, which is the entire reason line 001 is asked. Bold and
						 * inside the card, as the page sets it.
						 */}
						{m.printedAfter && (
							<p className="px-4 py-2 text-sm font-semibold">
								{m.printedAfter}
							</p>
						)}
						{notesFor(id)}
					</PaperSection>
				);
			})}

			<PaperSection
				title={meta("calculation")?.title ?? "Calculation"}
				description={meta("calculation")?.description}
			>
				<CalculationTable
					footnotes={footnotes}
					table={
						computed?.schedulePayloads?.find((p) => p.scheduleId === "001")
							?.tables?.sbdCalculation
					}
				/>
				{sectionFields("calculation").map(rowWithHeadings)}
				{notesFor("calculation")}
			</PaperSection>

			<PaperSection
				title={meta("agreement")?.title ?? "Area A"}
				description={meta("agreement")?.description}
			>
				{/*
				 * Area A's two stacked headings — "Allocation Agreement:" and the
				 * $200,000 paragraph — are printed above the TABLE, and the table
				 * replaces lines 041-045 as leader rows, so they are rendered here
				 * rather than by `rowWithHeadings`.
				 */}
				{AT1_SCHEDULE_1_BLOCK_HEADINGS.filter((h) => h.aboveLine === "041").map(
					(h) => (
						<p key={h.text} className="px-4 pb-1 pt-3 text-sm leading-snug">
							<span className="font-semibold">{h.text}</span>
							{h.footnoteMarks?.map((mark) => {
								const text = AT1_SCHEDULE_1_FOOTNOTES[mark];
								if (!text) return null;
								return (
									<TooltipWrapper key={mark} content={text} side="top">
										<sup className="ml-0.5 cursor-help font-mono text-muted-foreground">
											{footnotes.marks[mark] ?? "*"}
										</sup>
									</TooltipWrapper>
								);
							})}
						</p>
					),
				)}
				<AgreementTable
					control={sbdControl}
					disabled={disabled}
					footnotes={footnotes}
				/>
				{notesFor("agreement")}
			</PaperSection>

			<AreaB computed={computed} />

			{/* Anything belonging to no box. Empty on this form — kept so a note added upstream cannot vanish. */}
			<PaperFootnotes
				notes={AT1_SCHEDULE_1_FOOTNOTES}
				only={footnotes.unplaced}
				marks={footnotes.marks}
			/>
		</div>
	);
}

type Placement = ReturnType<typeof readFootnotePlacement>;

const cellMoney = (v: number | undefined) =>
	v === undefined ? "" : `$${Math.round(v).toLocaleString("en-CA")}`;

/**
 * "Calculation of the Alberta Small Business Deduction" — computed by the
 * engine (ca-tax `computeAlbertaSbdCalculation`), read-only.
 *
 * The page's own layout: the period label, then A-G. B and F are pre-printed
 * on the paper form; A, C, D, E and G are the engine's, on rows the tax year
 * actually touches — the others stay blank as they do on paper. The total of G
 * is line 031 below, which equals jacket line 070. Print-only: the
 * specification gives none of these cells a line to transmit on.
 */
function CalculationTable({
	footnotes,
	table,
}: {
	footnotes: Placement;
	table?: AlbertaSbdCalculationTable;
}) {
	const rowFor = (label: string) => table?.rows.find((r) => r.label === label);
	return (
		<div className="overflow-x-auto p-2">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr>
						<th className="border-b px-2 pb-2" aria-label="Period" />
						{AT1_SCHEDULE_1_COLUMNS.map((col) => (
							<th
								key={col.column}
								className="min-w-[7rem] border-b px-2 pb-2 text-left align-bottom font-medium"
							>
								<span className="block text-center text-sm font-semibold">
									{col.column}
								</span>
								<span className="block text-xs leading-tight">
									{col.heading}
									{col.footnoteMarks?.map((mark) => {
										const text = AT1_SCHEDULE_1_FOOTNOTES[mark];
										if (!text) return null;
										return (
											<TooltipWrapper key={mark} content={text} side="top">
												<sup className="ml-0.5 cursor-help font-mono">
													{footnotes.marks[mark] ?? "*"}
												</sup>
											</TooltipWrapper>
										);
									})}
								</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{AT1_SCHEDULE_1_RATE_PERIODS.map((period) => {
						const r = rowFor(period.label);
						const has = !!r && r.days > 0;
						const num = "px-2 py-1.5 text-right tabular-nums";
						return (
							<tr key={period.label} className="border-b">
								<td className="px-2 py-1.5 text-xs leading-tight">
									{period.label}
								</td>
								<td className={num}>{has ? r.days : ""}</td>
								<td className="px-2 py-1.5 text-center font-semibold tabular-nums">
									{period.percentage}
								</td>
								<td className={num}>{has ? cellMoney(r.threshold) : ""}</td>
								<td className={num}>{has ? cellMoney(r.least) : ""}</td>
								<td className={num}>{has ? cellMoney(r.allocated) : ""}</td>
								<td className="px-2 py-1.5 text-center tabular-nums">
									{period.sbdRate.toFixed(3)}
								</td>
								<td className={cn(num, "font-medium")}>
									{has ? cellMoney(r.deduction) : ""}
								</td>
							</tr>
						);
					})}
					<tr>
						<td className="px-2 py-1.5 text-xs font-semibold leading-tight">
							{AT1_SCHEDULE_1_TOTAL_DAYS_LABEL}
						</td>
						<td className="px-2 py-1.5 text-right font-semibold tabular-nums">
							{table?.totalDays ?? ""}
						</td>
						<td colSpan={6} className="px-2 py-1.5" />
					</tr>
				</tbody>
			</table>
		</div>
	);
}

/**
 * Area A's table: four printed columns, one row per associated corporation.
 *
 * Was `PaperClassGrid`, which is the wrong primitive for a page-exact view of a
 * fixed four-column table — it headed the columns with FIELD NAMES and put "not
 * added" in every cell until the underlying array had rows. Schedules 13 and 17
 * had the same problem; this is the same fix.
 *
 * Column 044 is printed and editable NOWHERE: the page computes 045 from it
 * ("$200,000 X % in Col 044") and its own footnote says the split must match
 * federal Schedule 23, but this product collects the dollars at 045 directly.
 * Shown read-only rather than hidden, because a percentage column nobody can
 * fill is exactly the kind of gap that should be visible.
 *
 * The totals row is PRE-PRINTED on the page — a literal "100%" and "$200,000",
 * not a sum of whatever rows were entered. Rendering it as a computed total
 * would invite a preparer to reconcile against a figure the form asserts.
 */
function AgreementTable({
	control,
	disabled,
	footnotes,
}: {
	control: Control<AlbertaSbdValues>;
	disabled?: boolean;
	footnotes: Placement;
}) {
	const members = useWatch({ control, name: "associatedCorpAgreement" }) ?? [];
	/*
	 * The allocated dollars at 045, and the percentages the page derives from
	 * them at 044. `useWatch` already re-runs this on every keystroke, so the
	 * percentage column and the totals row move with the boxes above them —
	 * which is the point: the page's "Totals: 100%" is a CHECK, and a check
	 * that only updates on save is not one.
	 */
	const memberAllocated = (i: number): number => {
		const v = (members as { allocatedAmount?: unknown }[])[i]?.allocatedAmount;
		return typeof v === "number" && Number.isFinite(v) ? v : 0;
	};
	const allocatedTotal = members.reduce(
		(sum: number, _m: unknown, i: number) => sum + memberAllocated(i),
		0,
	);
	const overAllocated = allocatedTotal > AGREEMENT_BASE_AMOUNT;
	const { append, remove } = useFieldArray({
		control,
		name: "associatedCorpAgreement",
	});
	/** This column's own footnote marks, read off the field it renders. */
	const markFor = (line: string) =>
		AT1_SCHEDULE_1_FIELDS.find((f) => printed(f.line) === line)?.footnoteMarks;

	return (
		<div className="space-y-2 p-2">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="w-8 border-b px-1 pb-2" />
							{AT1_SCHEDULE_1_AGREEMENT_COLUMNS.map((col) => (
								<th
									key={col.line}
									className="border-b px-2 pb-2 text-left align-bottom font-medium"
								>
									<span className="block text-xs leading-tight">
										{col.heading}
										{/*
										 * The mark lives on the FIELD (044 carries the federal
										 * Schedule 23 rule, 045 the rounding rule), and this
										 * table replaces those leader rows — so without this
										 * the page's "**" and "***" have nothing to hang on.
										 */}
										{markFor(col.line)?.map((mark) => {
											const text = AT1_SCHEDULE_1_FOOTNOTES[mark];
											if (!text) return null;
											return (
												<TooltipWrapper key={mark} content={text} side="top">
													<sup className="ml-0.5 cursor-help font-mono">
														{footnotes.marks[mark] ?? "*"}
													</sup>
												</TooltipWrapper>
											);
										})}
									</span>
									<span className="mt-0.5 inline-block rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
										{col.line}
									</span>
								</th>
							))}
							<th className="w-10 border-b px-1 pb-2" />
						</tr>
					</thead>
					<tbody>
						{members.map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: the array index IS the row's printed occurrence — reordering changes which corporation files at which occurrence
							<tr key={`member-${i}`} className="border-b">
								<td className="px-1 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
									{i + 1}
								</td>
								{AT1_SCHEDULE_1_AGREEMENT_COLUMNS.map((col) => {
									const name = AGREEMENT_FIELD[col.line];
									if (!name) {
										/*
										 * 044 — "Percentage of the Business Limit", DERIVED.
										 *
										 * It was rendered as a permanent dash: the page computes
										 * 045 from this percentage ("$200,000 X % in Col 044")
										 * and this product collects the dollars at 045 instead,
										 * so the percentage was never stated anywhere. The cost
										 * was the check the page itself prints — the column
										 * totals 100%, which is what catches an over-allocated
										 * group, and it could not be made.
										 *
										 * Collecting it as a SECOND input would have been the
										 * wrong fix: the dollars and the percentage are one
										 * fact, and two boxes for one fact are free to disagree.
										 * Federal Schedule 23 takes the same view — it holds
										 * allocated dollars and derives `shareOfAllocated` from
										 * them — and this form's own footnote requires the two
										 * percentages to be the same. Deriving here makes that
										 * true by construction rather than by the preparer
										 * typing the same split twice.
										 */
										const share =
											allocatedTotal > 0
												? (memberAllocated(i) / allocatedTotal) * 100
												: undefined;
										return (
											<td
												key={col.line}
												className="px-2 py-1.5 text-center text-xs tabular-nums text-muted-foreground"
											>
												<TooltipWrapper
													content={
														share === undefined
															? "Derived from the allocated amounts at line 045 — enter those and this fills in. The page requires the split to match federal Schedule 23's."
															: `${formatPercent(share)} of the allocated total. Must match this corporation's percentage on federal Schedule 23.`
													}
													side="top"
												>
													<span className="cursor-help">
														{share === undefined ? "—" : formatPercent(share)}
													</span>
												</TooltipWrapper>
											</td>
										);
									}
									return (
										<td key={col.line} className="px-2 py-1.5">
											{col.kind === "money" ? (
												<PaperMoney
													control={control}
													name={`associatedCorpAgreement.${i}.${name}`}
													label={`${col.heading} — corporation ${i + 1}`}
													disabled={disabled}
												/>
											) : (
												<PaperText
													control={control}
													name={`associatedCorpAgreement.${i}.${name}`}
													label={`${col.heading} — corporation ${i + 1}`}
													disabled={disabled}
												/>
											)}
										</td>
									);
								})}
								<td className="px-1 py-1.5 text-right">
									<button
										type="button"
										onClick={() => remove(i)}
										disabled={disabled}
										className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
										aria-label={`Remove corporation ${i + 1}`}
									>
										✕
									</button>
								</td>
							</tr>
						))}
						{/*
						 * The page PRE-PRINTS this row: "Totals: 100% $200,000". They
						 * are what the agreement must add up to, not what the rows
						 * above happen to add up to — so they are shown as the page
						 * shows them and never recomputed.
						 */}
						<tr className="bg-muted/30">
							<td className="px-1 py-1.5" />
							<td className="px-2 py-1.5" />
							<td className="px-2 py-1.5 text-right font-semibold">
								{AT1_SCHEDULE_1_AGREEMENT_TOTALS_LABEL}
							</td>
							{AT1_SCHEDULE_1_AGREEMENT_COLUMNS.filter((c) => c.total).map(
								(col) => (
									<td
										key={col.line}
										className="px-2 py-1.5 text-center font-semibold tabular-nums"
									>
										{col.total}
									</td>
								),
							)}
							<td className="px-1 py-1.5" />
						</tr>
						{/*
						 * What the rows above ACTUALLY add up to, against the pre-printed
						 * requirement. The page states "100%" and "$200,000" as a rule the
						 * agreement must satisfy — and nothing in this product checked it,
						 * so a group could allocate 140% of its base amount across four
						 * corporations and every one of them would file a valid-looking
						 * Schedule 1 claiming more small business deduction than the group
						 * is entitled to.
						 *
						 * Shown, not enforced: over-allocation is a fact about the GROUP,
						 * and this return only ever sees its own rows. Telling the
						 * preparer is the honest thing this screen can do; refusing to
						 * save would block a return that may be mid-entry.
						 */}
						{members.length > 0 && (
							<tr className={overAllocated ? "bg-red-500/10" : undefined}>
								<td className="px-1 py-1.5" />
								<td className="px-2 py-1.5" />
								<td className="px-2 py-1.5 text-right text-xs text-muted-foreground">
									Entered
								</td>
								<td className="px-2 py-1.5 text-center text-xs tabular-nums">
									{allocatedTotal > 0 ? "100.00%" : "—"}
								</td>
								<td
									className={`px-2 py-1.5 text-center text-xs tabular-nums ${
										overAllocated
											? "font-semibold text-red-600 dark:text-red-400"
											: ""
									}`}
								>
									{formatSignedMoney(allocatedTotal)}
								</td>
								<td className="px-1 py-1.5" />
							</tr>
						)}
						{overAllocated && (
							<tr>
								<td
									colSpan={6}
									className="px-2 pb-2 text-xs text-red-600 dark:text-red-400"
								>
									The allocated amounts exceed the $
									{AGREEMENT_BASE_AMOUNT.toLocaleString("en-CA")} base amount
									the page allocates. The group's percentages cannot total more
									than 100%, and each corporation's share must match its
									percentage on federal Schedule 23.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between gap-3 px-1">
				<button
					type="button"
					onClick={() => append({})}
					disabled={disabled}
					className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
				>
					+ Add an associated corporation
				</button>
				{members.length === 0 && (
					<p className="text-xs text-muted-foreground">
						Complete this only when the AT1 jacket's line 001 is Yes.
					</p>
				)}
			</div>
		</div>
	);
}

/**
 * AREA B — "Determination of the Value for Line 015".
 *
 * Read-only, and it has to be: none of these eleven amounts has a line number,
 * so there is nothing to bind and nothing to file. It is rendered anyway
 * because line 015 feeds column C, which feeds the deduction, and for any
 * corporation with a short taxation year or an associated group over
 * $10,000,000 of taxable capital this cascade is the ONLY route to that figure.
 * Omitting it made line 015 look as though it came from nowhere.
 *
 * Not a `PaperSection` mapped from the layout's section list, because Area B is
 * not a section — a `FormSection` with no fields fails validation upstream. It
 * gets its own card from `AT1_SCHEDULE_1_AREA_B_TITLE`.
 *
 * The three `exitTo015` instructions are set apart rather than run in with the
 * steps. Area B is a decision tree with three places a preparer may stop, and
 * choosing the wrong one means claiming the wrong small business threshold —
 * which makes those three sentences the most important text in the box.
 */
/**
 * One lettered amount box in Area B.
 *
 * Three states, and the third is the one that matters: a figure, a blank the
 * page prints as a blank, or a blank this product cannot fill — which says so
 * on hover instead of looking identical to a computed zero. `days` is the only
 * non-money amount in the cascade, so it is the one exception to
 * `formatSignedMoney`.
 */
function AreaBAmount({
	value,
	reason,
}: {
	value?: string | number;
	reason?: string;
}) {
	const box =
		"h-7 w-28 shrink-0 rounded-md border px-2 text-right font-mono text-xs";
	if (reason) {
		return (
			<TooltipWrapper content={reason} side="top">
				<span
					className={`${box} flex cursor-help items-center justify-end border-dashed bg-muted/40 text-muted-foreground`}
				>
					—
				</span>
			</TooltipWrapper>
		);
	}
	if (value === undefined) {
		return <span className={`${box} block border-dashed bg-muted/40`} />;
	}
	return (
		<span
			className={`${box} flex items-center justify-end bg-muted/60 tabular-nums`}
		>
			{typeof value === "number" ? formatSignedMoney(value) : String(value)}
		</span>
	);
}

function AreaB({ computed }: { computed?: ComputedReturn }) {
	const amounts = new Map(
		(computed?.fields ?? []).flatMap((f) =>
			f.line.startsWith("sbdAreaB.")
				? [[f.line.slice("sbdAreaB.".length), f.value] as const]
				: [],
		),
	);
	// Absent entirely when the corporation cannot claim the deduction — there
	// is no base amount to determine, so the boxes stay as the page prints them.
	const hasWorking = amounts.size > 0;
	/*
	 * Which of the form's three B cases applies. The engine reports 3 only when
	 * the corporation is associated in the CURRENT year; (1) and (2) split on
	 * prior-year association, which is not collected, so neither is highlighted
	 * rather than one being guessed.
	 */
	const largeCorporationVariant = amounts.get("largeCorporationVariant");

	const areaBAmountFor = (step: {
		letter: string;
		heading?: string;
	}): { value?: string | number; reason?: string } => {
		if (isSupersededPre2022C(step))
			return {
				reason:
					"This return's taxation year starts after April 6, 2022, so the $90,000 divisor below applies instead.",
			};
		const reason = AREA_B_BLANK_REASON[step.letter];
		if (reason) return { reason };
		if (!hasWorking) return {};
		const key = AREA_B_AMOUNT[step.letter];
		const value = key ? amounts.get(key) : undefined;
		return typeof value === "number" || typeof value === "string"
			? { value }
			: {};
	};

	return (
		<div className="rounded-lg border bg-card">
			<div className="border-b bg-muted/40 px-4 py-2">
				<h3 className="text-sm font-semibold">{AT1_SCHEDULE_1_AREA_B_TITLE}</h3>
				<p className="mt-0.5 text-xs text-muted-foreground">
					None of these amounts is a numbered line, so none of them is
					transmitted — but the engine works the cascade through, and the result
					is line 015. Hover a blank box to see why it is blank.
				</p>
			</div>
			<div className="space-y-2 px-4 py-3 text-sm">
				{AT1_SCHEDULE_1_AREA_B_PREAMBLE.map((text) => (
					<p key={text} className="leading-snug text-muted-foreground">
						{text}
					</p>
				))}
			</div>
			<div className="divide-y border-t">
				{AT1_SCHEDULE_1_AREA_B_STEPS.map((step, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: two steps share the letter "(c)" and two share a label, so nothing else here is unique — and the order is the page's, fixed at generation
					<div key={`${step.letter}-${i}`}>
						{step.heading && (
							<p className="px-4 pb-1 pt-3 text-sm font-semibold leading-tight">
								{step.heading}
							</p>
						)}
						<div className="flex items-baseline gap-3 px-4 py-1.5 text-sm">
							<span className="min-w-0 flex-1 leading-snug">
								{step.label}
								{step.formula && (
									<span className="ml-2 font-mono text-xs text-muted-foreground">
										{step.formula}
									</span>
								)}
							</span>
							{/*
							 * The amount box the page prints. It used to be unconditionally
							 * blank — the engine computed the whole cascade and threw every
							 * intermediate away, so line 015 showed a "Computed" badge over
							 * an empty cell and this worksheet explained nothing.
							 */}
							<AreaBAmount {...areaBAmountFor(step)} />
							<span className="w-8 shrink-0 text-right font-mono text-xs text-muted-foreground">
								{step.letter}
							</span>
						</div>
						{step.exitTo015 && (
							<p className="px-4 pb-2 pt-0.5 text-sm font-semibold">
								{step.exitTo015}
							</p>
						)}
					</div>
				))}
			</div>
			{/*
			 * "Large Corporations" — what A and B mean in the two (c) formulas
			 * above. Without it those rows read "Small business threshold A X B /
			 * $11,250" against two letters defined nowhere on the page a reader
			 * can see.
			 *
			 * The letters carry their COMPUTED values now, on the right, in the
			 * same column as the lettered boxes above — but deliberately without
			 * a box outline, because TRA11723 gives them none. Every row from (a)
			 * to (k) has an amount rule printed beside it; these five have none.
			 * They are definitions, and the values are shown to make "(c) = A x
			 * (B / 90000)" followable, not to suggest there is something to fill.
			 */}
			<div className="space-y-1 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
				<p className="font-semibold text-foreground">Large Corporations</p>
				<p className="text-[11px] italic">
					Definitions, not boxes — the form prints no amount rule against A, B
					or the three cases below.
				</p>
				{AT1_SCHEDULE_1_AREA_B_LARGE_CORPORATIONS.map((text) => {
					const letter = /^A\b/.test(text)
						? "A"
						: /^B\b/.test(text)
							? "B"
							: undefined;
					const variant = text.trimStart().startsWith("(1)")
						? 1
						: text.trimStart().startsWith("(2)")
							? 2
							: text.trimStart().startsWith("(3)")
								? 3
								: undefined;
					const applies =
						variant !== undefined && largeCorporationVariant !== undefined
							? variant === largeCorporationVariant
							: undefined;
					return (
						<div key={text} className="flex items-baseline gap-3">
							<p
								className={`min-w-0 flex-1 leading-snug ${
									applies === true ? "font-semibold text-foreground" : ""
								}`}
							>
								{text}
								{applies === true && (
									<span className="ml-2 rounded bg-foreground/10 px-1 font-normal not-italic">
										applies to this return
									</span>
								)}
							</p>
							{letter !== undefined && (
								<span className="w-28 shrink-0 text-right font-mono tabular-nums text-foreground">
									{(() => {
										const key = AREA_B_AMOUNT[letter];
										const v = key ? amounts.get(key) : undefined;
										return typeof v === "number" ? formatSignedMoney(v) : "—";
									})()}
								</span>
							)}
						</div>
					);
				})}
				{largeCorporationVariant === undefined && (
					<p className="pt-1 text-[11px] leading-snug">
						Cases (1) and (2) differ only by whether the corporation was
						associated in the PREVIOUS taxation year, which this product does
						not collect — so neither is marked. Both give the same B.
					</p>
				)}
			</div>
		</div>
	);
}
