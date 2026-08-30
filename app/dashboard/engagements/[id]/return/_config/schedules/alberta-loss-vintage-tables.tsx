"use client";

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
import type { AlbertaContinuityValues } from "../../_lib/return-input";

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
}: FieldComponentProps<AlbertaContinuityValues>) {
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
							<TableHead>Partnership</TableHead>
							<TableHead className="text-right">Opening balance</TableHead>
							<TableHead className="text-right">Wind-up transfer</TableHead>
							<TableHead className="text-right">Current-year loss</TableHead>
							<TableHead className="text-right">Applied</TableHead>
							<TableHead className="text-right">Closing balance</TableHead>
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
							<TableHead>Year of origin</TableHead>
							<TableHead>Tax year end</TableHead>
							<TableHead className="text-right">Opening balance</TableHead>
							<TableHead className="text-right">Adjustments</TableHead>
							<TableHead className="text-right">Applied</TableHead>
							<TableHead className="text-right">Closing balance</TableHead>
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
							<TableHead>Year of origin</TableHead>
							<TableHead className="text-right">Farm losses</TableHead>
							<TableHead className="text-right">Restricted farm</TableHead>
							<TableHead className="text-right">LPP losses</TableHead>
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
