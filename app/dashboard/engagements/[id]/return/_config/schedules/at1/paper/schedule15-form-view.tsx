"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import {
	type Control,
	Controller,
	useFieldArray,
	useWatch,
} from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaResourceDeductions15Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	formatSignedMoney,
	PaperFootnotes,
	PaperSection,
	readFootnotePlacement,
} from "./components/paper-primitives";
import {
	AT1_SCHEDULE_15_AREAS,
	AT1_SCHEDULE_15_CLOSING_INSTRUCTION,
	AT1_SCHEDULE_15_FOOTNOTE_PLACEMENT,
	AT1_SCHEDULE_15_FOOTNOTES,
	AT1_SCHEDULE_15_PER_COUNTRY,
	AT1_SCHEDULE_15_SECTIONS,
	type PerCountryColumn,
	type PerCountryTable,
	type ResourceContinuityArea,
	type ResourceContinuityRow,
} from "./generated/schedule15.layout";

const SCHEDULE_ID = "015";

/**
 * Printed line → the path on `ri.albertaResourceDeductions15` that holds the
 * ALBERTA figure for that cell.
 *
 * Not every printed line is a preparer entry, and the three cases differ:
 *
 *   - most cells reconcile, so the AT1 line is the `alberta<Name>` half of a
 *     federal/Alberta pair and the `federal<Name>` half is only a default;
 *   - a line the spec permits no Alberta override on (current-year expenses,
 *     government assistance, the renunciations) has only a `federal<Name>`
 *     field, which then IS the AT1 line;
 *   - each area's one discretionary claim is `claimed`.
 *
 * Closing balances are absent deliberately — they are arithmetic, and the
 * layout types them `computed`, so they resolve from the last computed return
 * instead.
 */
const CELL_FIELD: Readonly<Record<string, string>> = {
	// AREA A — regular, then successor.
	"001": "edaRegular.albertaOpeningBalance",
	"003": "edaRegular.albertaAmalgamationTransfer",
	"005": "edaRegular.albertaSaleTransfer",
	"007": "edaRegular.albertaRegulation1201Claim",
	"011": "edaSuccessor.albertaOpeningBalance",
	"013": "edaSuccessor.albertaAmalgamationTransfer",
	"015": "edaSuccessor.albertaOtherTransfer",
	"017": "edaSuccessor.albertaSaleTransfer",
	"019": "edaSuccessor.albertaRegulation1202Claim",
	// AREA B — one column, and its claim has no federal default at all.
	"023": "cmedb.albertaOpeningBalance",
	"025": "cmedb.albertaAmalgamationTransfer",
	"027": "cmedb.albertaOtherTransfer",
	"029": "cmedb.albertaDisposalTransfer",
	"031": "cmedb.claimed",
	// AREA C — regular.
	"041": "ceeRegular.albertaOpeningBalance",
	"043": "ceeRegular.federalCurrentYearExpenses",
	"044": "ceeRegular.federalLookBackExpenses",
	"045": "ceeRegular.federalReclassifiedFromCde",
	"047": "ceeRegular.albertaAmalgamationTransfer",
	"049": "ceeRegular.federalRenewableConservationExpenses",
	"051": "ceeRegular.albertaOtherAdditions",
	"053": "ceeRegular.federalGovernmentAssistance",
	"055": "ceeRegular.albertaOtherDeductions",
	"058": "ceeRegular.federalRenouncedFlowThrough",
	"059": "ceeRegular.albertaTransferredToSuccessor",
	"060": "ceeRegular.federalRenouncedLookBack",
	"061": "ceeRegular.claimed",
	// AREA C — successor.
	"064": "ceeSuccessor.albertaOpeningBalance",
	"065": "ceeSuccessor.federalReclassifiedFromCde",
	"067": "ceeSuccessor.albertaAmalgamationTransfer",
	"069": "ceeSuccessor.albertaOtherTransfer",
	"077": "ceeSuccessor.albertaOtherDeductions",
	"079": "ceeSuccessor.albertaTransferredToSuccessor",
	"081": "ceeSuccessor.claimed",
	// AREA D — regular. 105 is the cross-area credit-balance line; the engine
	// derives it from Area E's negative subtotal and overrides what is typed,
	// so the box is here but the field's note says it may not survive compute.
	"091": "cdeRegular.albertaOpeningBalance",
	"093": "cdeRegular.federalCurrentYearExpenses",
	"094": "cdeRegular.federalLookBackExpenses",
	"095": "cdeRegular.albertaAmalgamationTransfer",
	"097": "cdeRegular.albertaOtherAdditions",
	"099": "cdeRegular.federalReclassifiedFromCee",
	"101": "cdeRegular.federalGovernmentAssistance",
	"103": "cdeRegular.albertaReceivableOnDisposition",
	"105": "cdeRegular.albertaCreditBalanceInCogpePool",
	"107": "cdeRegular.albertaOtherDeductions",
	"110": "cdeRegular.federalRenouncedFlowThrough",
	"111": "cdeRegular.albertaTransferredToSuccessor",
	"112": "cdeRegular.federalRenouncedLookBack",
	"115": "cdeRegular.claimed",
	// AREA D — successor.
	"119": "cdeSuccessor.albertaOpeningBalance",
	"121": "cdeSuccessor.albertaAmalgamationTransfer",
	"123": "cdeSuccessor.albertaOtherTransfer",
	"127": "cdeSuccessor.federalReclassifiedFromCee",
	"133": "cdeSuccessor.albertaCreditBalanceInCogpePool",
	"135": "cdeSuccessor.albertaOtherDeductions",
	"137": "cdeSuccessor.albertaTransferredToSuccessor",
	"141": "cdeSuccessor.claimed",
	// AREA E — regular.
	"151": "ccogpeRegular.albertaOpeningBalance",
	"153": "ccogpeRegular.federalCurrentYearExpenses",
	"155": "ccogpeRegular.albertaAmalgamationTransfer",
	"157": "ccogpeRegular.albertaOtherAdditions",
	"159": "ccogpeRegular.albertaReceivableOnDisposition",
	"161": "ccogpeRegular.federalGovernmentAssistance",
	"165": "ccogpeRegular.albertaTransferredToSuccessor",
	"167": "ccogpeRegular.albertaOtherDeductions",
	"169": "ccogpeRegular.claimed",
	// AREA E — successor.
	"173": "ccogpeSuccessor.albertaOpeningBalance",
	"175": "ccogpeSuccessor.albertaAmalgamationTransfer",
	"177": "ccogpeSuccessor.albertaOtherTransfer",
	"181": "ccogpeSuccessor.albertaReceivableOnDisposition",
	"185": "ccogpeSuccessor.albertaTransferredToSuccessor",
	"187": "ccogpeSuccessor.albertaOtherDeductions",
	"189": "ccogpeSuccessor.claimed",
	// AREA F — regular, then successor. 231/233 are the income box the page
	// sets apart below the footnotes; both cap a claim rather than move a pool.
	"201": "fedeRegular.albertaOpeningBalance",
	"205": "fedeRegular.albertaAmalgamationTransfer",
	"207": "fedeRegular.albertaOtherDeductions",
	"209": "fedeRegular.claimed",
	"231": "fedeRegular.federalForeignResourceIncome",
	"213": "fedeSuccessor.albertaOpeningBalance",
	"215": "fedeSuccessor.albertaAmalgamationTransfer",
	"217": "fedeSuccessor.albertaOtherTransfer",
	"219": "fedeSuccessor.albertaOtherDeductions",
	"221": "fedeSuccessor.claimed",
	"233": "fedeSuccessor.federalForeignResourceIncome",
};

const printed = (line: string) => parseAt1LineItemId(line)?.field ?? line;

const CELL =
	"h-8 w-full rounded-md border border-input bg-transparent px-1.5 text-right text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50";

/**
 * AT1 Schedule 15 paper Form View.
 *
 * ── What this used to be ────────────────────────────────────────────────────
 *
 * Four `PaperClassGrid`s of country codes, and a description admitting the
 * rest: "the eight resource-expense pools this schedule actually computes …
 * have no numbered paper-view lines yet". The form definition behind it
 * declared five lines out of roughly a hundred and thirty, so there was
 * nothing else to render — the guided editor collected the whole schedule
 * while the paper view showed four columns of it.
 *
 * ── What it is now ──────────────────────────────────────────────────────────
 *
 * Pages 1 and 2 as the page prints them: Areas A, B and C as two-column
 * continuity tables, from `AT1_SCHEDULE_15_AREAS`. Three things in that data
 * do real work here and none of them could come from a flat field list:
 *
 *   - **Shaded cells render shaded**, not as empty boxes. Regulation 1201 is a
 *     regular-expenses claim and 1202(2) a successor one, and the page shades
 *     each column out on the other's row to say so. Nine open boxes in Area A,
 *     not sixteen.
 *   - **"Amount Available" rows** appear with a box in both columns and no
 *     line chip, because that is how the page prints them — and each is where
 *     its area's negative-balance footnote is anchored.
 *   - **Printed order**, which is not line order: Area C prints 059 above 058.
 *
 * Pages 3 to 6 (Areas D, E, F and the per-country G, H) are not transcribed
 * yet; the four country-code grids are kept below, labelled as the partial
 * thing they are, so nothing that used to be visible has disappeared.
 */
export function Schedule15FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const s15Control =
		control as unknown as Control<AlbertaResourceDeductions15Values>;
	const footnotes = readFootnotePlacement(
		AT1_SCHEDULE_15_FOOTNOTES,
		AT1_SCHEDULE_15_FOOTNOTE_PLACEMENT,
	);
	const filed = new Map(
		(
			computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID)
				?.values ?? []
		).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	const meta = (id: string) =>
		AT1_SCHEDULE_15_SECTIONS.find((s) => s.id === id);

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_15_AREAS.map((area, i) => {
				const section = meta(area.section);
				return (
					<div key={area.section} className="space-y-2">
						{section?.printedBefore && (
							<p className="px-1 text-sm font-medium text-muted-foreground">
								{section.printedBefore}
							</p>
						)}
						<PaperSection
							title={area.title}
							description={section?.description}
							formId={i === 0 ? "AT1SCH15" : undefined}
						>
							{/*
							 * The line the page prints under the box heading. Area F's
							 * is the only one so far, and it is routing rather than
							 * description: an expense in respect of a country belongs
							 * in Area G or H, and no caption in this box says so.
							 */}
							{area.subtitle && (
								<p className="px-4 pb-1 pt-3 text-sm font-medium leading-snug">
									{area.subtitle}
								</p>
							)}
							<ContinuityTable
								area={area}
								control={s15Control}
								disabled={disabled}
								filed={filed}
								markFor={(n) => footnotes.marks[n]}
							/>
							{/*
							 * The bold instruction under the table. Page 1's is printed
							 * beneath Area B and totals lines from BOTH boxes — 007 and
							 * 019 are Area A's two claims — which is why it hangs off
							 * the area that prints it rather than the area it sums.
							 */}
							{area.carryForward && (
								<p className="px-4 py-2 text-sm font-semibold italic">
									{area.carryForward}
								</p>
							)}
							<PaperFootnotes
								notes={AT1_SCHEDULE_15_FOOTNOTES}
								only={footnotes.forSection(area.section)}
								marks={footnotes.marks}
							/>
							{/*
							 * Below the footnotes, where the page puts it. Area F's
							 * foreign-source resource income (231 / 233) is boxed on its
							 * own with the column headings repeated, because it is not a
							 * continuity row — it is the income that CAPS the claim.
							 */}
							<SeparateBox
								area={area}
								control={s15Control}
								disabled={disabled}
								filed={filed}
							/>
						</PaperSection>
					</div>
				);
			})}

			<PerCountryAreas
				control={s15Control}
				disabled={disabled}
				filed={filed}
				footnotes={footnotes}
			/>

			{/* The bold sentence at the very foot of page 6, below Area H. */}
			<ClosingInstruction />

			<PaperFootnotes
				notes={AT1_SCHEDULE_15_FOOTNOTES}
				only={footnotes.unplaced}
				marks={footnotes.marks}
			/>
		</div>
	);
}

/**
 * The rows the page prints in a box of its own, below the area's footnotes.
 *
 * One row on the whole schedule: Area F's "Foreign-source resource income"
 * (231 / 233). Kept out of the continuity table above rather than appended to
 * it, because it is not part of the continuity — it neither adds to nor
 * deducts from the pool, it is the income figure the claim at 209 and 221 is
 * capped by, and the page separates it for exactly that reason.
 */
function SeparateBox({
	area,
	control,
	disabled,
	filed,
}: {
	area: ResourceContinuityArea;
	control: Control<AlbertaResourceDeductions15Values>;
	disabled?: boolean;
	filed: ReadonlyMap<string, string | number>;
}) {
	const rows = area.rows.filter((r) => r.separateBox);
	if (rows.length === 0) return null;
	return (
		<div className="border-t px-2 py-2">
			<table className="w-full border-collapse text-sm">
				{area.columnHeadings && (
					<thead>
						<tr>
							<th className="border-b px-2 pb-2" />
							{area.columnHeadings.map((heading) => (
								<th
									key={heading}
									className="w-[28%] border-b px-2 pb-2 text-center text-xs font-medium"
								>
									{heading}
								</th>
							))}
						</tr>
					</thead>
				)}
				<tbody>
					{rows.map((row) => (
						<tr key={row.label} className="align-middle">
							<td className="px-2 py-1.5 text-xs leading-tight">{row.label}</td>
							<Cell
								row={row}
								column="regular"
								control={control}
								disabled={disabled}
								filed={filed}
							/>
							<Cell
								row={row}
								column="successor"
								control={control}
								disabled={disabled}
								filed={filed}
							/>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/**
 * One area's table: labelled rows, one or two columns, shaded cells where the
 * page shades them.
 *
 * Area B passes no `columnHeadings` and gets one unheaded column, which is the
 * page — that pool has no successor side, and heading its single column
 * "Regular Expenses ($)" would draw a distinction the form does not.
 *
 * `separateBox` rows are excluded: the page prints those below this area's
 * footnotes, so {@link SeparateBox} renders them there.
 */
function ContinuityTable({
	area,
	control,
	disabled,
	filed,
	markFor,
}: {
	area: ResourceContinuityArea;
	control: Control<AlbertaResourceDeductions15Values>;
	disabled?: boolean;
	filed: ReadonlyMap<string, string | number>;
	markFor: (footnote: number) => string | undefined;
}) {
	const twoColumn = area.columnHeadings !== undefined;
	return (
		<div className="overflow-x-auto p-2">
			<table className="w-full border-collapse text-sm">
				{twoColumn && (
					<thead>
						<tr>
							<th className="border-b px-2 pb-2" />
							{area.columnHeadings?.map((heading) => (
								<th
									key={heading}
									className="w-[28%] border-b px-2 pb-2 text-center text-xs font-medium"
								>
									{heading}
								</th>
							))}
						</tr>
					</thead>
				)}
				<tbody>
					{area.rows
						.filter((row) => !row.separateBox)
						.map((row) => (
						<tr key={row.label} className="border-b align-middle">
							<td className="px-2 py-1.5 text-xs leading-tight">
								{row.label}
								{row.footnoteMarks?.map((n) => {
									const text = AT1_SCHEDULE_15_FOOTNOTES[n];
									if (!text) return null;
									return (
										<TooltipWrapper key={n} content={text} side="top">
											<sup className="ml-0.5 cursor-help font-mono text-muted-foreground">
												{markFor(n) ?? "*"}
											</sup>
										</TooltipWrapper>
									);
								})}
							</td>
							<Cell
								row={row}
								column="regular"
								control={control}
								disabled={disabled}
								filed={filed}
							/>
							{twoColumn && (
								<Cell
									row={row}
									column="successor"
									control={control}
									disabled={disabled}
									filed={filed}
								/>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/**
 * One cell, in one of four states the page distinguishes and a naive renderer
 * does not:
 *
 *   SHADED      the quantity does not exist on this side of the pool. Filled
 *               grey, no box, no line chip — the page's own way of saying a
 *               figure here would be wrong, which an empty box does not say.
 *   UNNUMBERED  an "Amount Available" subtotal: a box the page prints and
 *               numbers nowhere. Dashed and empty, with no chip.
 *   COMPUTED    a closing balance. Read-only, showing the last computed
 *               return's figure.
 *   ENTERED     a real editable box, bound to the guided editor's own field so
 *               the two views write one value.
 */
function Cell({
	row,
	column,
	control,
	disabled,
	filed,
}: {
	row: ResourceContinuityRow;
	column: "regular" | "successor";
	control: Control<AlbertaResourceDeductions15Values>;
	disabled?: boolean;
	filed: ReadonlyMap<string, string | number>;
}) {
	if (row.shaded?.includes(column)) {
		return (
			<td className="px-2 py-1.5">
				<TooltipWrapper
					content="Shaded on the printed form: this quantity does not exist on this side of the pool, so there is no box to fill in."
					side="top"
				>
					<div className="h-8 w-full cursor-help rounded-md bg-muted-foreground/25" />
				</TooltipWrapper>
			</td>
		);
	}
	if (row.unnumbered) {
		return (
			<td className="px-2 py-1.5">
				<TooltipWrapper
					content="Printed on the form with no line number in either column — a subtotal TRA does not collect. The area's negative-balance rule is anchored here."
					side="top"
				>
					<div className="h-8 w-full cursor-help rounded-md border border-dashed bg-muted/30" />
				</TooltipWrapper>
			</td>
		);
	}

	const line = column === "regular" ? row.regular : row.successor;
	if (!line) return <td className="px-2 py-1.5" />;

	const name = CELL_FIELD[line];
	const chip = (
		<span className="shrink-0 rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground">
			{line}
		</span>
	);

	if (!name) {
		// A closing balance, or any line the editor does not collect. Read-only
		// from the last computed return rather than an editable box nothing saves.
		const value = filed.get(line);
		return (
			<td className="px-2 py-1.5">
				<div className="flex items-center gap-1.5">
					{chip}
					<span className="h-8 flex-1 rounded-md border border-dashed bg-muted/40 px-1.5 text-right text-sm leading-8 tabular-nums">
						{typeof value === "number" ? formatSignedMoney(value) : ""}
					</span>
				</div>
			</td>
		);
	}

	return (
		<td className="px-2 py-1.5">
			<div className="flex items-center gap-1.5">
				{chip}
				<Controller
					control={control}
					name={name as "daysInTaxYear"}
					render={({ field }) => (
						<input
							type="number"
							inputMode="decimal"
							step="any"
							disabled={disabled}
							aria-label={`${row.label} — line ${line}`}
							className={CELL}
							value={(field.value as number | undefined) ?? ""}
							onChange={(e) =>
								field.onChange(
									e.target.value === "" ? undefined : Number(e.target.value),
								)
							}
							onBlur={field.onBlur}
						/>
					)}
				/>
			</div>
		</td>
	);
}

/**
 * Printed line → the field on one per-country ROW that holds the AT1 figure.
 *
 * Same three cases as the continuity cells — an `alberta<Name>` half of a
 * reconciled pair, a `federal<Name>` where the spec permits no override, or
 * `claimed`. The closing-balance columns (255 / 275 / 295 / 315) are absent
 * because the page computes them, and the four "Amount available" columns are
 * absent from the layout itself: they have no line at all.
 */
const COUNTRY_CELL_FIELD: Readonly<Record<string, string>> = {
	// AREA G — regular (A-H), then successor (J-Q).
	"241": "countryCode",
	"243": "albertaOpeningBalance",
	"247": "albertaAmalgamationTransfer",
	"249": "albertaOtherAdditions",
	"251": "albertaOtherDeductions",
	"253": "claimed",
	"257": "federalForeignResourceIncome",
	"261": "countryCode",
	"263": "albertaOpeningBalance",
	"265": "albertaAmalgamationTransfer",
	"267": "albertaOtherTransfer",
	"269": "albertaOtherDeductions",
	"273": "claimed",
	"277": "federalForeignResourceIncome",
	// AREA H — regular (AA-II), then successor (KK-RR).
	"281": "countryCode",
	"283": "albertaOpeningBalance",
	"285": "federalCurrentYearExpenses",
	"287": "albertaAmalgamationTransfer",
	"289": "albertaOtherAdditions",
	"291": "albertaOtherDeductions",
	"293": "claimed",
	"297": "federalForeignResourceIncome",
	"301": "countryCode",
	"303": "albertaOpeningBalance",
	"305": "albertaAmalgamationTransfer",
	"307": "albertaOtherTransfer",
	"309": "albertaOtherDeductions",
	"313": "claimed",
	"317": "federalForeignResourceIncome",
};

type CountryArrayKey =
	| "sfedeRegular"
	| "sfedeSuccessor"
	| "cfreRegular"
	| "cfreSuccessor";

/** Which `ri` array each per-country table's rows live in. */
const COUNTRY_ARRAY: Readonly<Record<string, CountryArrayKey>> = {
	"sfede:Regular Expenses": "sfedeRegular",
	"sfede:Successor Expenses": "sfedeSuccessor",
	"cfre:Regular Expenses": "cfreRegular",
	"cfre:Successor Expenses": "cfreSuccessor",
};

/**
 * Areas G and H — pages 5 and 6, and the third shape on this form.
 *
 * ── What was here before ────────────────────────────────────────────────────
 *
 * Four `PaperClassGrid`s showing a country code and, on one of them, a single
 * amount — under a heading that said "NOT YET TRANSCRIBED". That was honest
 * about the gap, and the gap was large: the guided editor collected every
 * column on these rows while the paper view showed one or two of them,
 * because the form definition held five lines for the whole schedule.
 *
 * ── Why these are not the grid above ────────────────────────────────────────
 *
 * Areas A-F are labelled rows with two columns. These are labelled COLUMNS
 * with one row per country, so a printed line is a column and each row is an
 * occurrence of it. Three things follow that the continuity renderer has no
 * way to express:
 *
 *   - **The letters.** The page heads each column A-I / J-R / AA-JJ / KK-SS,
 *     and those letters are the entire vocabulary of its footnotes and its own
 *     arithmetic: "Amount available (A+B+C-D)", "the greater of the total of
 *     all amounts in column H and 10% of the total of all amounts available in
 *     column E". Drop them and none of that text resolves against anything.
 *   - **Four columns with no line number** — E, N, FF and OO, the "Amount
 *     available" subtotals, which are precisely what both negative-balance
 *     footnotes are about.
 *   - **Four grand totals the page names only by letter** — I, R, JJ and SS —
 *     each totalling its table's claim column across every country, and four
 *     of the six terms in the instruction that closes the form.
 */
function PerCountryAreas({
	control,
	disabled,
	filed,
	footnotes,
}: {
	control: Control<AlbertaResourceDeductions15Values>;
	disabled?: boolean;
	filed: ReadonlyMap<string, string | number>;
	footnotes: ReturnType<typeof readFootnotePlacement>;
}) {
	return (
		<>
			{AT1_SCHEDULE_15_PER_COUNTRY.map((area) => {
				const section = AT1_SCHEDULE_15_SECTIONS.find(
					(s) => s.id === area.section,
				);
				return (
					<div key={area.section} className="space-y-2">
						{section?.printedBefore && (
							<p className="px-1 text-sm font-medium text-muted-foreground">
								{section.printedBefore}
							</p>
						)}
						<PaperSection title={area.title} description={section?.description}>
							{/*
							 * The paragraph under the heading, and it is the whole test
							 * for which of the two areas applies: Area G is pre-2001
							 * expenses, Area H is 2001-and-after. Verbatim.
							 */}
							<p className="px-4 pb-1 pt-3 text-sm font-medium leading-snug">
								{area.subtitle}
							</p>
							{area.tables.map((table) => (
								<CountryTable
									key={table.title}
									section={area.section}
									table={table}
									control={control}
									disabled={disabled}
									filed={filed}
									markFor={(n) => footnotes.marks[n]}
								/>
							))}
							<PaperFootnotes
								notes={AT1_SCHEDULE_15_FOOTNOTES}
								only={footnotes.forSection(area.section)}
								marks={footnotes.marks}
							/>
						</PaperSection>
					</div>
				);
			})}
		</>
	);
}

/**
 * One per-country table: lettered columns across, one row per country down.
 *
 * Rows are added and removed here rather than only in the guided editor,
 * because a country with no row has no boxes at all — and the page's own caps
 * are computed on the TOTAL across countries, so a missing row changes every
 * other row's ceiling.
 */
function CountryTable({
	section,
	table,
	control,
	disabled,
	filed,
	markFor,
}: {
	section: string;
	table: PerCountryTable;
	control: Control<AlbertaResourceDeductions15Values>;
	disabled?: boolean;
	filed: ReadonlyMap<string, string | number>;
	markFor: (footnote: number) => string | undefined;
}) {
	const arrayKey = COUNTRY_ARRAY[
		`${section}:${table.title}`
	] as CountryArrayKey;
	const rows = useWatch({ control, name: arrayKey }) ?? [];
	const { append, remove } = useFieldArray({
		control: control as unknown as Control<{ rows: unknown[] }>,
		name: arrayKey as unknown as "rows",
	});

	return (
		<div className="space-y-2 p-2">
			<p className="px-1 text-xs font-semibold">{table.title}</p>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr>
							<th className="w-8 border-b px-1 pb-2" />
							{table.columns.map((col) => (
								<th
									key={col.heading + (col.letter ?? "")}
									className="min-w-[8rem] border-b px-2 pb-2 text-left align-bottom font-medium"
								>
									{col.letter && (
										<span className="block text-center text-sm font-semibold">
											{col.letter}
										</span>
									)}
									<span className="block text-xs leading-tight">
										{col.heading}
										{col.footnoteMarks?.map((n) => {
											const text = AT1_SCHEDULE_15_FOOTNOTES[n];
											if (!text) return null;
											return (
												<TooltipWrapper key={n} content={text} side="top">
													<sup className="ml-0.5 cursor-help font-mono">
														{markFor(n) ?? "*"}
													</sup>
												</TooltipWrapper>
											);
										})}
									</span>
									{col.line ? (
										<span className="mt-0.5 inline-block rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
											{col.line}
										</span>
									) : (
										<TooltipWrapper
											content="Printed on the form with no line number: the page computes this column from the ones beside it, and both of this area's negative-balance footnotes are about it."
											side="top"
										>
											<span className="mt-0.5 inline-block cursor-help rounded border border-dashed px-1.5 font-mono text-[10px] text-muted-foreground">
												computed
											</span>
										</TooltipWrapper>
									)}
								</th>
							))}
							<th className="w-10 border-b px-1 pb-2" />
						</tr>
					</thead>
					<tbody>
						{rows.map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: the index IS the row's printed occurrence — reordering changes which country files at which occurrence
							<tr key={`${arrayKey}-${i}`} className="border-b">
								<td className="px-1 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
									{i + 1}
								</td>
								{table.columns.map((col) => (
									<CountryCell
										key={col.heading + (col.letter ?? "")}
										column={col}
										arrayKey={arrayKey}
										index={i}
										control={control}
										disabled={disabled}
										filed={filed}
									/>
								))}
								<td className="px-1 py-1.5 text-right">
									<button
										type="button"
										onClick={() => remove(i)}
										disabled={disabled}
										className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
										aria-label={`Remove country ${i + 1}`}
									>
										&#10005;
									</button>
								</td>
							</tr>
						))}
						{/*
						 * The grand total the page prints under the table, identified
						 * only by its letter. Read-only and unbound: nothing files it,
						 * and it is one of the four terms the closing instruction names
						 * alongside two real line numbers.
						 */}
						<tr className="bg-muted/30">
							<td className="px-1 py-1.5" />
							<td
								colSpan={Math.max(1, table.columns.length - 1)}
								className="px-2 py-1.5 text-right text-xs font-medium text-muted-foreground"
							>
								Total of column {table.grandTotal.ofColumn}, all countries
							</td>
							<td className="px-2 py-1.5">
								<div className="flex items-center gap-1.5">
									<span className="h-8 flex-1 rounded-md border border-dashed bg-muted/40" />
									<span className="shrink-0 font-mono text-xs font-semibold">
										{table.grandTotal.letter}
									</span>
								</div>
							</td>
							<td className="px-1 py-1.5" />
						</tr>
					</tbody>
				</table>
			</div>
			<button
				type="button"
				onClick={() => append({})}
				disabled={disabled}
				className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
			>
				+ Add a country
			</button>
			{rows.length === 0 && (
				<p className="px-1 text-xs text-muted-foreground">
					No countries entered yet.
				</p>
			)}
		</div>
	);
}

/** One cell of a per-country row — editable, computed, or unnumbered. */
function CountryCell({
	column,
	arrayKey,
	index,
	control,
	disabled,
	filed,
}: {
	column: PerCountryColumn;
	arrayKey: CountryArrayKey;
	index: number;
	control: Control<AlbertaResourceDeductions15Values>;
	disabled?: boolean;
	filed: ReadonlyMap<string, string | number>;
}) {
	// The four "Amount available" columns: no line, nothing to bind, and the
	// page leaves the box open for a preparer's own arithmetic.
	if (!column.line) {
		return (
			<td className="px-2 py-1.5">
				<div className="h-8 w-full rounded-md border border-dashed bg-muted/30" />
			</td>
		);
	}

	const name = COUNTRY_CELL_FIELD[column.line];
	if (!name) {
		// A closing balance. Read-only; the value shown is whatever the last
		// compute filed at this line's FIRST occurrence, which is why the
		// per-row figure is not attempted beyond it.
		const value = filed.get(column.line);
		return (
			<td className="px-2 py-1.5">
				<span className="block h-8 rounded-md border border-dashed bg-muted/40 px-1.5 text-right text-sm leading-8 tabular-nums">
					{index === 0 && typeof value === "number"
						? formatSignedMoney(value)
						: ""}
				</span>
			</td>
		);
	}

	return (
		<td className="px-2 py-1.5">
			<Controller
				control={control}
				name={`${arrayKey}.${index}.${name}` as "daysInTaxYear"}
				render={({ field }) =>
					column.kind === "code" ? (
						<input
							type="text"
							disabled={disabled}
							aria-label={`${column.heading} - country ${index + 1}`}
							className={CELL.replace("text-right", "")}
							value={(field.value as string | undefined) ?? ""}
							onChange={(e) => field.onChange(e.target.value || undefined)}
							onBlur={field.onBlur}
						/>
					) : (
						<input
							type="number"
							inputMode="decimal"
							step="any"
							disabled={disabled}
							aria-label={`${column.heading} - country ${index + 1}`}
							className={CELL}
							value={(field.value as number | undefined) ?? ""}
							onChange={(e) =>
								field.onChange(
									e.target.value === "" ? undefined : Number(e.target.value),
								)
							}
							onBlur={field.onBlur}
						/>
					)
				}
			/>
		</td>
	);
}

/**
 * The instruction the form closes with, rendered where the page prints it:
 * below Area H, at the very foot.
 *
 * Six terms, and four of them are LETTERS — I, R, JJ and SS, the per-country
 * grand totals — which is why this is a sentence rather than a leader row with
 * a line chip. AT1 Schedule 12's line 030 receives the total.
 */
function ClosingInstruction() {
	return (
		<div className="rounded-lg border bg-muted/20 px-4 py-3">
			<p className="text-sm font-semibold">
				{AT1_SCHEDULE_15_CLOSING_INSTRUCTION.text}
			</p>
			<p className="mt-1 text-xs text-muted-foreground">
				Two of the six terms are line numbers (
				{AT1_SCHEDULE_15_CLOSING_INSTRUCTION.lines.join(", ")}); the other four
				are the grand totals above, which the page identifies only by letter (
				{AT1_SCHEDULE_15_CLOSING_INSTRUCTION.letters.join(", ")}) and does not
				number.
			</p>
		</div>
	);
}
