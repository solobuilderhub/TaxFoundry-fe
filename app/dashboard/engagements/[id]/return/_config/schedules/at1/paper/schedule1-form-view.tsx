"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import { type Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaSbdValues } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
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

const printed = (line: string) => parseAt1LineItemId(line)?.field ?? line;

const CELL =
	"h-8 w-full rounded-md border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50";

function buildResolveLine(computed: ComputedReturn | undefined): ResolveLine {
	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === SCHEDULE_ID,
	);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	return (line: string): LineValue => {
		const field = printed(line);
		const ownName = OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		return {
			editable: false,
			value: filedByField.get(field) as string | number | undefined,
		};
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
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const sbdControl = control as unknown as Control<AlbertaSbdValues>;
	const resolveLine = buildResolveLine(computed);
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
							<p className="px-4 py-2 text-sm font-semibold">{m.printedAfter}</p>
						)}
						{notesFor(id)}
					</PaperSection>
				);
			})}

			<PaperSection
				title={meta("calculation")?.title ?? "Calculation"}
				description={meta("calculation")?.description}
			>
				<CalculationTable footnotes={footnotes} />
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
				{AT1_SCHEDULE_1_BLOCK_HEADINGS.filter(
					(h) => h.aboveLine === "041",
				).map((h) => (
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
				))}
				<AgreementTable
					control={sbdControl}
					disabled={disabled}
					footnotes={footnotes}
				/>
				{notesFor("agreement")}
			</PaperSection>

			<AreaB />

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

/**
 * "Calculation of the Alberta Small Business Deduction" — read-only, and
 * honestly so.
 *
 * Seven columns and six rate periods, of which the page itself pre-prints two
 * columns: B ("250%" on every row) and F (the SBD rate per period). The other
 * five are blank on the paper form and blank here, because this engine does not
 * compute them: `computeAlbertaTax` reaches jacket line 070 as a residual
 * (`basicTax − albertaTaxPayable`) rather than day-weighting through these
 * columns, and column C needs line 015, which needs page 2's Area B, which is
 * numbered only (a)-(k) and so has nothing to file against.
 *
 * Showing the table empty is the point. A preparer checking a return against
 * the form needs to see that these columns exist and that this product has not
 * filled them; a table omitted altogether says the form does not have one.
 */
function CalculationTable({ footnotes }: { footnotes: Placement }) {
	return (
		<div className="overflow-x-auto p-2">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr>
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
					{AT1_SCHEDULE_1_RATE_PERIODS.map((period) => (
						<tr key={period.label} className="border-b">
							<td className="px-2 py-1.5 text-xs leading-tight">
								{period.label}
							</td>
							<td className="px-2 py-1.5 text-center font-semibold tabular-nums">
								{period.percentage}
							</td>
							{/* C, D, E — blank on the page and not computed here. */}
							<td className="px-2 py-1.5" />
							<td className="px-2 py-1.5" />
							<td className="px-2 py-1.5" />
							<td className="px-2 py-1.5 text-center tabular-nums">
								{period.sbdRate.toFixed(3)}
							</td>
							<td className="px-2 py-1.5" />
						</tr>
					))}
					<tr>
						<td className="px-2 py-1.5 text-xs font-semibold leading-tight">
							{AT1_SCHEDULE_1_TOTAL_DAYS_LABEL}
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
										return (
											<td
												key={col.line}
												className="px-2 py-1.5 text-center text-xs text-muted-foreground"
											>
												<TooltipWrapper
													content="Printed on the form, but not collected in this product — the allocated dollars are entered at line 045 directly. See the line's note."
													side="top"
												>
													<span className="cursor-help">—</span>
												</TooltipWrapper>
											</td>
										);
									}
									return (
										<td key={col.line} className="px-2 py-1.5">
											<Controller
												control={control}
												name={
													`associatedCorpAgreement.${i}.${name}` as `associatedCorpAgreement.${number}.name`
												}
												render={({ field }) =>
													col.kind === "money" ? (
														<input
															type="number"
															inputMode="decimal"
															step="any"
															disabled={disabled}
															aria-label={`${col.heading} — corporation ${i + 1}`}
															className={`${CELL} text-right tabular-nums`}
															value={(field.value as number | undefined) ?? ""}
															onChange={(e) =>
																field.onChange(
																	e.target.value === ""
																		? undefined
																		: Number(e.target.value),
																)
															}
															onBlur={field.onBlur}
														/>
													) : (
														<input
															type="text"
															disabled={disabled}
															aria-label={`${col.heading} — corporation ${i + 1}`}
															className={CELL}
															value={(field.value as string | undefined) ?? ""}
															onChange={(e) =>
																field.onChange(e.target.value || undefined)
															}
															onBlur={field.onBlur}
														/>
													)
												}
											/>
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
function AreaB() {
	return (
		<div className="rounded-lg border bg-card">
			<div className="border-b bg-muted/40 px-4 py-2">
				<h3 className="text-sm font-semibold">{AT1_SCHEDULE_1_AREA_B_TITLE}</h3>
				<p className="mt-0.5 text-xs text-muted-foreground">
					Worked on paper — none of these amounts is a numbered line, so this
					product neither collects nor files them. The result goes in line 015.
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
							{/* The amount box the page prints — blank, because nothing fills it. */}
							<span className="h-7 w-28 shrink-0 rounded-md border border-dashed bg-muted/40" />
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
			 */}
			<div className="space-y-1 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
				<p className="font-semibold text-foreground">Large Corporations</p>
				{AT1_SCHEDULE_1_AREA_B_LARGE_CORPORATIONS.map((text) => (
					<p key={text} className="leading-snug">
						{text}
					</p>
				))}
			</div>
		</div>
	);
}
