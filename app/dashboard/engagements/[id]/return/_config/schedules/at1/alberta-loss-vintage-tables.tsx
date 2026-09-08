"use client";

import type { FieldComponentProps } from "@classytic/formkit";
import { Pill } from "@classytic/fluid/client/pill";
import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
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
import type { AlbertaContinuityValues } from "../../../_lib/return-input";
import { AT1_SCHEDULE_21_FIELDS } from "./paper/generated/schedule21.layout";
import { parseAt1LineItemId } from "./paper/at1-lines";
import type { NavigateToLine } from "./paper/resolve-line";
import { type RifeLineKey, rifeFormText } from "./rife-lines";

/**
 * The horizontal inset every cell's CONTENT shares.
 *
 * Inputs carry their own `px-1.5`, so a header or a total sitting directly in
 * the table cell lands 1.5 units further out than the figure in the box above
 * or below it. Applying the same inset to headers, computed cells and the
 * totals row gives the whole column one right edge — which is the point of a
 * money column, and what makes it checkable against the printed form.
 */
const CELL_INSET = "px-1.5";

/** 3-digit printed line number → that column's field on the form. */
const FIELD_BY_LINE = new Map(
	AT1_SCHEDULE_21_FIELDS.map((f) => [parseAt1LineItemId(f.line)?.field ?? f.line, f]),
);

/**
 * A column header: the form's own 3-digit line number over the form's own
 * caption.
 *
 * The caption is READ FROM THE REGISTRY, not passed in. These headers used to
 * be hand-typed abbreviations — "Opening balance" for *"Limited partnership
 * losses at end of preceding taxation year"*, "Applied" for *"Limited
 * partnership loss applied"*, "Restricted farm" for *"Restricted farm losses"*
 * — so a preparer reconciling this table against the paper was matching on
 * position and line number alone, and any correction to the definition left
 * these untouched.
 *
 * The carries-forward badge comes from the same place — the field's own `to` —
 * rather than being passed in with a hand-written form id and line number.
 */
function HeadWithLine({
	field,
	align,
<<<<<<< Updated upstream
	tooltip,
=======
	onNavigate,
>>>>>>> Stashed changes
}: {
	/** The printed 3-digit line number, e.g. `"133"`. */
	field: string;
	align?: "right";
<<<<<<< Updated upstream
	/** The printed form's own full caption — the abbreviated column label above is a fit for a table header, not a replacement for what the line actually says. */
	tooltip?: string;
=======
	onNavigate?: NavigateToLine;
>>>>>>> Stashed changes
}) {
	const definition = FIELD_BY_LINE.get(field);
	return (
<<<<<<< Updated upstream
		<TableHead className={align === "right" ? "text-right" : undefined}>
			<span className="block font-mono text-[10px] font-normal text-muted-foreground">{displayLine}</span>
			<TooltipWrapper content={tooltip} side="top" disabled={!tooltip}>
				<span className={cn(tooltip && "cursor-help underline decoration-dotted underline-offset-2")}>
					{children}
				</span>
			</TooltipWrapper>
=======
		<TableHead
			className={cn(
				"align-bottom whitespace-normal",
				align === "right" && "text-right",
			)}
		>
			<span className={cn("block max-w-[13rem]", CELL_INSET)}>
				<span className="block font-mono text-[10px] font-normal text-muted-foreground">
					{field}
				</span>
				<span className="block text-xs leading-snug font-normal">
					{definition?.caption ?? field}
					{definition?.to && (
						<CarriesToBadge to={definition.to} onNavigate={onNavigate} />
					)}
				</span>
			</span>
>>>>>>> Stashed changes
		</TableHead>
	);
}

/** The small "→ Schedule X, line Y" badge used inline in a `TableHead`, for a column whose value carries forward — same visual language as `ProvenanceBadge`'s `to` badge, without depending on the paper-view-only primitives file. */
function CarriesToBadge({
	to,
	onNavigate,
}: {
	to: { form: string; line: string; note?: string };
	onNavigate?: NavigateToLine;
}) {
	// `to.line` is the wire-format id (e.g. AT1's 9-digit composite); show the
	// printed form's 3-digit field, not the internal key.
	const displayLine = parseAt1LineItemId(to.line)?.field ?? to.line;
	const label = `→ ${to.form} line ${displayLine}`;
	const tooltip = to.note || `Carries forward to ${to.form}, line ${displayLine}.`;
	return (
		<TooltipWrapper content={tooltip} side="top">
			{onNavigate ? (
				<button type="button" onClick={() => onNavigate(to.form, to.line)} className="ml-1 inline-flex align-middle">
					<Pill variant="outline" className="cursor-pointer text-[10px] font-normal hover:bg-accent">
						{label}
					</Pill>
				</button>
			) : (
				<span className="ml-1 inline-flex align-middle">
					<Pill variant="outline" className="cursor-help text-[10px] font-normal">
						{label}
					</Pill>
				</span>
			)}
		</TooltipWrapper>
	);
}

/**
 * AT1 Schedule 21's two "by year of origin" ledgers (page 3: non-capital
 * losses lines 151-169; page 4: farm/restricted-farm/LPP losses lines
 * 181-187) are 21-row tables — one row per taxation year. `f.array`'s
 * stacked-card layout (one full card per row) is unusable at that row count,
 * so these render as real HTML tables instead, wired to the SAME
 * `useFieldArray` mechanism `f.array`'s own adapter uses
 * (`ArrayFieldAdapter` in fluid's formkit adapter) — just laid out as
 * `<tr>`s instead of cards. Reached through `field.custom`, which is the
 * documented escape hatch for exactly this ("full control over rendering,
 * still wired into the form via `control`").
 */

const CURRENCY_FMT = new Intl.NumberFormat("en-CA", {
	style: "currency",
	currency: "CAD",
	maximumFractionDigits: 0,
});

function toNum(v: unknown): number | undefined {
	if (v === "" || v === null || v === undefined) return undefined;
	const n = Number(v);
	return Number.isNaN(n) ? undefined : n;
}

/** Smallest year value in `[min, max]` not already used by another row — the
 *  default for a freshly-appended row, so the preparer isn't forced to pick
 *  the obvious next vintage by hand every time. */
function nextAvailable(used: Set<number>, min: number, max: number): number {
	for (let i = min; i <= max; i++) {
		if (!used.has(i)) return i;
	}
	return min;
}

function ordinal(n: number): string {
	const rem100 = n % 100;
	if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
	switch (n % 10) {
		case 1:
			return `${n}st`;
		case 2:
			return `${n}nd`;
		case 3:
			return `${n}rd`;
		default:
			return `${n}th`;
	}
}

// ============================================================================
// Shared dense-cell inputs
// ============================================================================

function NumCell({
	control,
	name,
	disabled,
}: {
	control: Control<AlbertaContinuityValues>;
	name: string;
	disabled?: boolean;
}) {
	return (
		<Controller
			control={control}
			name={name as Path<AlbertaContinuityValues>}
			render={({ field }) => (
				<input
					type="number"
					inputMode="decimal"
					step="any"
					disabled={disabled}
					aria-label={name}
					className={cn(
						"h-8 w-full min-w-[5rem] rounded-md border border-input bg-transparent px-1.5 text-right text-sm tabular-nums outline-none",
						"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
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
}: {
	control: Control<AlbertaContinuityValues>;
	name: string;
}) {
	return (
		<Controller
			control={control}
			name={name as Path<AlbertaContinuityValues>}
			render={({ field }) => (
				<input
					type="date"
					aria-label={name}
					className={cn(
						"h-8 w-full min-w-[8.5rem] rounded-md border border-input bg-transparent px-1.5 text-sm outline-none",
						"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
					)}
					value={(field.value as string | undefined) ?? ""}
					onChange={(e) =>
						field.onChange(e.target.value === "" ? undefined : e.target.value)
					}
					onBlur={field.onBlur}
				/>
			)}
		/>
	);
}

function YearSelect({
	control,
	name,
	options,
	formatLabel,
}: {
	control: Control<AlbertaContinuityValues>;
	name: string;
	options: number[];
	formatLabel: (n: number) => string;
}) {
	return (
		<Controller
			control={control}
			name={name as Path<AlbertaContinuityValues>}
			render={({ field }) => (
				<select
					aria-label={name}
					className="h-8 w-full min-w-[8rem] rounded-md border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
					value={(field.value as number | undefined) ?? ""}
					onChange={(e) =>
						field.onChange(
							e.target.value === "" ? undefined : Number(e.target.value),
						)
					}
					onBlur={field.onBlur}
				>
					<option value="" disabled>
						Select year…
					</option>
					{options.map((y) => (
						<option key={y} value={y}>
							{formatLabel(y)}
						</option>
					))}
				</select>
			)}
		/>
	);
}

function RemoveRowButton({
	onRemove,
	label,
}: {
	onRemove: () => void;
	label: string;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			className="text-destructive hover:bg-destructive/10"
			onClick={onRemove}
			aria-label={label}
		>
			<Trash2 className="size-4" />
		</Button>
	);
}

/**
 * Column-wise sum over a repeating table's rows, blanks counting as zero.
 *
 * Typed to return a plain `Record<K, number>` rather than inferring from the
 * row shape: every field on a vintage row is optional, so an inferred
 * accumulator comes back `number | undefined` and every total then needs a
 * guard it doesn't deserve.
 */
function sumColumns<K extends string>(
	rows: readonly (Record<string, unknown> | undefined)[],
	keys: readonly K[],
): Record<K, number> {
	const out = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
	for (const row of rows) {
		for (const key of keys) out[key] += toNum(row?.[key]) ?? 0;
	}
	return out;
}

/**
 * The `Totals:` row both by-year-of-origin ledgers print under their columns.
 *
 * Read-only and derived — the form has a totals box per numeric column, and a
 * preparer reconciling against the paper needs the same figure in the same
 * place. `leadingCells` is how many non-numeric columns (year of origin, tax
 * year end) the label spans before the first total.
 */
function TotalsRow({
	label,
	values,
	leadingCells,
}: {
	label: string;
	values: readonly number[];
	leadingCells: number;
}) {
	return (
		<TableRow className="border-t-2 bg-muted/30 font-medium hover:bg-muted/30">
			<TableCell colSpan={leadingCells} className="text-sm">
				<span className={cn("inline-block", CELL_INSET)}>{label}</span>
			</TableCell>
			{values.map((v, i) => (
				<TableCell
					// Fixed-length, fixed-order list of column totals — index is the
					// column, and there is nothing else to key on.
					// biome-ignore lint/suspicious/noArrayIndexKey: positional by construction
					key={i}
					className="text-right"
				>
					<span className={cn("inline-block tabular-nums", CELL_INSET)}>
						{CURRENCY_FMT.format(v)}
					</span>
				</TableCell>
			))}
			<TableCell />
		</TableRow>
	);
}

function TextCell({
	control,
	name,
}: {
	control: Control<AlbertaContinuityValues>;
	name: string;
}) {
	return (
		<Controller
			control={control}
			name={name as Path<AlbertaContinuityValues>}
			render={({ field }) => (
				<input
					type="text"
					aria-label={name}
					className={cn(
						"h-8 w-full min-w-[7rem] rounded-md border border-input bg-transparent px-1.5 text-sm outline-none",
						"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
					)}
					value={(field.value as string | undefined) ?? ""}
					onChange={(e) =>
						field.onChange(e.target.value === "" ? undefined : e.target.value)
					}
					onBlur={field.onBlur}
				/>
			)}
		/>
	);
}

// ============================================================================
// Continuity of limited partnership losses (line 131-141) — a SIXTH pool,
// one row per partnership rather than one row per year. Same `f.array`-
// unusable-at-this-density problem the vintage tables solve, for a different
// reason: not row count, but wasted vertical space — five short fields
// (a name and four dollar amounts) don't need a full-width stacked card
// each. A row is a much better fit and matches how the live form itself
// lays this section out.
// ============================================================================

export function LimitedPartnershipTable({
	control,
	onNavigate,
}: FieldComponentProps<AlbertaContinuityValues> & { onNavigate?: NavigateToLine }) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: "limitedPartnerships",
	});
	const watched = useWatch({ control, name: "limitedPartnerships" }) ?? [];

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					One row per limited partnership loss interest. Leave empty if the
					corporation has none.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => append({})}
				>
					<Plus className="size-4" />
					Add partnership
				</Button>
			</div>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
<<<<<<< Updated upstream
							<HeadWithLine lineId={line("131")} tooltip="Partnership identifier (if known).">Partnership</HeadWithLine>
							<HeadWithLine
								lineId={line("133")}
								align="right"
								tooltip="Limited partnership losses at the end of the preceding taxation year."
							>
								Opening balance
							</HeadWithLine>
							<HeadWithLine
								lineId={line("135")}
								align="right"
								tooltip="Limited partnership losses transferred from an amalgamation or wind-up of a subsidiary."
							>
								Wind-up transfer
							</HeadWithLine>
							<HeadWithLine lineId={line("137")} align="right" tooltip="The limited partnership loss created this year.">
								Current-year loss
							</HeadWithLine>
							<HeadWithLine
								lineId={line("139")}
								align="right"
								tooltip="Limited partnership loss applied — capped at the opening balance plus any wind-up transfer."
							>
								Applied
								<CarriesToBadge
									to={{ form: "AT1SCH12", line: "012072001", note: "Carry forward the total of this column to Schedule 12, line 072." }}
									onNavigate={onNavigate}
								/>
							</HeadWithLine>
							<HeadWithLine
								lineId={line("141")}
								align="right"
								tooltip="Limited partnership losses closing balance (133 + 135 + 137 − 139)."
							>
								Closing balance
							</HeadWithLine>
=======
							<HeadWithLine field="131" />
							<HeadWithLine field="133" align="right" />
							<HeadWithLine field="135" align="right" />
							<HeadWithLine field="137" align="right" />
							<HeadWithLine field="139" align="right" onNavigate={onNavigate} />
							<HeadWithLine field="141" align="right" />
>>>>>>> Stashed changes
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{fields.length === 0 && (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={7}
									className="py-6 text-center text-sm text-muted-foreground"
								>
									No limited partnership interests yet — click “Add partnership”
									to start.
								</TableCell>
							</TableRow>
						)}
						{fields.map((rhfField, index) => {
							const row = watched[index] ?? {};
							const preceding = toNum(row.precedingYearBalance);
							const windUp = toNum(row.transferredOnWindUp);
							const currentYear = toNum(row.currentYearLoss);
							const applied = toNum(row.applied);
							const hasAny =
								preceding != null ||
								windUp != null ||
								currentYear != null ||
								applied != null;
							const cap = (preceding ?? 0) + (windUp ?? 0);
							const appliedCapped = Math.min(applied ?? 0, cap);
							const closing =
								(preceding ?? 0) +
								(windUp ?? 0) +
								(currentYear ?? 0) -
								appliedCapped;
							return (
								<TableRow key={rhfField.id}>
									<TableCell>
										<TextCell
											control={control}
											name={`limitedPartnerships.${index}.identifier`}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`limitedPartnerships.${index}.precedingYearBalance`}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`limitedPartnerships.${index}.transferredOnWindUp`}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`limitedPartnerships.${index}.currentYearLoss`}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`limitedPartnerships.${index}.applied`}
										/>
									</TableCell>
									<TableCell className="text-right">
										<span
											className={cn(
												"inline-block tabular-nums text-muted-foreground",
												CELL_INSET,
											)}
										>
											{hasAny ? CURRENCY_FMT.format(closing) : "—"}
										</span>
									</TableCell>
									<TableCell>
										<RemoveRowButton
											onRemove={() => remove(index)}
											label={`Remove row ${index + 1}`}
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

// ============================================================================
// Continuity of Restricted Interest and Financing Expenses — RIFE (page 5,
// lines 200-250/310-350) — the NINTH section. Not a repeating table: a fixed
// set of scalar lines, so unlike LP/vintages above this reads more like the
// paper form's own two stacked blocks. The four derived lines (310/340/350
// closing 250) are computed HERE, client-side, from the same watched raw
// inputs — the same "watched, computed inline, not itself an RHF field"
// pattern `LimitedPartnershipTable`'s own closing-balance column already
// uses above, mirroring `computeRifeContinuity`'s formulas
// (`@classytic/ca-tax`'s `schedule21-rife.ts`) rather than importing that
// package into a client bundle for one arithmetic preview.
// ============================================================================

/**
 * The hover text for a RIFE line: the printed form's own caption (and note)
 * from the FormDefinition, then any editor-specific guidance — so the short
 * label here never has to carry the form's full wording, and the full
 * wording is the form's, not a paraphrase.
 */
function rifeTooltip(field: RifeLineKey, help?: string): string | undefined {
	return [rifeFormText(field), help].filter(Boolean).join(" ") || undefined;
}

function RifeFieldRow({
	control,
	name,
	field,
	label,
	help,
	disabled,
}: {
	control: Control<AlbertaContinuityValues>;
	name: string;
	/** The printed three-digit line — validated against the form by `rife-lines.ts`. */
	field: RifeLineKey;
	label: string;
	help?: string;
	disabled?: boolean;
}) {
	const tooltip = rifeTooltip(field, help);
	return (
		<div className="flex items-center justify-between gap-3">
			<TooltipWrapper content={tooltip} side="top" disabled={!tooltip}>
				<span className={cn("flex items-baseline gap-1.5 text-sm", tooltip && "cursor-help underline decoration-dotted underline-offset-2")}>
					<span className="font-mono text-[10px] text-muted-foreground">{field}</span>
					{label}
				</span>
			</TooltipWrapper>
			<NumCell control={control} name={name} disabled={disabled} />
		</div>
	);
}

function RifeSummaryRow({
	field,
	label,
	value,
}: {
	field: RifeLineKey;
	label: string;
	value: number;
}) {
	const tooltip = rifeTooltip(field);
	return (
		<div className="flex items-center justify-between gap-3 rounded-md border border-dashed bg-muted/50 px-2 py-1.5">
			<TooltipWrapper content={tooltip} side="top" disabled={!tooltip}>
				<span className={cn("flex items-baseline gap-1.5 text-sm text-muted-foreground", tooltip && "cursor-help")}>
					<span className="font-mono text-[10px]">{field}</span>
					{label}
				</span>
			</TooltipWrapper>
			<span className={cn("text-sm tabular-nums", value < 0 && "text-red-600 dark:text-red-400")}>
				{CURRENCY_FMT.format(value)}
			</span>
		</div>
	);
}

export function RifeContinuitySection({
	control,
	disabled,
}: FieldComponentProps<AlbertaContinuityValues>) {
	const watched = useWatch({ control, name: "rife" }) ?? {};
	const opening = toNum(watched.openingBalance) ?? 0;
	const windUp = toNum(watched.transferredOnWindUp) ?? 0;
	const acquisitionAdjustment = toNum(watched.acquisitionOfControlAdjustment) ?? 0;
	const currentYear = toNum(watched.currentYearRife) ?? 0;
	const excessCapacity = toNum(watched.excessCapacity) ?? 0;
	const receivedCapacity = toNum(watched.receivedCapacity) ?? 0;

	const rifeFromPreviousYears = Math.max(0, opening + windUp - acquisitionAdjustment);
	const totalCapacity = excessCapacity + receivedCapacity;
	const maxDeductible = Math.max(0, Math.min(rifeFromPreviousYears, totalCapacity));
	const requestedClaim = toNum(watched.deductedClaim);
	const deducted = Math.min(requestedClaim ?? maxDeductible, maxDeductible);
	const closingBalance = opening + windUp - acquisitionAdjustment + currentYear - deducted;

	return (
		<div className="space-y-4">
			<div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
				<RifeFieldRow control={control} name="rife.openingBalance" field="200" label="RIFE at the end of the previous tax year" disabled={disabled} />
				<RifeFieldRow control={control} name="rife.transferredOnWindUp" field="210" label="Transferred on an amalgamation or wind-up" disabled={disabled} />
				<RifeFieldRow control={control} name="rife.acquisitionOfControlAdjustment" field="220" label="Deduct: adjustment for an acquisition of control" disabled={disabled} />
				<RifeFieldRow
					control={control}
					name="rife.currentYearRife"
					field="230"
					label="Current-year RIFE under ITA s.111(8)"
					help="Blank = same as federal. Defaults to T2 Schedule 4 line 710, which the engine computes from Schedule 130 Part 2O — override only where Alberta genuinely diverges."
					disabled={disabled}
				/>
				<RifeFieldRow
					control={control}
					name="rife.excessCapacity"
					field="320"
					label="Corporation's excess capacity for the year"
					help="Blank = same as federal. Defaults to T2 Schedule 130 line 129 (Part 2G amount F), which the engine computes — override only where Alberta genuinely diverges."
					disabled={disabled}
				/>
				<RifeFieldRow
					control={control}
					name="rife.receivedCapacity"
					field="330"
					label="Total received capacity for the year"
					help="Blank = same as federal. Defaults to T2 Schedule 130 line 130 (Part 1A), the capacity received from eligible group entities."
					disabled={disabled}
				/>
			</div>
			<div className="space-y-1.5 border-t pt-3">
				<RifeSummaryRow field="310" label="RIFE from previous tax years (200 + 210 − 220)" value={rifeFromPreviousYears} />
				<RifeSummaryRow field="340" label="Total capacity (320 + 330)" value={totalCapacity} />
				<RifeSummaryRow field="350" label="Maximum deductible (lesser of 310 and 340)" value={maxDeductible} />
			</div>
			<RifeFieldRow
				control={control}
				name="rife.deductedClaim"
				field="240"
				label="RIFE deducted for the tax year"
				help="Must not exceed line 350 — blank claims the maximum available automatically."
				disabled={disabled}
			/>
			<RifeSummaryRow field="250" label="Closing balance of RIFE" value={closingBalance} />
		</div>
	);
}

// ============================================================================
// Non-capital losses by year of origin (page 3, lines 151-169)
// ============================================================================

const YEARS_AGO_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20

/**
 * The page-3 ledger, all EIGHT of the printed columns.
 *
 * Which columns apply depends on the vintage, and the form says so by shading:
 *   · the CURRENT year (row 0) has no opening balance (155) and nothing
 *     "applied to reduce taxable income" (167) — the loss arose this year;
 *   · a PRECEDING vintage has no "loss incurred in current year" (157) and no
 *     "loss carried back" (165) — a carry-back is a current-year loss going
 *     backwards.
 *
 * Columns 157 and 165 used to be omitted from this table entirely, on the
 * reasoning that they only apply to the current year and the current year was
 * not enterable. That made two of the form's own columns unreachable. The
 * current-year row is a real row here now, and each cell is disabled exactly
 * where the form shades it.
 *
 * Column 169 (balance at end) is always computed, per the formula the form
 * prints in its own column heading.
 */
export function NonCapitalVintageTable({
	control,
}: FieldComponentProps<AlbertaContinuityValues>) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: "nonCapitalVintages",
	});
	const watched = useWatch({ control, name: "nonCapitalVintages" }) ?? [];

	const handleAdd = () => {
		const used = new Set(
			watched
				.map((r) => r?.yearsAgo)
				.filter((v): v is number => typeof v === "number"),
		);
		append({ yearsAgo: nextAvailable(used, 0, 20) });
	};

	/** Column totals — the form prints a Totals row under every numeric column. */
	const totals = sumColumns(watched, [
		"balanceAtBeginning",
		"lossIncurredInCurrentYear",
		"adjustments",
		"lossCarriedBack",
		"applied",
	]);
	const totalBalanceAtEnd =
		totals.balanceAtBeginning +
		totals.lossIncurredInCurrentYear +
		totals.adjustments -
		totals.lossCarriedBack -
		totals.applied;

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					One row per taxation year — the current year, then up to the 20th
					preceding (non-capital losses expire after 20 years). Cells the form
					shades for a given vintage are disabled here.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAdd}
					disabled={fields.length >= 21}
				>
					<Plus className="size-4" />
					Add row
				</Button>
			</div>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<HeadWithLine field="151" />
							<HeadWithLine field="153" />
							<HeadWithLine field="155" align="right" />
							<HeadWithLine field="157" align="right" />
							<HeadWithLine field="159" align="right" />
							<HeadWithLine field="165" align="right" />
							<HeadWithLine field="167" align="right" />
							<HeadWithLine field="169" align="right" />
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{fields.length === 0 && (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={9}
									className="py-6 text-center text-sm text-muted-foreground"
								>
									No vintages yet — click “Add row” to start.
								</TableCell>
							</TableRow>
						)}
						{fields.map((rhfField, index) => {
							const row = watched[index] ?? {};
							const yearIndex = toNum(row.yearsAgo);
							// The form shades by vintage: the current year (0) has no
							// opening balance and nothing applied; a preceding year has no
							// current-year loss and no carry-back.
							const isCurrent = yearIndex === 0;
							const beginning = toNum(row.balanceAtBeginning);
							const incurred = toNum(row.lossIncurredInCurrentYear);
							const adjustments = toNum(row.adjustments);
							const carriedBack = toNum(row.lossCarriedBack);
							const applied = toNum(row.applied);
							const hasAny =
								beginning != null ||
								incurred != null ||
								adjustments != null ||
								carriedBack != null ||
								applied != null;
							const balanceAtEnd =
								(beginning ?? 0) +
								(incurred ?? 0) +
								(adjustments ?? 0) -
								(carriedBack ?? 0) -
								(applied ?? 0);
							return (
								<TableRow key={rhfField.id}>
									<TableCell>
										<YearSelect
											control={control}
											name={`nonCapitalVintages.${index}.yearsAgo`}
											options={YEAR_INDEX_OPTIONS}
											formatLabel={yearIndexLabel}
										/>
									</TableCell>
									<TableCell>
										<DateCell
											control={control}
											name={`nonCapitalVintages.${index}.taxYearEnd`}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`nonCapitalVintages.${index}.balanceAtBeginning`}
											disabled={isCurrent}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`nonCapitalVintages.${index}.lossIncurredInCurrentYear`}
											disabled={!isCurrent}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`nonCapitalVintages.${index}.adjustments`}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`nonCapitalVintages.${index}.lossCarriedBack`}
											disabled={!isCurrent}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`nonCapitalVintages.${index}.applied`}
											disabled={isCurrent}
										/>
									</TableCell>
									<TableCell className="text-right">
										<span
											className={cn(
												"inline-block tabular-nums text-muted-foreground",
												CELL_INSET,
											)}
										>
											{hasAny ? CURRENCY_FMT.format(balanceAtEnd) : "—"}
										</span>
									</TableCell>
									<TableCell>
										<RemoveRowButton
											onRemove={() => remove(index)}
											label={`Remove row ${index + 1}`}
										/>
									</TableCell>
								</TableRow>
							);
						})}
						{fields.length > 0 && <TotalsRow
							label="Totals:"
							values={[
								totals.balanceAtBeginning,
								totals.lossIncurredInCurrentYear,
								totals.adjustments,
								totals.lossCarriedBack,
								totals.applied,
								totalBalanceAtEnd,
							]}
							leadingCells={2}
						/>}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

// ============================================================================
// Farm / restricted-farm / listed personal property losses (page 4, lines 181-187)
// ============================================================================

const YEAR_INDEX_OPTIONS = Array.from({ length: 21 }, (_, i) => i); // 0..20
/** Listed personal property losses expire after 7 tax years (not 20), so the
 *  PDF shades that cell grey beyond the 7th preceding year — this disables
 *  the input to match, rather than merely validating it after the fact. */
const LPP_EXPIRY_YEARS_AGO = 7;

function yearIndexLabel(n: number): string {
	return n === 0 ? "Current" : `${ordinal(n)} preceding year`;
}

/**
 * Unlike the non-capital table, row 0 ("Current") has no server-side
 * derivation here and is a genuinely enterable row like any other vintage —
 * the PDF's own layout (page 4) treats it identically to rows 1-20, so this
 * table starts empty (no fixed informational row) and lets 0 be picked from
 * the year selector like every other index.
 */
export function OtherLossVintageTable({
	control,
}: FieldComponentProps<AlbertaContinuityValues>) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: "otherLossVintages",
	});
	const watched = useWatch({ control, name: "otherLossVintages" }) ?? [];

	/** Column totals — the form prints a Totals row under all three columns. */
	const totals = sumColumns(watched, [
		"farmLosses",
		"restrictedFarmLosses",
		"listedPersonalPropertyLosses",
	]);

	const handleAdd = () => {
		const used = new Set(
			watched
				.map((r) => r?.yearIndex)
				.filter((v): v is number => typeof v === "number"),
		);
		append({ yearIndex: nextAvailable(used, 0, 20) });
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					One row per taxation year, current through the 20th preceding year.
					Listed personal property losses expire after 7 years, so that column
					is disabled beyond the 7th preceding year — matching the shaded cells
					on the printed form.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAdd}
					disabled={fields.length >= 21}
				>
					<Plus className="size-4" />
					Add row
				</Button>
			</div>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<HeadWithLine field="181" />
							<HeadWithLine field="183" align="right" />
							<HeadWithLine field="185" align="right" />
							<HeadWithLine field="187" align="right" />
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{fields.length === 0 && (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={5}
									className="py-6 text-center text-sm text-muted-foreground"
								>
									No rows yet — click “Add row” to start.
								</TableCell>
							</TableRow>
						)}
						{fields.map((rhfField, index) => {
							const row = watched[index] ?? {};
							const yearIndex = toNum(row.yearIndex);
							const lppDisabled =
								yearIndex != null && yearIndex > LPP_EXPIRY_YEARS_AGO;
							return (
								<TableRow key={rhfField.id}>
									<TableCell>
										<YearSelect
											control={control}
											name={`otherLossVintages.${index}.yearIndex`}
											options={YEAR_INDEX_OPTIONS}
											formatLabel={yearIndexLabel}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`otherLossVintages.${index}.farmLosses`}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`otherLossVintages.${index}.restrictedFarmLosses`}
										/>
									</TableCell>
									<TableCell>
										<NumCell
											control={control}
											name={`otherLossVintages.${index}.listedPersonalPropertyLosses`}
											disabled={lppDisabled}
										/>
									</TableCell>
									<TableCell>
										<RemoveRowButton
											onRemove={() => remove(index)}
											label={`Remove row ${index + 1}`}
										/>
									</TableCell>
								</TableRow>
							);
						})}
						{fields.length > 0 && (
							<TotalsRow
								label="Totals:"
								values={[
									totals.farmLosses,
									totals.restrictedFarmLosses,
									totals.listedPersonalPropertyLosses,
								]}
								leadingCells={1}
							/>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
