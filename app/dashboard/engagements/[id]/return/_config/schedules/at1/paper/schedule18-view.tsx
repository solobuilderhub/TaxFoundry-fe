"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import {
	type Control,
	Controller,
	useFieldArray,
	useWatch,
} from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type {
	AlbertaAbilEntry,
	AlbertaSchedule18Values,
} from "../../../../_lib/return-input";
import { cn } from "@/lib/utils";
import { formatSignedMoney, useLineHighlight } from "./components/paper-primitives";
import {
	AT1_SCHEDULE_18_ABIL_COLUMNS,
	AT1_SCHEDULE_18_ABIL_TOTALS_LABEL,
	AT1_SCHEDULE_18_BLOCK_HEADINGS,
	AT1_SCHEDULE_18_CATEGORIES,
	AT1_SCHEDULE_18_COLUMNS,
	AT1_SCHEDULE_18_FIELDS,
	AT1_SCHEDULE_18_FOOTNOTES,
	AT1_SCHEDULE_18_GRIDS,
	AT1_SCHEDULE_18_PRINTED_AFTER,
	AT1_SCHEDULE_18_SECTIONS,
	type Schedule18Category,
} from "./generated/schedule18.layout";
import { ReadOnlyScheduleView } from "./read-only-schedule-view";
import type { NavigateToLine } from "./resolve-line";

type Filed = ReadonlyMap<string, string | number>;

const lineId = (printed: string) => `018${printed}001`;
const numberAt = (filed: Filed, printed: string): number | undefined => {
	const v = filed.get(printed);
	return typeof v === "number" ? v : undefined;
};

/** The figure in one cell — the line-number chip the page prints, then its value. */
function GridCell({
	line,
	filed,
	highlightLine,
}: {
	line: string;
	filed: Filed;
	highlightLine?: string;
}) {
	const { ref, active } = useLineHighlight<HTMLDivElement>(
		lineId(line),
		highlightLine,
	);
	const value = numberAt(filed, line);
	return (
		<div
			ref={ref}
			className={cn(
				"flex items-center gap-2 px-2 py-1.5 transition-colors duration-500",
				active && "bg-amber-100 dark:bg-amber-900/40",
			)}
		>
			<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
				{line}
			</span>
			<span
				className={cn(
					"min-w-0 flex-1 truncate text-right text-sm tabular-nums",
					value !== undefined && value < 0
						? "text-red-600 dark:text-red-400"
						: "text-muted-foreground",
				)}
			>
				{value !== undefined ? formatSignedMoney(value) : "—"}
			</span>
		</div>
	);
}

/**
 * The shares row's column D, which the page prints in a box with NO line number.
 *
 * Not a filed figure and not invented either — it is the arithmetic the column
 * heading states, over the three numbered cells on its own row. It has to be
 * shown: line 054 below the grid is this plus line 053, and a preparer who
 * cannot see it cannot check that addition. Marked as derived so it is never
 * mistaken for something the return transmits.
 */
function UnnumberedGainCell({
	category,
	filed,
}: {
	category: Schedule18Category;
	filed: Filed;
}) {
	const a = numberAt(filed, category.proceeds);
	const b = numberAt(filed, category.adjustedCostBase);
	const c = numberAt(filed, category.outlays);
	const value =
		a === undefined && b === undefined && c === undefined
			? undefined
			: (a ?? 0) - ((b ?? 0) + (c ?? 0));
	return (
		<TooltipWrapper
			content={`Line ${category.proceeds} minus (line ${category.adjustedCostBase} + line ${category.outlays}). The form prints this box without a line number — it is not transmitted. Line 054 below is this amount plus line 053.`}
			side="top"
		>
			<div className="flex cursor-help items-center justify-end px-2 py-1.5">
				<span
					className={cn(
						"truncate text-right text-sm tabular-nums",
						value !== undefined && value < 0
							? "text-red-600 dark:text-red-400"
							: "text-muted-foreground",
					)}
				>
					{value !== undefined ? formatSignedMoney(value) : "—"}
				</span>
			</div>
		</TooltipWrapper>
	);
}

/** One of the page's two four-column tables. */
function DispositionGrid({
	gridId,
	filed,
	highlightLine,
}: {
	gridId: "shares" | "properties";
	filed: Filed;
	highlightLine?: string;
}) {
	const grid = AT1_SCHEDULE_18_GRIDS.find((g) => g.id === gridId);
	const rows = AT1_SCHEDULE_18_CATEGORIES.filter((c) => c.grid === gridId);
	if (!grid || rows.length === 0) return null;

	return (
		<div className="overflow-x-auto px-4 py-3">
			<table className="w-full min-w-[46rem] border-separate border-spacing-0 text-sm">
				<thead>
					<tr>
						<th className="w-[30%] border-b px-2 pb-1 text-left align-bottom text-xs font-medium text-muted-foreground">
							Description
						</th>
						{AT1_SCHEDULE_18_COLUMNS.map((col) => (
							<th
								key={col.column}
								className="border-b px-2 pb-1 text-center align-bottom"
							>
								<span className="block text-sm font-semibold">
									{col.column}
								</span>
								<span className="block text-[11px] font-normal leading-tight text-muted-foreground">
									{/*
									 * Column D only: the two grids head it
									 * differently — the shares grid prints the
									 * arithmetic alone, the properties grid puts
									 * "Gain or (loss)" above it. A/B/C are headed
									 * identically on both.
									 */}
									{col.key === "gainOrLoss" ? grid.gainHeading : col.heading}
								</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.label}>
							<td className="border-b px-2 py-1.5 align-middle">
								<span className="inline-flex items-center gap-1.5">
									<span>{row.label}</span>
									{row.footnoteMarks?.map((i) => (
										<TooltipWrapper
											key={i}
											content={AT1_SCHEDULE_18_FOOTNOTES[i]}
											side="top"
										>
											<span className="cursor-help font-mono text-xs text-muted-foreground">
												*
											</span>
										</TooltipWrapper>
									))}
									{row.restrictionNote && (
										<TooltipWrapper content={row.restrictionNote} side="top">
											<span className="cursor-help rounded-full border px-1.5 text-[10px] leading-4 text-muted-foreground">
												?
											</span>
										</TooltipWrapper>
									)}
								</span>
							</td>
							{AT1_SCHEDULE_18_COLUMNS.map((col) => {
								const line = row[col.key];
								return (
									<td key={col.column} className="border-b align-middle">
										{line ? (
											<GridCell
												line={line}
												filed={filed}
												highlightLine={highlightLine}
											/>
										) : (
											// Shares' column D — unnumbered on the page.
											<UnnumberedGainCell category={row} filed={filed} />
										)}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/**
 * A line the page prints BETWEEN the two grids, right-aligned under column D:
 * 053 (the federal Schedule 6 addition) and 054 (the shares gain it feeds).
 */
function BetweenGridsRow({
	line,
	caption,
	filed,
	highlightLine,
	note,
}: {
	line: string;
	caption: string;
	filed: Filed;
	highlightLine?: string;
	note?: string;
}) {
	const { ref, active } = useLineHighlight<HTMLDivElement>(
		lineId(line),
		highlightLine,
	);
	const value = numberAt(filed, line);
	return (
		<div
			ref={ref}
			className={cn(
				"flex items-center justify-end gap-3 px-4 py-1.5 text-sm transition-colors duration-500",
				active && "bg-amber-100 dark:bg-amber-900/40",
			)}
		>
			<TooltipWrapper content={note} side="top" disabled={!note}>
				<span className={cn("font-medium", note && "cursor-help")}>
					{caption}
				</span>
			</TooltipWrapper>
			<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
				{line}
			</span>
			<span
				className={cn(
					"w-28 shrink-0 truncate text-right tabular-nums",
					value !== undefined && value < 0
						? "text-red-600 dark:text-red-400"
						: "text-muted-foreground",
				)}
			>
				{value !== undefined ? formatSignedMoney(value) : "—"}
			</span>
		</div>
	);
}

/** Which `AlbertaAbilEntry` field each printed line binds to. */
const ABIL_FIELD: Record<string, keyof AlbertaAbilEntry> = {
	"082": "name",
	"084": "kind",
	"086": "dateOfAcquisition",
	"088": "proceeds",
	"090": "acb",
	"092": "outlays",
};

const n = (v: unknown) => (typeof v === "number" ? v : 0);

/** Column D for one row — the page strikes it per row and numbers it nowhere. */
const rowLoss = (e: AlbertaAbilEntry | undefined): number | undefined => {
	if (!e) return undefined;
	if (
		e.proceeds === undefined &&
		e.acb === undefined &&
		e.outlays === undefined
	)
		return undefined;
	return n(e.proceeds) - (n(e.acb) + n(e.outlays));
};

const CELL =
	"h-8 w-full rounded-md border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50";

/** One editable cell, bound to `abilEntries.<index>.<field>`. */
function AbilCell({
	control,
	index,
	line,
	disabled,
}: {
	control: Control<AlbertaSchedule18Values>;
	index: number;
	line: string;
	disabled?: boolean;
}) {
	const field = ABIL_FIELD[line];
	if (!field) return null;
	return (
		<Controller
			control={control}
			name={`abilEntries.${index}.${field}` as const}
			render={({ field: f }) => {
				const value = (f.value as string | number | undefined) ?? "";
				/*
				 * 084 is a SELECT, not a text box. The page prints "Specify: 1 =
				 * shares or 2 = debt" and files the digit, but the stored value is
				 * the word — `schedule18Values` maps shares→1, debt→2 at the filing
				 * boundary. Typing "1" here would store the string "1", which is
				 * neither of the two values the contract allows.
				 */
				if (line === "084")
					return (
						<select
							{...f}
							value={String(value)}
							disabled={disabled}
							aria-label="Specify: shares or debt"
							className={cn(CELL, "text-left")}
						>
							<option value="">—</option>
							<option value="shares">1 — Shares</option>
							<option value="debt">2 — Debt</option>
						</select>
					);
				const isText = line === "082";
				const isDate = line === "086";
				return (
					<input
						type={isDate ? "date" : isText ? "text" : "number"}
						inputMode={isDate || isText ? undefined : "decimal"}
						step="any"
						disabled={disabled}
						aria-label={`Row ${index + 1} — line ${line}`}
						className={cn(CELL, isDate || isText ? "text-left" : "text-right")}
						value={value}
						onChange={(e) =>
							f.onChange(
								e.target.value === ""
									? undefined
									: isDate || isText
										? e.target.value
										: Number(e.target.value),
							)
						}
						onBlur={f.onBlur}
					/>
				);
			}}
		/>
	);
}

/**
 * The ABIL table — the form's one REPEATING block, one row per small business
 * corporation, with rows added and removed here.
 *
 * ── Why not `PaperClassGrid` ────────────────────────────────────────────────
 *
 * That primitive is what Schedules 13/17/8/50/5 use, and it was the first thing
 * tried here. It renders a `useFieldArray`-backed grid but has no way to append
 * or remove a row — Schedule 13's view says so in as many words ("add one in
 * Guided view first"), because a CCA class is a fixed pool the preparer picks
 * from. An ABIL row is not: the page prints a numbered, growable list, and
 * sending a preparer to another view to add one is a worse form than the paper.
 *
 * Column D is the other reason this is not the flat field list: the page strikes
 * a loss per row, numbers it nowhere, and totals the column into line 094.
 * Without it a preparer sees 094 with nothing behind it.
 */
function AbilTable({
	control,
	disabled,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
}) {
	const abilControl = control as unknown as Control<AlbertaSchedule18Values>;
	const { fields, append, remove } = useFieldArray({
		control: abilControl,
		name: "abilEntries",
	});
	// The totals row and column D have to move as the cells are typed into, so
	// they read the watched array rather than `fields` (which only changes shape).
	const entries = useWatch({ control: abilControl, name: "abilEntries" }) ?? [];
	const total = entries.reduce((sum, e) => sum + (rowLoss(e) ?? 0), 0);

	return (
		<div className="space-y-3 px-4 py-3">
			<div className="overflow-x-auto rounded-lg border bg-card">
				<table className="w-full border-collapse text-xs">
					<thead>
						<tr className="border-b bg-muted/40">
							<th className="w-10 px-2 py-2 text-right font-medium text-muted-foreground">
								&nbsp;
							</th>
							{AT1_SCHEDULE_18_ABIL_COLUMNS.map((c) => (
								<th
									key={c.line ?? "d"}
									className="min-w-[8rem] px-2 py-2 text-left align-bottom font-medium"
								>
									{/*
									 * The page heads each column with its letter on one line
									 * and the heading beneath it — reproduced here, rather
									 * than the "A - Proceeds of disposition" of §3.2.3.19's
									 * Line Names, because this view is the printed page.
									 */}
									{c.column && (
										<span className="block text-center text-sm font-semibold">
											{c.column}
										</span>
									)}
									<span className="block leading-tight">{c.heading}</span>
									{c.line ? (
										<span className="mt-0.5 block w-fit rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
											{c.line}
										</span>
									) : (
										<TooltipWrapper
											content="Struck per row and numbered nowhere on the form. Totalled into line 094, which applies the inclusion rate."
											side="top"
										>
											<span className="mt-0.5 block w-fit cursor-help font-mono text-[10px] text-muted-foreground">
												(no line)
											</span>
										</TooltipWrapper>
									)}
								</th>
							))}
							<th className="w-10 px-2 py-2">&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{fields.map((row, i) => {
							const loss = rowLoss(entries[i]);
							return (
								<tr key={row.id} className="border-b last:border-b-0">
									<td className="px-2 py-1.5 text-right text-muted-foreground">
										{i + 1}.
									</td>
									{AT1_SCHEDULE_18_ABIL_COLUMNS.map((c) => (
										<td key={c.line ?? "d"} className="px-2 py-1.5">
											{c.line ? (
												<AbilCell
													control={abilControl}
													index={i}
													line={c.line}
													disabled={disabled}
												/>
											) : (
												<span
													className={cn(
														"block h-8 truncate rounded-md border border-dashed bg-muted/50 px-1.5 text-right leading-8 tabular-nums",
														loss !== undefined && loss < 0
															? "text-red-600 dark:text-red-400"
															: "text-muted-foreground",
													)}
												>
													{loss !== undefined ? formatSignedMoney(loss) : "—"}
												</span>
											)}
										</td>
									))}
									<td className="px-2 py-1.5 text-center">
										<button
											type="button"
											onClick={() => remove(i)}
											disabled={disabled}
											aria-label={`Remove row ${i + 1}`}
											title={`Remove row ${i + 1}`}
											className="rounded-md border px-1.5 py-0.5 text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
										>
											✕
										</button>
									</td>
								</tr>
							);
						})}
						{fields.length === 0 && (
							<tr>
								<td
									colSpan={AT1_SCHEDULE_18_ABIL_COLUMNS.length + 2}
									className="px-3 py-4 text-center text-muted-foreground"
								>
									No small business corporations yet. An ABIL is a capital loss
									on one of them — add a row for each.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between gap-3">
				<button
					type="button"
					onClick={() => append({})}
					disabled={disabled}
					className="rounded-md border px-2.5 py-1 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
				>
					+ Add a corporation
				</button>
				{fields.length > 0 && (
					<span className="flex items-center gap-3 text-sm">
						<span className="font-medium">
							{AT1_SCHEDULE_18_ABIL_TOTALS_LABEL}
						</span>
						<span
							className={cn(
								"w-28 text-right tabular-nums",
								total < 0
									? "text-red-600 dark:text-red-400"
									: "text-muted-foreground",
							)}
						>
							{formatSignedMoney(total)}
						</span>
					</span>
				)}
			</div>
		</div>
	);
}

/** Every printed line the ABIL table renders. 094 stays an ordinary row below it. */
const ABIL_LINES = AT1_SCHEDULE_18_ABIL_COLUMNS.flatMap((c) =>
	c.line ? [c.line] : [],
);

/*
 * Every printed line the grid block renders, so the flat list below drops them.
 *
 * Derived from the category table rather than listed by hand — a category
 * added to `schedule18.ts` would otherwise render twice, once in the grid and
 * once as a leftover row, and nothing would fail to say so.
 */
const GRID_LINES = [
	...AT1_SCHEDULE_18_CATEGORIES.flatMap((c) =>
		[c.proceeds, c.adjustedCostBase, c.outlays, c.gainOrLoss].filter(
			(l): l is string => Boolean(l),
		),
	),
	"053",
	"054",
];

/**
 * AT1 Schedule 18 — Alberta dispositions of capital property, as TRA prints
 * it: the disposition grids and their adjustments under the page-1 heading
 * "CAPITAL PROPERTY DISPOSITIONS", then the ABIL block on page 2.
 *
 * Read-only, like Schedule 12's. Most of this schedule is built from the SAME
 * rows the federal Capital Gains (S6) schedule already collects, tagged with
 * an Alberta category so nothing is typed twice — there is nothing here for a
 * preparer to edit. The one exception is the ABIL section, which has no
 * federal counterpart in this engine and is entered on its own guided
 * schedule (`alberta-schedule18.ts`); this view is where those entries are
 * checked against the printed form before filing.
 *
 * ── Why the dispositions block is a grid and not a list ─────────────────────
 *
 * The page numbers its four columns in four separate BANDS — 002-012 down
 * column A, 022-032 down column B, 042-052 down column C — so a view that
 * lists fields in line order shows all six proceeds figures, then all six cost
 * bases, and never puts a row of the table together. The rows are the form.
 *
 * There are two tables, not one: shares have a table of their own whose column
 * D carries no line number at all, and between the two sit lines 053 and 054 —
 * the shares gain is struck below the grid, *after* federal Schedule 6 line 160
 * is added in. Drawing all six categories as one table prints one grid's column
 * D heading over the other's rows and hides that addition entirely.
 *
 * ── Why the source PDF cannot be rendered beside this ───────────────────────
 *
 * `AT1SCH18-dispositions-TRA15156.pdf` is a DYNAMIC XFA form: its PDF pages
 * carry only Adobe's "requires Adobe Reader 8 or higher" placeholder, so the
 * "View official PDF" link opens that placeholder rather than the form. The
 * captions below come from the XFA template stream instead — extracted, and
 * checked in with the command to reproduce it, at
 * `research/sources/tra-forms/xfa/`. This view is therefore the closest thing
 * to the printed page a preparer can actually see.
 */
export function Schedule18View({
	control,
	disabled,
	computed,
	stale,
	onNavigate,
	highlightLine,
}: {
	/** The ABIL rows are this schedule's OWN slice, so they bind and save here. */
	control?: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	stale?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const byLine = new Map(
		AT1_SCHEDULE_18_FIELDS.map((f) => [f.line.slice(3, 6), f] as const),
	);
	/*
	 * The ABIL table reads the FORM array, not the last computed payload.
	 *
	 * `ReadOnlyScheduleView` keys its value map on the printed line alone, which
	 * is right for all of page 1 (every line there occurs once) and wrong for a
	 * repeating block — five corporations file five 082s and the last would win.
	 * But the table sidesteps that entirely by binding to `abilEntries`: these
	 * cells are editable, so what the preparer has typed is the truth, and a
	 * figure from the previous compute would silently overwrite an unsaved edit.
	 */
	return (
		<ReadOnlyScheduleView
			scheduleId="018"
			formId="AT1SCH18"
			sections={AT1_SCHEDULE_18_SECTIONS}
			footnotes={AT1_SCHEDULE_18_FOOTNOTES}
			fields={AT1_SCHEDULE_18_FIELDS}
			grids={(filed) => [
				{
					anchor: "002",
					lines: GRID_LINES,
					node: (
						<div className="divide-y">
							<DispositionGrid
								gridId="shares"
								filed={filed}
								highlightLine={highlightLine}
							/>
							<div className="py-1">
								{(["053", "054"] as const).map((line) => (
									<BetweenGridsRow
										key={line}
										line={line}
										caption={byLine.get(line)?.caption ?? line}
										note={byLine.get(line)?.note}
										filed={filed}
										highlightLine={highlightLine}
									/>
								))}
							</div>
							<DispositionGrid
								gridId="properties"
								filed={filed}
								highlightLine={highlightLine}
							/>
						</div>
					),
				},
				/*
				 * The ABIL table, anchored at its first line. Only when `control`
				 * is present: it binds to this schedule's own `abilEntries`, and
				 * without a form there is nothing to bind — the flat rows below
				 * still show 082-092 in that case, which is the honest fallback.
				 */
				...(control
					? [
							{
								anchor: "082",
								lines: ABIL_LINES,
								node: (
									<AbilTable control={control} disabled={disabled} />
								),
							},
						]
					: []),
			]}
			printedAfter={AT1_SCHEDULE_18_PRINTED_AFTER}
			blockHeadings={AT1_SCHEDULE_18_BLOCK_HEADINGS}
			computed={computed}
			stale={stale}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			notComputedMessage="Not yet computed — the form below is Schedule 18 as TRA prints it; its figures appear once you compute the return."
			nothingToReportMessage="Computed, and Schedule 18 was not filed. TRA permits it only when the AT1 jacket declares a federal/Alberta difference (line 060 or 061), and the return declares none — so there are no Alberta dispositions to reconcile."
		/>
	);
}
