"use client";

import { Pill } from "@classytic/fluid/client/pill";
import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import { Controller, type Control, type Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { at1Money } from "../at1-lines";
import type { LineValue, PaperFieldKind, PaperFieldRole, ResolveLine } from "../resolve-line";

/**
 * The shared visual primitives every paper Form View composes from — a
 * bordered "page block" per section, a leader-line row per field, and a
 * multi-column continuity grid for the pool-shaped schedules (21 today, the
 * same shape other AT1 continuity schedules will reuse later).
 *
 * These deliberately do NOT try to reproduce the printed PDF's exact pixel
 * layout — they reproduce its SHAPE: same section grouping, same line
 * numbers, same row order, editable boxes only where the guided editor
 * already collects the value. That's what makes a reviewer cross-checking
 * against the paper form recognize it, without turning every schedule into a
 * brittle pixel-positioned recreation of a form TRA can revise.
 */

export function PaperSection({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-lg border bg-card">
			<div className="border-b bg-muted/40 px-4 py-2">
				<h3 className="text-sm font-semibold">{title}</h3>
				{description && (
					<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
				)}
			</div>
			<div className="divide-y">{children}</div>
		</div>
	);
}

function formatReadOnly(kind: PaperFieldKind, value: string | number | undefined): string {
	if (value === undefined) return "";
	if (kind === "money" && typeof value === "number") return at1Money(value);
	if (kind === "flag") return value === "yes" ? "Yes" : value === "no" ? "No" : String(value);
	if (kind === "date" && typeof value === "string") {
		// `engagement.taxYearStart`/`taxYearEnd` (and any other client/engagement
		// date field) arrive as full ISO datetimes ("2025-08-31T00:00:00.000Z") —
		// a preparer reconciling against the form needs the calendar date, not
		// the wire format, and the untruncated string is long enough to wrap a
		// fixed-width box and collide with the row below it.
		const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
		return isoDate ?? value;
	}
	return String(value);
}

/** "code" (e.g. a CCA class number) and "text" (e.g. a corporation name) both take free text — every other kind is numeric. */
function isTextKind(kind: PaperFieldKind): boolean {
	return kind === "code" || kind === "text";
}

/** Small colored badge distinguishing WHY a line is read-only, with a tooltip explaining where the value actually comes from. */
function ProvenanceBadge({
	role,
	note,
	from,
	sourceLabel,
}: {
	role?: PaperFieldRole;
	note?: string;
	from?: { form: string; line: string; note?: string };
	sourceLabel?: string;
}) {
	if (!role || role === "input") return null;

	const isCarriedIn = role === "carried-in";
	const label = isCarriedIn ? sourceLabel || from?.form || "Carried in" : role === "total" ? "Total" : "Computed";
	const tooltip = isCarriedIn
		? [from?.form && `From ${from.form}${from.line ? ` line ${from.line}` : ""}`, from?.note]
				.filter(Boolean)
				.join(" — ") || sourceLabel || "Carried in from another schedule."
		: note || "Computed by the engine from this schedule's other lines.";

	return (
		<TooltipWrapper content={tooltip} side="top">
			<span className="inline-flex shrink-0">
				<Pill variant={isCarriedIn ? "secondary" : "outline"} className="cursor-help text-[10px]">
					{label}
				</Pill>
			</span>
		</TooltipWrapper>
	);
}

/**
 * One line: the number, the caption exactly as the form prints it, and a
 * boxed value — editable when `resolveLine` says this schedule owns it,
 * shaded and read-only otherwise. Never renders a computed/carried-in line
 * as an editable box, matching the same rule the card editor's generator
 * enforces (`emit-ui-schedule.ts`'s doc comment).
 *
 * `role`/`note`/`from` are the FIELD's own metadata (a generated layout's
 * `PaperField.role`/`.note`/`.from`) — optional so existing callers keep
 * working unchanged, but every schedule should pass them: they are what
 * lets a preparer tell "this is a real box I fill in" from "this is derived,
 * and here's the formula or the schedule it was carried in from" without
 * guessing from color alone.
 */
export function PaperLeaderRow<T extends Record<string, unknown>>({
	line,
	caption,
	kind,
	control,
	resolveLine,
	disabled,
	role,
	note,
	from,
}: {
	line: string;
	caption: string;
	kind: PaperFieldKind;
	control: Control<T>;
	resolveLine: ResolveLine;
	disabled?: boolean;
	role?: PaperFieldRole;
	note?: string;
	from?: { form: string; line: string; note?: string };
}) {
	const resolved: LineValue = resolveLine(line);

	return (
		<div className="flex items-center gap-3 px-4 py-2 text-sm">
			<span className="w-16 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-[11px] text-muted-foreground">
				{line}
			</span>
			<span className="min-w-0 flex-1 truncate" title={caption}>
				{caption}
			</span>
			{resolved.editable ? (
				kind === "flag" ? (
					<Controller
						control={control}
						name={resolved.name as Path<T>}
						render={({ field }) => (
							<div className="flex shrink-0 gap-3" role="radiogroup" aria-label={caption}>
								{(["yes", "no"] as const).map((opt) => (
									<label key={opt} className="flex items-center gap-1 text-xs">
										<input
											type="radio"
											name={`${resolved.name}-paper`}
											value={opt}
											disabled={disabled}
											checked={field.value === opt}
											onChange={() => field.onChange(opt)}
											className="disabled:cursor-not-allowed"
										/>
										{opt === "yes" ? "Yes" : "No"}
									</label>
								))}
							</div>
						)}
					/>
				) : (
					<Controller
						control={control}
						name={resolved.name as Path<T>}
						render={({ field }) => (
							<input
								type={kind === "date" ? "date" : kind === "money" || kind === "rate" ? "number" : "text"}
								inputMode={kind === "money" || kind === "rate" ? "decimal" : undefined}
								step={kind === "money" ? "1" : kind === "rate" ? "any" : undefined}
								disabled={disabled}
								aria-label={caption}
								className={cn(
									"h-8 w-36 shrink-0 rounded-md border border-l-2 border-input border-l-blue-500/60 bg-transparent px-1.5 text-right text-sm tabular-nums outline-none dark:border-l-blue-400/70",
									"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
									"disabled:cursor-not-allowed disabled:border-dashed disabled:border-l-2 disabled:bg-muted/50 disabled:opacity-50",
								)}
								value={(field.value as string | number | undefined) ?? ""}
								onChange={(e) => {
									const v = e.target.value;
									field.onChange(v === "" ? undefined : kind === "money" || kind === "rate" ? Number(v) : v);
								}}
								onBlur={field.onBlur}
							/>
						)}
					/>
				)
			) : (
				<span className="flex w-36 shrink-0 items-center justify-end gap-1.5">
					<TooltipWrapper
						content={formatReadOnly(kind, resolved.value) || "No value yet — compute the return, or this line has never been entered."}
						side="top"
						disabled={!formatReadOnly(kind, resolved.value)}
					>
						<span
							className={cn(
								"h-8 flex-1 overflow-hidden truncate rounded-md border border-dashed bg-muted/50 px-1.5 text-right text-sm tabular-nums leading-8 text-muted-foreground",
							)}
						>
							{formatReadOnly(kind, resolved.value) || "—"}
						</span>
					</TooltipWrapper>
				</span>
			)}
			{!resolved.editable && (
				<ProvenanceBadge role={role} note={note} from={from} sourceLabel={resolved.sourceLabel} />
			)}
		</div>
	);
}

/** One pool's continuity, as the shared grid renders it — see `Schedule21Pool` in the generated layout. */
export interface ContinuityPoolInput {
	key: string;
	label: string;
	rows: readonly { kind: string; caption: string; line: string; role: string }[];
}

/**
 * The pool-continuity grid: one row per continuity concept (opening balance,
 * applied, expired, …), one column per pool, blank cell where a pool has no
 * line for that concept — matching the real gaps in `AT1_SCHEDULE_21_POOLS`
 * (e.g. capital has no "losses expired" row). Generic over which app-side
 * field name each (pool, row-kind) pair maps to, via `fieldName` — the
 * schedule's own form-view owns that binding, this grid only lays it out.
 */
export function PaperContinuityGrid<T extends Record<string, unknown>>({
	pools,
	rowOrder,
	control,
	fieldName,
	disabled,
}: {
	pools: readonly ContinuityPoolInput[];
	/** Row kinds in print order — the union of every pool's row kinds, deduped. */
	rowOrder: readonly { kind: string; caption: string }[];
	control: Control<T>;
	/** `undefined` return means this (pool, row) has no app-side field — render a blank, non-editable cell. */
	fieldName: (poolKey: string, rowKind: string) => string | undefined;
	disabled?: boolean;
}) {
	return (
		<div className="overflow-x-auto rounded-lg border bg-card">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-b bg-muted/40">
						<th className="sticky left-0 min-w-[14rem] bg-muted/40 px-3 py-2 text-left font-medium">
							&nbsp;
						</th>
						{pools.map((p) => (
							<th key={p.key} className="min-w-[9rem] px-3 py-2 text-left font-medium">
								{p.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rowOrder.map((row) => (
						<tr key={row.kind} className="border-b last:border-b-0">
							<td className="sticky left-0 bg-card px-3 py-1.5 text-muted-foreground">
								{row.caption}
							</td>
							{pools.map((pool) => {
								const poolRow = pool.rows.find((r) => r.kind === row.kind);
								const name = poolRow ? fieldName(pool.key, row.kind) : undefined;
								return (
									<td key={pool.key} className="px-3 py-1.5">
										{!poolRow ? (
											<span className="block text-center text-muted-foreground">—</span>
										) : name ? (
											<Controller
												control={control}
												name={name as Path<T>}
												render={({ field }) => (
													<input
														type="number"
														inputMode="decimal"
														step="any"
														disabled={disabled || poolRow.role !== "input"}
														aria-label={`${pool.label} — ${row.caption}`}
														className={cn(
															"h-8 w-full rounded-md border border-input bg-transparent px-1.5 text-right text-sm tabular-nums outline-none",
															"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
															"disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50",
														)}
														value={(field.value as number | undefined) ?? ""}
														onChange={(e) =>
															field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
														}
														onBlur={field.onBlur}
													/>
												)}
											/>
										) : (
											<span className="block h-8 rounded-md border border-dashed bg-muted/50 text-center text-xs leading-8 text-muted-foreground">
												not collected
											</span>
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

/** One column of a class/type grid — a fixed field position every row shares. */
export interface ClassGridColumn {
	line: string;
	caption: string;
	kind: PaperFieldKind;
	/** The row object's field to bind, when this column is directly editable. Omitted = always read-only (computed/derived — see `resolveCell`). */
	fieldName?: string;
}

/** One conceptual row of a class/type grid. */
export interface ClassGridRow {
	key: string;
	label: string;
	/**
	 * Index into `arrayName`'s underlying array, or `undefined` when this row
	 * has no backing entry yet — e.g. Schedule 17's "bank reserves" before the
	 * preparer has added one. A row without an index can't be edited from the
	 * grid (there's nothing to bind to); it renders "not added" instead of a
	 * dashed placeholder, distinct from a genuinely blank collected value.
	 */
	arrayIndex: number | undefined;
}

/**
 * A grid whose ROWS come from a `useFieldArray`, not a fixed pool set —
 * Schedule 13 (one row per CCA class the preparer actually entered) and
 * Schedule 17 (one row per reserve KIND, matched by `type` against whatever
 * the preparer added to `reserves.rows` — see that schedule's own form-view
 * for how `rows` gets built with the right `arrayIndex` per kind).
 *
 * Unlike `PaperContinuityGrid`, most cells here are read-only by design: both
 * Schedule 13 and 17 collect only a couple of Alberta-specific override
 * fields per row, with the rest of the printed form's columns assumed equal
 * to federal (or computed by the engine) and shown via `resolveCell` instead
 * of a second, redundant editable copy.
 */
export function PaperClassGrid<T extends Record<string, unknown>>({
	arrayName,
	rows,
	columns,
	control,
	resolveCell,
	disabled,
}: {
	arrayName: string;
	rows: readonly ClassGridRow[];
	columns: readonly ClassGridColumn[];
	control: Control<T>;
	/** The read-only value for a cell with no `fieldName`, or whose row has no `arrayIndex`. */
	resolveCell: (row: ClassGridRow, column: ClassGridColumn) => string | number | undefined;
	disabled?: boolean;
}) {
	return (
		<div className="overflow-x-auto rounded-lg border bg-card">
			<table className="w-full border-collapse text-xs">
				<thead>
					<tr className="border-b bg-muted/40">
						<th className="sticky left-0 min-w-[10rem] bg-muted/40 px-3 py-2 text-left font-medium">
							&nbsp;
						</th>
						{columns.map((c) => (
							<th key={c.line} className="min-w-[7rem] px-2 py-2 text-left font-medium">
								<span className="block font-mono text-[10px] text-muted-foreground">{c.line}</span>
								{c.caption}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.key} className="border-b last:border-b-0">
							<td className="sticky left-0 bg-card px-3 py-1.5 text-muted-foreground">{row.label}</td>
							{columns.map((col) => {
								const editable = row.arrayIndex !== undefined && col.fieldName;
								const readOnlyText = formatReadOnly(col.kind, resolveCell(row, col));
								return (
									<td key={col.line} className="px-2 py-1.5">
										{editable ? (
											<Controller
												control={control}
												name={`${arrayName}.${row.arrayIndex}.${col.fieldName}` as Path<T>}
												render={({ field }) => (
													<input
														type={isTextKind(col.kind) ? "text" : "number"}
														inputMode={isTextKind(col.kind) ? undefined : "decimal"}
														step="any"
														disabled={disabled}
														aria-label={`${row.label} — ${col.caption}`}
														className={cn(
															"h-8 w-full min-w-[5.5rem] rounded-md border border-input bg-transparent px-1.5 text-sm tabular-nums outline-none",
															isTextKind(col.kind) ? "text-left" : "text-right",
															"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
															"disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50",
														)}
														value={(field.value as string | number | undefined) ?? ""}
														onChange={(e) => {
															const v = e.target.value;
															field.onChange(v === "" ? undefined : isTextKind(col.kind) ? v : Number(v));
														}}
														onBlur={field.onBlur}
													/>
												)}
											/>
										) : (
											<span
												className="block h-8 overflow-hidden truncate rounded-md border border-dashed bg-muted/50 px-1.5 text-right leading-8 text-muted-foreground"
												title={readOnlyText || undefined}
											>
												{readOnlyText || (row.arrayIndex === undefined ? "not added" : "—")}
											</span>
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
