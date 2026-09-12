"use client";

import {
	type Control,
	Controller,
	useFieldArray,
	useWatch,
} from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import { cn } from "@/lib/utils";
import type {
	AlbertaDonationCarryforwardRow,
	AlbertaDonationsValues,
} from "../../../../_lib/return-input";
import { at1Money, parseAt1LineItemId } from "./at1-lines";
import { PaperFootnotes, PaperLeaderRow, PaperSection } from "./components/paper-primitives";
import { AT1_SCHEDULE_20_FIELDS, AT1_SCHEDULE_20_FOOTNOTES, AT1_SCHEDULE_20_SECTIONS } from "./generated/schedule20.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "020";

/**
 * Own editable fields, by 3-digit line — everything with no federal
 * equivalent (Schedule 21's own pattern: only what genuinely cannot be
 * derived from elsewhere is an override). Charitable's opening (002) and
 * current-year (010) come from the federal donations schedule instead —
 * read-only here, sourced from the last computed return, same as any other
 * carried-in figure this product doesn't re-collect on a second schedule.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaDonationsValues>> = {
	"004": "charitableExpired",
	"008": "charitableTransferredIn",
	"013": "charitableAcquisitionOfControlAdjustment",
	"016": "charitableApplied",
	"062": "giftsOpening",
	"064": "giftsExpired",
	"068": "giftsTransferredIn",
	"070": "giftsCurrentYear",
	"073": "giftsAcquisitionOfControlAdjustment",
	"076": "giftsApplied",
	"032": "taxableCapitalGainsOnGifts",
	"034": "deemedGiftGains",
	"036": "recaptureOnGifts",
	"038": "proceedsNetOfOutlays",
	"040": "capitalCost",
	// 090-100 are NOT here: they are rows of `carryforwardRows`, one per year of
	// origin, rendered by `CarryforwardTable` rather than as leader rows.
};

/** Which field of a `carryforwardRows` row each printed column binds to. */
const CARRYFORWARD_FIELD: Record<string, keyof AlbertaDonationCarryforwardRow> = {
	"090": "yearOfOrigin",
	"092": "charitable",
	"094": "toCanadaOrProvince",
	"096": "culturalProperty",
	"098": "ecologicalLand",
	"100": "medicine",
};

const CF_CELL =
	"h-8 w-full rounded-md border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50";

/**
 * Lines 090-100 — carryforward available by year of origin.
 *
 * A TABLE, because that is what the page prints: six numbered rows across six
 * columns, with a "Totals:" line beneath. It was six leader rows, one per
 * column, which could describe exactly one year — and the block's whole
 * purpose is showing which year each balance came from, and therefore what
 * expires when.
 *
 * Column headings come from the field captions, so they cannot drift from the
 * definition; the letters/numbers above them are the page's own column numbers
 * 1-6 (this block numbers its columns rather than lettering them).
 */
function CarryforwardTable({
	printed,
	control,
	disabled,
}: {
	printed: readonly { line: string; caption: string; kind: string }[];
	control: Control<AlbertaDonationsValues>;
	disabled?: boolean;
}) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: "carryforwardRows",
	});
	const rows = useWatch({ control, name: "carryforwardRows" }) ?? [];
	const n = (v: unknown) => (typeof v === "number" ? v : 0);

	return (
		<div className="space-y-3 px-4 py-3">
			<div className="overflow-x-auto rounded-lg border bg-card">
				<table className="w-full border-collapse text-xs">
					<thead>
						<tr className="border-b bg-muted/40">
							<th className="w-10 px-2 py-2 text-right font-medium">&nbsp;</th>
							{printed.map((f, i) => (
								<th
									key={f.line}
									className="min-w-[9rem] px-2 py-2 text-left align-bottom font-medium"
								>
									<span className="block text-center text-sm font-semibold">
										{i + 1}
									</span>
									<span className="block leading-tight">{f.caption}</span>
									<span className="mt-0.5 block w-fit rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
										{f.line}
									</span>
								</th>
							))}
							<th className="w-10 px-2 py-2">&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{fields.map((row, i) => (
							<tr key={row.id} className="border-b">
								<td className="px-2 py-1.5 text-right text-muted-foreground">
									{i + 1}.
								</td>
								{printed.map((f) => {
									const name =
										`carryforwardRows.${i}.${CARRYFORWARD_FIELD[f.line]}` as const;
									const isDate = f.kind === "date";
									return (
										<td key={f.line} className="px-2 py-1.5">
											<Controller
												control={control}
												name={name}
												render={({ field: bound }) => (
													<input
														type={isDate ? "date" : "number"}
														inputMode={isDate ? undefined : "decimal"}
														step="any"
														disabled={disabled}
														aria-label={`Row ${i + 1} — line ${f.line}`}
														className={cn(
															CF_CELL,
															isDate ? "text-left" : "text-right",
														)}
														value={
															(bound.value as string | number | undefined) ?? ""
														}
														onChange={(e) =>
															bound.onChange(
																e.target.value === ""
																	? undefined
																	: isDate
																		? e.target.value
																		: Number(e.target.value),
															)
														}
														onBlur={bound.onBlur}
													/>
												)}
											/>
										</td>
									);
								})}
								<td className="px-2 py-1.5 text-center">
									<button
										type="button"
										onClick={() => remove(i)}
										disabled={disabled}
										aria-label={`Remove row ${i + 1}`}
										className="rounded-md border px-1.5 py-0.5 text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
									>
										✕
									</button>
								</td>
							</tr>
						))}
						{fields.length === 0 && (
							<tr>
								<td
									colSpan={printed.length + 2}
									className="px-3 py-4 text-center text-muted-foreground"
								>
									No years of origin recorded. Optional — most filings leave
									this block blank.
								</td>
							</tr>
						)}
						{/*
						 * The "Totals:" line the page prints under the grid. Blank under
						 * the year column: a total of dates is not a figure.
						 */}
						{fields.length > 0 && (
							<tr className="bg-muted/30">
								<td className="px-2 py-1.5 text-right font-medium">Totals:</td>
								{printed.map((f) => (
									<td
										key={f.line}
										className="px-2 py-1.5 text-right tabular-nums text-muted-foreground"
									>
										{f.kind === "date"
											? ""
											: at1Money(
													rows.reduce(
														(sum, r) =>
															sum +
															n(
																r?.[
																	CARRYFORWARD_FIELD[
																		f.line
																	] as keyof typeof r
																],
															),
														0,
													),
												)}
									</td>
								))}
								<td />
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<button
				type="button"
				onClick={() => append({})}
				disabled={disabled}
				className="rounded-md border px-2.5 py-1 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
			>
				+ Add a year of origin
			</button>
		</div>
	);
}

function buildResolveLine(computed: ComputedReturn | undefined): ResolveLine {
	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	return (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		const ownName = OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		const value = filedByField.get(field) as string | number | undefined;
		const sourceLabel = field === "002" || field === "010" ? "Donations & Gifts (S2)" : undefined;
		return { editable: false, value, sourceLabel };
	};
}

/**
 * AT1 Schedule 20 paper Form View — two independent 10-row donation
 * continuities (charitable, gifts), the Area B maximum-deduction
 * calculation, and the carryforward-by-category block (090-100). Rendered
 * as flat leader-line sections rather than
 * `PaperContinuityGrid` deliberately: unlike Schedule 21's five loss pools
 * (which share one editable field shape per row), charitable's opening and
 * current-year lines are read-only carry-ins from a DIFFERENT schedule
 * while the rest of the row is editable — a mix the grid primitive doesn't
 * model, so each pool gets its own section instead.
 */
export function Schedule20FormView({
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
	const donationsControl = control as unknown as Control<AlbertaDonationsValues>;
	const resolveLine = buildResolveLine(computed);

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_20_SECTIONS.map((section, i) => {
				const fields = AT1_SCHEDULE_20_FIELDS.filter((f) => f.section === section.id);
				if (fields.length === 0) return null;
				const card = (
					<PaperSection
						key={section.id}
						title={section.title}
						description={section.description}
						formId={i === 0 ? "AT1SCH20" : undefined}
					>
						{/*
						 * 090-100 is a grid on the page, not a list of lines — six
						 * numbered rows over six columns with a "Totals:" line
						 * beneath. Every other section here really is a column of
						 * leader rows.
						 */}
						{section.id === "carryforward" ? (
							<CarryforwardTable
								printed={fields.map((f) => ({
									line: parseAt1LineItemId(f.line)?.field ?? f.line,
									caption: f.caption,
									kind: f.kind,
								}))}
								control={donationsControl}
								disabled={disabled}
							/>
						) : (
							fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={parseAt1LineItemId(f.line)?.field ?? f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								to={f.to}
								onNavigate={onNavigate}
								highlightLine={highlightLine}
								control={donationsControl}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
							))
						)}
					</PaperSection>
				);
				if (!section.printedBefore) return card;
				/*
				 * Printed text the page sets BETWEEN two blocks — outside both
				 * cards, because it belongs to neither. On this schedule it is
				 * the medicine-gift instruction between the gifts continuity
				 * and the carryforward table, and what it says is that the
				 * claim does not go on this form at all. Inside the card below
				 * it, it would read as guidance about that table.
				 */
				return (
					<div key={section.id} className="space-y-4">
						<p className="px-1 text-sm font-semibold">
							{section.printedBefore}
						</p>
						{card}
					</div>
				);
			})}
			<PaperFootnotes notes={AT1_SCHEDULE_20_FOOTNOTES} />
		</div>
	);
}
