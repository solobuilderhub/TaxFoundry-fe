"use client";

import { type Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type {
	AlbertaIegValues,
	IegAgreementMember,
} from "../../../../_lib/return-input";
import { at1Money, parseAt1LineItemId } from "./at1-lines";
import {
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
} from "./components/paper-primitives";
import {
	AT1_SCHEDULE_29_ALLOCATION_COLUMNS,
	AT1_SCHEDULE_29_ALLOCATION_TOTALS_LABEL,
	AT1_SCHEDULE_29_BLOCK_HEADINGS,
	AT1_SCHEDULE_29_FIELDS,
	AT1_SCHEDULE_29_FOOTNOTES,
	AT1_SCHEDULE_29_SECTIONS,
	type PaperField,
} from "./generated/schedule29.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "029";

/**
 * The fields this schedule collects on its own slice, by 3-digit line.
 *
 * Most of Schedule 29 is computed (104/108/110/112/118/125/128/130 and every
 * page-3 total) or — for 114/116/126 — genuinely ambiguous which `group` row is
 * "this corporation", since that array holds every associated member and
 * nothing marks the claimant's own. Those stay read-only rather than guessed.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaIegValues>> = {
	"003": "federalAmount",
	"005": "albertaPortion",
	"007": "federalProxyAmount",
	"009": "albertaProxyAmount",
	"011": "iegReducingFederalExpenditure",
	"025": "repaymentOrContractPayment",
	"040": "primaryFieldCode",
	"102": "allocatedLimit",
	"132": "recapture",
	"200": "agreementLongestYearCan",
	"202": "agreementLongestYearBegin",
	"204": "agreementLongestYearEnd",
	"206": "agreementDaysInLongestYear",
};

/**
 * Page 3's allocation grid, by printed line → the field on a member row.
 *
 * Line 220 used to be absent here, and the column rendered permanently blank:
 * `IegAgreementMember` had no FBN field, so the page's FIRST numbered column
 * could not be filled. It is `fbn` now — see the contract's own comment, and
 * note that `name` beside it is NOT a line on this form (the page numbers ten
 * columns and none of them is a corporation name). `name` is ours, for the row
 * label, and `schedule29Values` must never file it at 220.
 */
const MEMBER_FIELD: Partial<Record<string, keyof IegAgreementMember>> = {
	"220": "fbn",
	"230": "albertaCan",
	"235": "currentTaxationYearEnd",
	"240": "allocatedExpenditureLimit",
	"245": "currentYearExpenditures",
	"250": "priorYear1",
	"260": "priorYear2",
	"265": "taxableCapitalPriorYear",
};

/**
 * The glyph the PAGE prints for each footnote, by index.
 *
 * Not derivable from the footnote list, and this is the reason: the asterisk
 * runs RESTART at every printed box. Page 2's expenditure-limit box runs "*"
 * then "**"; the grant-calculation box below it starts over at "*" and runs to
 * "****"; page 3 starts over again with its own "**". So index 0 and index 2
 * are both "*" on the same page, meaning two different things — a leap-year
 * rule and a Base Amount rule. Numbering them 1-13 instead would be legible but
 * would not be the page.
 *
 * Indices 7-12 are page 3's "Notes" block, which the page anchors by NAMING the
 * line ("Line 270: total must not exceed line 208") rather than with a glyph.
 * They are absent here deliberately and render as a "Note" marker instead; a
 * made-up asterisk would send a reader looking for one on the page.
 */
const PRINTED_MARK: Record<number, string> = {
	0: "*",
	1: "**",
	2: "*",
	3: "**",
	4: "***",
	5: "****",
	6: "**",
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
 * AT1 Schedule 29 paper Form View — the page's FIVE boxes, in order.
 *
 * ── What this used to be, and why the shape was wrong ───────────────────────
 *
 * Three flat leader-line sections, then "Agreement — group", "Agreement —
 * members" and "Agreement — totals". Three of those six headings are not on the
 * page; it prints "Alberta Innovation Employment Grant Agreement Among
 * Associated Corporations" and, below a rule, "Allocation of the Maximum
 * Expenditure Limit". The old view had to split one `agreement` section by a
 * hard-coded list of line numbers to get even that far, and said so in a
 * comment. Both boxes are real sections in the form definition now.
 *
 * Three more things the page has and this did not:
 *
 *   - **The Part I / Part II (a) / (b) headings.** Lines 112 and 125 are two
 *     mutually exclusive formulas for the same credit — one per return, chosen
 *     by whether the corporation is associated — and those headings are the only
 *     printed statement of it. Rendered as three rates in a list, the form reads
 *     as though all three apply.
 *   - **The totals are a ROW of the grid, not a list below it.** Lines
 *     270-320 are cells under the columns they sum, captioned only "Totals". As
 *     seven leader rows they were seven rows all captioned the same thing.
 *   - **Line 325 sits outside the grid**, and is not one of those totals.
 *
 * ── The line-220 column ─────────────────────────────────────────────────────
 *
 * It was a permanently blank column with a code comment explaining that the
 * product did not collect an FBN. The engine had supported it end to end the
 * whole time; only the contract field was missing. It is editable here now.
 */
export function Schedule29FormView({
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
	const iegControl = control as unknown as Control<AlbertaIegValues>;
	const resolveLine = buildResolveLine(computed);

	const sectionMeta = (id: string) =>
		AT1_SCHEDULE_29_SECTIONS.find((s) => s.id === id);
	const sectionFields = (id: string) =>
		AT1_SCHEDULE_29_FIELDS.filter((f) => f.section === id);

	/** Every line the allocation grid draws — a leader row would double them. */
	const gridLines = new Set(
		AT1_SCHEDULE_29_ALLOCATION_COLUMNS.flatMap((c) =>
			c.totalsLine ? [c.line, c.totalsLine] : [c.line],
		),
	);

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
			footnotes={AT1_SCHEDULE_29_FOOTNOTES}
			footnoteSymbol={(mark) => PRINTED_MARK[mark]}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			control={iegControl}
			resolveLine={resolveLine}
			disabled={disabled}
		/>
	);

	/** A row, preceded by any heading the page prints immediately above it. */
	const rowWithHeadings = (f: PaperField) => {
		const headings = AT1_SCHEDULE_29_BLOCK_HEADINGS.filter(
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
					</p>
				))}
				{row(f)}
			</div>
		);
	};

	const eligible = sectionMeta("eligible");

	return (
		<div className="space-y-4">
			{/*
			 * The NOTE the page prints above the first heading: which federal line
			 * to use turns on a date (T661 line 559 before 2024-12-16, line 557
			 * after), and this is the only place the form says so. Outside the card
			 * because the page sets it in the identification box above, not under
			 * the heading — the same treatment Schedule 20's medicine-gift
			 * paragraph gets.
			 */}
			{eligible?.printedBefore && (
				<p className="px-1 text-sm font-medium text-muted-foreground">
					{eligible.printedBefore}
				</p>
			)}
			<PaperSection
				title={eligible?.title ?? "Eligible Expenditures for IEG Purposes"}
				description={eligible?.description}
				formId="AT1SCH29"
			>
				{sectionFields("eligible")
					.filter((f) => printed(f.line) !== "040")
					.map(row)}
			</PaperSection>

			{/*
			 * Line 040 is in a box of its OWN on page 1 — below the eligible
			 * box, with no heading at all. `PaperSection` requires a title and
			 * inventing one is how a phantom heading got into Schedule 18, so
			 * this is the card without a header rather than a card called
			 * something the page never says.
			 */}
			<div className="divide-y rounded-lg border bg-card">
				{sectionFields("eligible")
					.filter((f) => printed(f.line) === "040")
					.map(row)}
			</div>

			{(["limit", "grant", "agreement"] as const).map((id) => {
				const meta = sectionMeta(id);
				if (!meta) return null;
				return (
					<PaperSection
						key={id}
						title={meta.title}
						description={meta.description}
					>
						{sectionFields(id).map(rowWithHeadings)}
					</PaperSection>
				);
			})}

			<PaperSection
				title={sectionMeta("allocation")?.title ?? "Allocation"}
				description={sectionMeta("allocation")?.description}
			>
				<AllocationGrid
					control={iegControl}
					disabled={disabled}
					computed={computed}
				/>
				{/*
				 * 325 is printed BELOW the grid, outside it — the claiming
				 * corporation's own line 268 restated, and the figure line 125
				 * actually draws on. Not a Totals cell, so not in the table.
				 */}
				{sectionFields("allocation")
					.filter((f) => !gridLines.has(printed(f.line)))
					.map(row)}
			</PaperSection>

			<PaperFootnotes notes={AT1_SCHEDULE_29_FOOTNOTES} />
		</div>
	);
}

/**
 * Page 3's allocation grid: ten columns per member, then the Totals row.
 *
 * One row per `agreementMembers` entry, added and removed here — a plain 1:1
 * array, unlike Schedule 17's type-matched grid, so a row's array index IS its
 * occurrence on the form. The claiming corporation goes first; that is the
 * page's own instruction in this box's heading, and it is load-bearing (row 1's
 * line 268 is what becomes line 325 and switches the grant to the associated
 * formula).
 *
 * The Totals row reads the last computed return rather than summing the visible
 * cells. Lines 310 and 320 are not sums at all — 310 is the page's own
 * X − ((Y + Z) / 2), and 267/268 are floored at nil per member — so adding up
 * the column would show a number the return does not file.
 */
function AllocationGrid({
	control,
	disabled,
	computed,
}: {
	control: Control<AlbertaIegValues>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const members = useWatch({ control, name: "agreementMembers" }) ?? [];
	const { append, remove } = useFieldArray({
		control,
		name: "agreementMembers",
	});

	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === SCHEDULE_ID,
	);
	const filedByFieldOccurrence = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const p = parseAt1LineItemId(v.lineItemId);
			return p ? [[`${p.field}-${p.occurrence}`, v.value] as const] : [];
		}),
	);

	/** Where the page sets "Totals": the cell just left of the first sum. */
	const labelColumnIndex =
		AT1_SCHEDULE_29_ALLOCATION_COLUMNS.findIndex((c) => c.totalsLine) - 1;

	return (
		<div className="space-y-2 p-2">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="w-8 border-b px-1 pb-2" />
							{AT1_SCHEDULE_29_ALLOCATION_COLUMNS.map((col) => (
								<th
									key={col.line}
									className="min-w-[10rem] border-b px-2 pb-2 text-left align-bottom font-medium"
								>
									<span className="block leading-tight">{col.heading}</span>
									<span className="mt-0.5 block w-fit rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
										{col.line}
									</span>
								</th>
							))}
							<th className="w-10 border-b px-1 pb-2" />
						</tr>
					</thead>
					<tbody>
						{members.map((m, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: the array index IS the row's printed occurrence — reordering would change which member files at which occurrence
							<tr key={`member-${i}`} className="border-b">
								<td className="px-1 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
									{i + 1}
								</td>
								{AT1_SCHEDULE_29_ALLOCATION_COLUMNS.map((col) => {
									const name = MEMBER_FIELD[col.line];
									if (!name) {
										/*
										 * 267 and 268 — the page derives both from the
										 * row's own entries, so they are shown, never
										 * typed. Read from the last computed return at
										 * this row's occurrence.
										 */
										const value = filedByFieldOccurrence.get(
											`${col.line}-${i + 1}`,
										);
										return (
											<td
												key={col.line}
												className="px-2 py-1.5 text-right tabular-nums text-muted-foreground"
											>
												{typeof value === "number"
													? at1Money(value)
													: (value ?? "—")}
											</td>
										);
									}
									return (
										<td key={col.line} className="px-2 py-1.5">
											<Controller
												control={control}
												name={`agreementMembers.${i}.${name}` as const}
												render={({ field }) =>
													col.kind === "money" ? (
														<input
															type="number"
															inputMode="decimal"
															step="any"
															disabled={disabled}
															aria-label={`${col.heading} — member ${i + 1}`}
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
															type={col.kind === "date" ? "date" : "text"}
															disabled={disabled}
															aria-label={`${col.heading} — member ${i + 1}`}
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
										aria-label={`Remove member ${i + 1}`}
									>
										✕
									</button>
								</td>
							</tr>
						))}
						{/* The Totals row, printed inside the grid with its own lines. */}
						<tr className="bg-muted/30">
							<td className="px-1 py-1.5" />
							{AT1_SCHEDULE_29_ALLOCATION_COLUMNS.map((col, i) => {
								if (!col.totalsLine) {
									// Three columns are not totalled — there is no sum of a
									// business number, an account number or a year end. The
									// page prints its "Totals" label in the last of them,
									// immediately left of the first figure it sums.
									return (
										<td
											key={col.line}
											className="px-2 py-1.5 text-right font-semibold"
										>
											{i === labelColumnIndex
												? AT1_SCHEDULE_29_ALLOCATION_TOTALS_LABEL
												: null}
										</td>
									);
								}
								const value = filedByFieldOccurrence.get(
									`${col.totalsLine}-1`,
								);
								return (
									<td key={col.line} className="px-2 py-1.5">
										<div className="flex items-center gap-1.5">
											<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
												{col.totalsLine}
											</span>
											<span className="flex-1 text-right tabular-nums text-muted-foreground">
												{typeof value === "number" ? at1Money(value) : "—"}
											</span>
										</div>
									</td>
								);
							})}
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
						Leave empty for a non-associated claim — the grant then uses line
						112, not line 125.
					</p>
				)}
			</div>
			{/*
			 * The page's own "Notes" block, printed at the foot of this grid. It
			 * anchors each entry by NAMING a line rather than with an asterisk,
			 * which is why these are not rendered as marks on the column headings
			 * — see `PRINTED_MARK`. Indices 7-12 of the footnote list; sliced from
			 * the marks the grid's own fields carry rather than hard-coded, so
			 * inserting a footnote upstream cannot silently drop one here.
			 */}
			<PrintedNotes />
		</div>
	);
}

/** Page 3's "Notes" block — the entries the page anchors by naming a line. */
function PrintedNotes() {
	const gridFieldLines = new Set(
		AT1_SCHEDULE_29_ALLOCATION_COLUMNS.flatMap((c) =>
			c.totalsLine ? [c.line, c.totalsLine] : [c.line],
		),
	);
	const marks = [
		...new Set(
			AT1_SCHEDULE_29_FIELDS.filter((f) =>
				gridFieldLines.has(printed(f.line)),
			).flatMap((f) => [...(f.footnoteMarks ?? [])]),
		),
	].sort((a, b) => a - b);
	if (marks.length === 0) return null;
	return (
		<div className="border-t px-2 pt-2">
			<p className="mb-1 text-xs font-semibold text-muted-foreground">Notes</p>
			<ul className="space-y-0.5 text-xs text-muted-foreground">
				{marks.map((mark) => (
					<li key={mark}>{AT1_SCHEDULE_29_FOOTNOTES[mark]}</li>
				))}
			</ul>
		</div>
	);
}

