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
import { parseAt1LineItemId } from "./paper/at1-lines";
import type { NavigateToLine } from "./paper/resolve-line";
import { type RifeLineKey, rifeFormText } from "./rife-lines";

/** `021FFF001` — this file is Schedule 21 only, so the schedule prefix is fixed. */
const line = (field: string): string => `021${field}001`;

/**
 * A `TableHead` with the printed form's own 3-digit line number as a small
 * mono sub-label, matching the badge convention `PaperLeaderRow`/
 * `PaperContinuityGrid` already use elsewhere on this schedule's paper Form
 * View — this file predates that convention (it's shared with the GUIDED
 * editor too, not paper-view-only), so it gets its own copy rather than
 * importing the paper components into a file the guided editor also
 * renders. `lineId` is still the full 9-digit composite id (kept for any
 * future highlight-sync use), but only the printed 3-digit field — what a
 * preparer actually sees on the form — is DISPLAYED; the raw composite id
 * (e.g. "021131001") is an internal key, not something to show someone
 * filling out a return.
 */
function HeadWithLine({
	lineId,
	children,
	align,
	tooltip,
}: {
	lineId: string;
	children: React.ReactNode;
	align?: "right";
	/** The printed form's own full caption — the abbreviated column label above is a fit for a table header, not a replacement for what the line actually says. */
	tooltip?: string;
}) {
	const displayLine = parseAt1LineItemId(lineId)?.field ?? lineId;
	return (
		<TableHead className={align === "right" ? "text-right" : undefined}>
			<span className="block font-mono text-[10px] font-normal text-muted-foreground">{displayLine}</span>
			<TooltipWrapper content={tooltip} side="top" disabled={!tooltip}>
				<span className={cn(tooltip && "cursor-help underline decoration-dotted underline-offset-2")}>
					{children}
				</span>
			</TooltipWrapper>
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
						"h-8 w-[5.5rem] rounded-md border border-input bg-transparent px-1.5 text-right text-sm tabular-nums outline-none",
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
						"h-8 w-[8.5rem] rounded-md border border-input bg-transparent px-1.5 text-sm outline-none",
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
					className="h-8 w-32 rounded-md border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring"
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
						"h-8 w-28 rounded-md border border-input bg-transparent px-1.5 text-sm outline-none",
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
									<TableCell className="text-right tabular-nums text-muted-foreground">
										{hasAny ? CURRENCY_FMT.format(closing) : "—"}
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
 * Row 0 ("Current") is deliberately NOT part of this array at all — it is
 * derived server-side from the current-year non-capital loss and carry-back
 * entered elsewhere on this schedule, so it renders as a fixed informational
 * row instead of an editable one. Only prior vintages (1st-20th preceding
 * taxation year) are genuinely enterable, and only 4 of the PDF's 7 data
 * columns apply to them: 153 (tax year end), 155 (balance at beginning), 159
 * (adjustments/transfers), 167 (applied) — 157 (loss incurred) and 165 (loss
 * carried back) exist only for the current-year row. Column 169 (balance at
 * end) is shown computed/read-only per the PDF's own formula, never entered.
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
		append({ yearsAgo: nextAvailable(used, 1, 20) });
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-xs text-muted-foreground">
					One row per PRIOR taxation year — non-capital losses expire after 20
					years.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleAdd}
					disabled={fields.length >= 20}
				>
					<Plus className="size-4" />
					Add prior-year row
				</Button>
			</div>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<HeadWithLine lineId={line("151")}>Year of origin</HeadWithLine>
							<HeadWithLine lineId={line("153")}>Tax year end</HeadWithLine>
							<HeadWithLine lineId={line("155")} align="right">Opening balance</HeadWithLine>
							<HeadWithLine lineId={line("159")} align="right">Adjustments</HeadWithLine>
							<HeadWithLine lineId={line("167")} align="right">Applied</HeadWithLine>
							<HeadWithLine lineId={line("169")} align="right">Closing balance</HeadWithLine>
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow className="bg-muted/30 hover:bg-muted/30">
							<TableCell className="font-medium">Current</TableCell>
							<TableCell colSpan={5} className="text-xs text-muted-foreground">
								Calculated automatically — see the current-year non-capital loss
								and carry-back entered above. Not entered here.
							</TableCell>
							<TableCell />
						</TableRow>
						{fields.length === 0 && (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={7}
									className="py-6 text-center text-sm text-muted-foreground"
								>
									No prior-year balances yet — click “Add prior-year row” to
									start.
								</TableCell>
							</TableRow>
						)}
						{fields.map((rhfField, index) => {
							const row = watched[index] ?? {};
							const beginning = toNum(row.balanceAtBeginning);
							const adjustments = toNum(row.adjustments);
							const applied = toNum(row.applied);
							const hasAny =
								beginning != null || adjustments != null || applied != null;
							const balanceAtEnd =
								(beginning ?? 0) + (adjustments ?? 0) - (applied ?? 0);
							return (
								<TableRow key={rhfField.id}>
									<TableCell>
										<YearSelect
											control={control}
											name={`nonCapitalVintages.${index}.yearsAgo`}
											options={YEARS_AGO_OPTIONS}
											formatLabel={(y) => `${ordinal(y)} preceding year`}
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
											name={`nonCapitalVintages.${index}.applied`}
										/>
									</TableCell>
									<TableCell className="text-right tabular-nums text-muted-foreground">
										{hasAny ? CURRENCY_FMT.format(balanceAtEnd) : "—"}
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
							<HeadWithLine lineId={line("181")}>Year of origin</HeadWithLine>
							<HeadWithLine lineId={line("183")} align="right">Farm losses</HeadWithLine>
							<HeadWithLine lineId={line("185")} align="right">Restricted farm</HeadWithLine>
							<HeadWithLine lineId={line("187")} align="right">LPP losses</HeadWithLine>
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
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
