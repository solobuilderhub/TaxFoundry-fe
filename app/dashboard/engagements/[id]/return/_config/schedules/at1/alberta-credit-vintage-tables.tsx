"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import type { FieldComponentProps } from "@classytic/formkit";
import { Plus, Trash2 } from "lucide-react";
import {
	type Control,
	Controller,
	type Path,
	useFieldArray,
	useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AlbertaOtherCredits3Values } from "../../../_lib/return-input";
import {
	AT1_SCHEDULE_3_FOOTNOTES,
	AT1_SCHEDULE_3_VINTAGE_TABLES,
	AT1_SCHEDULE_3_VINTAGE_TOTALS_LABEL,
	albertaVintageRowLabel,
	type Schedule3VintageColumn,
} from "./paper/generated/schedule3.layout";

/**
 * AT1 Schedule 3 pages 2 and 3 — the three carry-forward-by-year-of-origin
 * tables, one per credit.
 *
 * ── Entirely data-driven, and that is the point ─────────────────────────────
 *
 * Every column, heading, shaded cell, totalled column and table depth comes
 * from `AT1_SCHEDULE_3_VINTAGE_TABLES`, emitted from `@classytic/ca-tax`'s form
 * definition. Nothing about the page is restated here. Three tables that differ
 * in exactly the ways these do — 5 rows versus 11, two different column orders,
 * three different shading patterns — are precisely where hand-written markup
 * drifts from the form one table at a time.
 *
 * Two of those differences are easy to get wrong and worth naming:
 *
 *   - The **APITC table orders its columns differently**: received (334) before
 *     opening balance (335), where ITC and CITC run opening-balance-then-
 *     received. Reading the order from data means this file never has to know.
 *   - The **ITC table stops at four preceding years** and the other two at ten.
 *     Rendering all three alike would offer six ITC vintages the form has no
 *     rows for.
 *
 * ── Why a custom component and not `f.array` ────────────────────────────────
 *
 * Same reason `alberta-loss-vintage-tables.tsx` gives for Schedule 21: at this
 * density a stacked card per row is unusable. Eleven rows of six short fields
 * is a table on the page and needs to be a table here. This file deliberately
 * mirrors that one's structure — `ShadedCell`, `NumCell`, `DateCell`,
 * `YearSelect`, `RemoveRowButton` — so the two read the same way.
 *
 * Those helpers are duplicated rather than shared, for now, for the reason that
 * file already documents about its own copy of `HeadWithLine`: they are typed to
 * their schedule's own slice, and both files are rendered by the GUIDED editor
 * as well as the paper view. Generifying them over `Control<T>` is a worthwhile
 * follow-up and a separate, testable change; doing it inside this one would put
 * a refactor of working Schedule 21 code inside a Schedule 3 feature.
 */

/**
 * The slice these three tables write to — Schedule 3's own, whole slice.
 *
 * The tables live on `vintages` inside it rather than in a slice of their own.
 * A separate `ReturnInput` key compiled to a SECOND "Schedule 3" row in the
 * schedule tree, because the registry pins exactly one nav entry per key and
 * Schedule 3 is one schedule — `SCHEDULE_KEYS_MATCH_RETURN_INPUT` caught it at
 * typecheck, which is what that assertion is for.
 */
type Values = AlbertaOtherCredits3Values;

/** One row of any of the three tables — they share a shape. */
type VintageRow = NonNullable<
	NonNullable<Values["vintages"]>["investorTaxCredit"]
>[number];

/** Which array each table drives, as a path within the slice. */
const ARRAY_NAME: Record<string, string> = {
	"itc-vintage": "vintages.investorTaxCredit",
	"citc-vintage": "vintages.capitalInvestmentTaxCredit",
	"apitc-vintage": "vintages.agriProcessingTaxCredit",
};

/**
 * Which row field each printed column binds to.
 *
 * Keyed by the column's own position in the table rather than by line number,
 * because the three tables use different lines for the same quantity — 124 /
 * 224 / 335 are all "opening balance" — and the contract has one row type. The
 * page's own column order is what defines the mapping, and `role: 'computed'`
 * columns (the year index and the closing balance) bind to nothing.
 */
const FIELD_BY_LINE: Record<string, keyof VintageRow> = {
	// Investor Tax Credit
	"122": "taxYearEnd",
	"124": "openingBalance",
	"125": "received",
	"126": "applied",
	"128": "expired",
	// Capital Investment Tax Credit
	"222": "taxYearEnd",
	"224": "openingBalance",
	"225": "received",
	"226": "applied",
	"228": "expired",
	// Agri-processing — note 334 is RECEIVED and 335 the opening balance, the
	// reverse of the two tables above. The page prints them in that order.
	"332": "taxYearEnd",
	"334": "received",
	"335": "openingBalance",
	"336": "applied",
	"338": "expired",
};

const toNum = (v: unknown): number => (typeof v === "number" ? v : 0);

/**
 * A cell the printed form SHADES OUT — a column that exists on the page but
 * does not apply to this row.
 *
 * Shading means something different from an empty box: the page is stating that
 * the quantity does not exist for that vintage. On all three tables a
 * current-year row shades the opening balance and the expiry — the credit was
 * received during the year, not carried into it, and nothing can expire in the
 * year it arrives — and on ITC/CITC every preceding-year row shades the
 * receipt, because a vintage from four years ago cannot receive credit now.
 */
function ShadedCell({ title }: { title: string }) {
	return (
		<TableCell className="bg-muted/60 p-0" title={title}>
			<span className="sr-only">{title}</span>
		</TableCell>
	);
}

function NumCell({
	control,
	name,
	label,
	disabled,
}: {
	control: Control<Values>;
	name: string;
	label: string;
	disabled?: boolean;
}) {
	return (
		<Controller
			control={control}
			name={name as Path<Values>}
			render={({ field }) => (
				<input
					type="number"
					inputMode="decimal"
					step="any"
					disabled={disabled}
					aria-label={label}
					className={cn(
						"h-8 w-[5.5rem] rounded-md border border-input bg-transparent px-1.5 text-right text-sm tabular-nums outline-none",
						"focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
						"disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50",
					)}
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
	);
}

function DateCell({
	control,
	name,
	label,
	disabled,
}: {
	control: Control<Values>;
	name: string;
	label: string;
	disabled?: boolean;
}) {
	return (
		<Controller
			control={control}
			name={name as Path<Values>}
			render={({ field }) => (
				<input
					type="date"
					disabled={disabled}
					aria-label={label}
					className={cn(
						"h-8 w-[8.5rem] rounded-md border border-input bg-transparent px-1.5 text-sm outline-none",
						"focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
						"disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50",
					)}
					value={(field.value as string | undefined) ?? ""}
					onChange={(e) => field.onChange(e.target.value || undefined)}
					onBlur={field.onBlur}
				/>
			)}
		/>
	);
}

/**
 * The "Year of origin" column — a select, not a free number.
 *
 * The page prints a fixed row per vintage, so the only legal values are 0
 * through the table's own depth, and each may appear once. Offering a number
 * input would let a preparer file two "2nd preceding taxation year" rows, which
 * the form has no way to represent.
 */
function YearSelect({
	control,
	name,
	label,
	maxPrecedingYear,
	taken,
	disabled,
}: {
	control: Control<Values>;
	name: string;
	label: string;
	maxPrecedingYear: number;
	taken: Set<number>;
	disabled?: boolean;
}) {
	return (
		<Controller
			control={control}
			name={name as Path<Values>}
			render={({ field }) => {
				const current = field.value as number | undefined;
				return (
					<select
						disabled={disabled}
						aria-label={label}
						className="h-8 w-44 rounded-md border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted/50"
						value={current ?? ""}
						onChange={(e) =>
							field.onChange(
								e.target.value === "" ? undefined : Number(e.target.value),
							)
						}
						onBlur={field.onBlur}
					>
						<option value="">Select year…</option>
						{Array.from({ length: maxPrecedingYear + 1 }, (_, i) => i)
							// A year already used by another row is not offered, but the
							// row's OWN value always is — otherwise the select would
							// render blank over a real stored value.
							.filter((y) => y === current || !taken.has(y))
							.map((y) => (
								<option key={y} value={y}>
									{albertaVintageRowLabel(y)}
								</option>
							))}
					</select>
				);
			}}
		/>
	);
}

/** A `TableHead` with the printed line number beneath the heading. */
function VintageHead({
	column,
	footnoteSymbol,
}: {
	column: Schedule3VintageColumn;
	footnoteSymbol: (mark: number) => string | undefined;
}) {
	return (
		<TableHead className="min-w-[7rem] align-bottom">
			<span className="block text-xs font-medium leading-tight">
				{column.heading}
				{column.footnoteMarks?.map((mark) => {
					const text = AT1_SCHEDULE_3_FOOTNOTES[mark];
					if (!text) return null;
					return (
						<TooltipWrapper key={mark} content={text} side="top">
							<sup className="ml-0.5 cursor-help font-mono">
								{footnoteSymbol(mark) ?? "*"}
							</sup>
						</TooltipWrapper>
					);
				})}
			</span>
			<span className="mt-0.5 inline-block rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
				{column.line}
			</span>
		</TableHead>
	);
}

/**
 * One of the three tables, built from its own entry in
 * `AT1_SCHEDULE_3_VINTAGE_TABLES`.
 *
 * `section` selects the table; everything else follows from the data.
 */
function VintageTable({
	control,
	section,
	disabled,
	footnoteSymbol,
}: {
	control: Control<Values>;
	section: string;
	disabled?: boolean;
	footnoteSymbol: (mark: number) => string | undefined;
}) {
	const table = AT1_SCHEDULE_3_VINTAGE_TABLES.find(
		(t) => t.section === section,
	);
	const arrayName = ARRAY_NAME[section] ?? "vintages.investorTaxCredit";
	const { fields, append, remove } = useFieldArray({
		control,
		name: arrayName as never,
	});
	const rows = (useWatch({ control, name: arrayName as never }) ??
		[]) as VintageRow[];

	if (!table) return null;

	const [yearColumn, ...rest] = table.columns;
	const dataColumns = rest;
	const taken = new Set(
		rows.flatMap((r) =>
			typeof r?.yearIndex === "number" ? [r.yearIndex] : [],
		),
	);

	/**
	 * The page's own Totals row, under the three right-hand columns only.
	 *
	 * The last of them (130 / 230 / 340) is computed from the row rather than
	 * entered — the page states its arithmetic in the column heading — so it is
	 * summed from the same arithmetic rather than read from a field that does
	 * not exist.
	 */
	const closingOf = (r: VintageRow) =>
		toNum(r?.openingBalance) +
		toNum(r?.received) -
		toNum(r?.applied) -
		toNum(r?.expired);
	const totals = {
		applied: rows.reduce((n, r) => n + toNum(r?.applied), 0),
		expired: rows.reduce((n, r) => n + toNum(r?.expired), 0),
		closing: rows.reduce((n, r) => n + closingOf(r), 0),
	};

	return (
		/*
		 * No heading of its own. Both callers already provide one — the paper
		 * view from the `FormSection` title, the guided editor from the
		 * `f.custom` label — and `table.title` is the same string, so printing
		 * it here showed the page's heading twice.
		 */
		<div className="space-y-2">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-8">
								<span className="sr-only">Row actions</span>
							</TableHead>
							{yearColumn && (
								<VintageHead
									column={yearColumn}
									footnoteSymbol={footnoteSymbol}
								/>
							)}
							{dataColumns.map((c) => (
								<VintageHead
									key={c.line}
									column={c}
									footnoteSymbol={footnoteSymbol}
								/>
							))}
							<TableHead className="w-10">
								<span className="sr-only">Row actions</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{fields.map((f, i) => {
							const row = rows[i];
							const yearIndex = row?.yearIndex;
							return (
								<TableRow key={f.id}>
									<TableCell className="text-center font-mono text-[11px] text-muted-foreground">
										{i + 1}
									</TableCell>
									<TableCell>
										{yearColumn && (
											<YearSelect
												control={control}
												name={`${arrayName}.${i}.yearIndex`}
												label={`${table.title} — year of origin, row ${i + 1}`}
												maxPrecedingYear={table.maxPrecedingYear}
												taken={taken}
												disabled={disabled}
											/>
										)}
									</TableCell>
									{dataColumns.map((c) => {
										// The page shades this cell for this vintage — it is
										// saying the quantity does not exist, which is not the
										// same as an empty box.
										if (
											yearIndex !== undefined &&
											c.shadedYears?.includes(yearIndex)
										) {
											return (
												<ShadedCell
													key={c.line}
													title={`${c.heading} does not apply to the ${albertaVintageRowLabel(yearIndex)} — shaded on the printed form.`}
												/>
											);
										}
										const name = FIELD_BY_LINE[c.line];
										if (!name) {
											/*
											 * The closing balance (130 / 230 / 340). The page
											 * states its arithmetic in its own column heading,
											 * so it is shown and never typed.
											 */
											return (
												<TableCell
													key={c.line}
													className="text-right tabular-nums text-muted-foreground"
												>
													{row ? closingOf(row).toLocaleString() : "—"}
												</TableCell>
											);
										}
										const label = `${c.heading}, row ${i + 1}`;
										return (
											<TableCell key={c.line}>
												{c.kind === "date" ? (
													<DateCell
														control={control}
														name={`${arrayName}.${i}.${name}`}
														label={label}
														disabled={disabled}
													/>
												) : (
													<NumCell
														control={control}
														name={`${arrayName}.${i}.${name}`}
														label={label}
														disabled={disabled}
													/>
												)}
											</TableCell>
										);
									})}
									<TableCell className="text-right">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											className="text-destructive hover:bg-destructive/10"
											onClick={() => remove(i)}
											disabled={disabled}
											aria-label={`Remove row ${i + 1}`}
										>
											<Trash2 className="size-4" />
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
						{/* The page prints "Totals:" under the three right-hand columns. */}
						<TableRow className="bg-muted/30">
							<TableCell />
							<TableCell />
							{dataColumns.map((c, i) => {
								if (!c.totalled) {
									// The label lands in the last untotalled column, which is
									// where the page sets it.
									const isLabelCell =
										dataColumns.findIndex((x) => x.totalled) === i + 1;
									return (
										<TableCell
											key={c.line}
											className="text-right font-semibold"
										>
											{isLabelCell ? AT1_SCHEDULE_3_VINTAGE_TOTALS_LABEL : null}
										</TableCell>
									);
								}
								const value =
									c.line.endsWith("26") || c.line.endsWith("36")
										? totals.applied
										: c.line.endsWith("28") || c.line.endsWith("38")
											? totals.expired
											: totals.closing;
								return (
									<TableCell
										key={c.line}
										className="text-right font-semibold tabular-nums"
									>
										{value.toLocaleString()}
									</TableCell>
								);
							})}
							<TableCell />
						</TableRow>
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center gap-3">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled || rows.length > table.maxPrecedingYear}
					onClick={() => append({} as never)}
				>
					<Plus className="mr-1 size-4" />
					Add a year of origin
				</Button>
				{rows.length > table.maxPrecedingYear && (
					<p className="text-xs text-muted-foreground">
						{table.maxPrecedingYear + 1} rows is all this table has — the
						current year and {table.maxPrecedingYear} preceding ones.
					</p>
				)}
			</div>
		</div>
	);
}

/**
 * The glyph the page prints for each of Schedule 3's five footnotes.
 *
 * Read from the form definition's own `footnotePlacement` by the Form View;
 * the guided editor renders these tables too and has no placement array to
 * hand, so it falls back to a single asterisk. Passed in rather than looked up
 * here so the two callers cannot disagree.
 */
export type FootnoteSymbol = (mark: number) => string | undefined;

const PLAIN_SYMBOL: FootnoteSymbol = () => undefined;

export function InvestorTaxCreditVintageTable({
	control,
}: FieldComponentProps<Values>) {
	return (
		<VintageTable
			control={control}
			section="itc-vintage"
			footnoteSymbol={PLAIN_SYMBOL}
		/>
	);
}

export function CapitalInvestmentTaxCreditVintageTable({
	control,
}: FieldComponentProps<Values>) {
	return (
		<VintageTable
			control={control}
			section="citc-vintage"
			footnoteSymbol={PLAIN_SYMBOL}
		/>
	);
}

export function AgriProcessingTaxCreditVintageTable({
	control,
}: FieldComponentProps<Values>) {
	return (
		<VintageTable
			control={control}
			section="apitc-vintage"
			footnoteSymbol={PLAIN_SYMBOL}
		/>
	);
}

/**
 * One table, for the paper Form View.
 *
 * `section` rather than all three at once, because the page gives each table
 * its own box with its own heading and its own footnotes — the Agri-processing
 * one carries three of the five. Rendering the set together would put five
 * footnotes under one heading and lose which table each belongs to.
 */
export function CreditVintageTables({
	control,
	disabled,
	section,
	footnoteSymbol,
}: {
	control: Control<Values>;
	disabled?: boolean;
	section: string;
	footnoteSymbol: FootnoteSymbol;
}) {
	return (
		<div className="p-2">
			<VintageTable
				control={control}
				section={section}
				disabled={disabled}
				footnoteSymbol={footnoteSymbol}
			/>
		</div>
	);
}
