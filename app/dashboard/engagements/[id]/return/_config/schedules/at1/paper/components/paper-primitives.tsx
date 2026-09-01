"use client";

import { Pill } from "@classytic/fluid/client/pill";
import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import { useEffect, useRef, useState } from "react";
import { Controller, type Control, type Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { at1Money } from "../at1-lines";
import type { LineValue, NavigateToLine, PaperFieldKind, PaperFieldRole, ResolveLine } from "../resolve-line";

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

/**
 * A schedule's own vendored TRA PDF, under `/tra-forms/` — a fixed, checked-in
 * copy in THIS repo's `public/` dir, not a cross-repo reference to
 * `research/sources/tra-forms/pdf/` (that directory lives outside every one of
 * the three independent repos here, including this one, so nothing in
 * `apps/web` can depend on it at build or run time). Add an entry when a
 * schedule's paper Form View is built; the source PDF is the same one already
 * cited in that schedule's `provenance.document`.
 */
const OFFICIAL_PDF: Record<string, string> = {
	AT1: "/tra-forms/AT1-jacket-TRA11722.pdf",
	AT1SCH1: "/tra-forms/AT1SCH01-small-business-deduction-TRA11723.pdf",
	AT1SCH2: "/tra-forms/AT1SCH02-income-allocation-factor-TRA11724.pdf",
	AT1SCH03: "/tra-forms/AT1SCH03-other-tax-deductions-credits-TRA11725.pdf",
	AT1SCH04: "/tra-forms/AT1SCH04-foreign-investment-income-tax-credit-TRA11728.pdf",
	AT1SCH10: "/tra-forms/AT1SCH10-loss-carryback-TRA11731.pdf",
	AT1SCH12: "/tra-forms/AT1SCH12-income-loss-reconciliation-TRA11732.pdf",
	AT1SCH13: "/tra-forms/AT1SCH13-cca-TRA11733.pdf",
	AT1SCH15: "/tra-forms/AT1SCH15-resource-related-deductions-TRA11736.pdf",
	AT1SCH17: "/tra-forms/AT1SCH17-reserves-TRA11738.pdf",
	AT1SCH20: "/tra-forms/AT1SCH20-charitable-donations-TRA11740.pdf",
	AT1SCH21: "/tra-forms/AT1SCH21-loss-continuity-TRA11741.pdf",
	AT1SCH29: "/tra-forms/AT1SCH29-innovation-employment-grant-TRA14637.pdf",
};

/** A small "View official PDF" link for a `PaperSection` header — `undefined` when this schedule has no vendored copy yet (see `OFFICIAL_PDF`). */
export function OfficialPdfLink({ formId }: { formId: string }) {
	const href = OFFICIAL_PDF[formId];
	if (!href) return null;
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
		>
			View official PDF
		</a>
	);
}

export function PaperSection({
	title,
	description,
	formId,
	children,
}: {
	title: string;
	description?: string;
	/** When set and a vendored PDF exists for it (see `OFFICIAL_PDF`), shows a "View official PDF" link in the header. */
	formId?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-lg border bg-card">
			<div className="flex items-start justify-between gap-3 border-b bg-muted/40 px-4 py-2">
				<div>
					<h3 className="text-sm font-semibold">{title}</h3>
					{description && (
						<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
					)}
				</div>
				{formId && <OfficialPdfLink formId={formId} />}
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
	to,
	onNavigate,
	sourceLabel,
}: {
	role?: PaperFieldRole;
	note?: string;
	from?: { form: string; line: string; note?: string };
	to?: { form: string; line: string; note?: string };
	onNavigate?: NavigateToLine;
	sourceLabel?: string;
}) {
	const fromBadge = (() => {
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
	})();

	if (!to) return fromBadge;

	const toLabel = `→ ${to.form} line ${to.line}`;
	const toTooltip = to.note || `Carries forward to ${to.form}, line ${to.line}.`;
	const toBadge = (
		<TooltipWrapper content={toTooltip} side="top">
			{onNavigate ? (
				<button
					type="button"
					onClick={() => onNavigate(to.form, to.line)}
					className="inline-flex shrink-0"
				>
					<Pill variant="outline" className="cursor-pointer text-[10px] hover:bg-accent">
						{toLabel}
					</Pill>
				</button>
			) : (
				<span className="inline-flex shrink-0">
					<Pill variant="outline" className="cursor-help text-[10px]">
						{toLabel}
					</Pill>
				</span>
			)}
		</TooltipWrapper>
	);

	return (
		<span className="inline-flex shrink-0 items-center gap-1">
			{fromBadge}
			{toBadge}
		</span>
	);
}

/**
 * Scrolls the row into view and briefly highlights it when `highlightLine`
 * (from a `ProvenanceBadge`'s "→ Schedule X" click, via `return-editor.tsx`'s
 * `onNavigate`) matches this row's own line — the "jump" half of jump +
 * highlight navigation. `highlightLine` clears itself in the parent after a
 * beat, so clicking the same cross-reference again re-triggers the effect.
 */
export function useLineHighlight<E extends HTMLElement>(line: string, highlightLine?: string) {
	const ref = useRef<E>(null);
	const [active, setActive] = useState(false);
	useEffect(() => {
		if (!highlightLine || highlightLine !== line) return;
		ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
		setActive(true);
		const t = setTimeout(() => setActive(false), 2000);
		return () => clearTimeout(t);
	}, [highlightLine, line]);
	return { ref, active };
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
	to,
	onNavigate,
	highlightLine,
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
	to?: { form: string; line: string; note?: string };
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const resolved: LineValue = resolveLine(line);
	const { ref, active } = useLineHighlight<HTMLDivElement>(line, highlightLine);

	return (
		<div
			ref={ref}
			className={cn(
				"flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-500",
				active && "bg-amber-100 dark:bg-amber-900/40",
			)}
		>
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
			{
				// The `to` cross-reference badge belongs on an EDITABLE row too — the
				// applied-against-income lines that carry to Schedule 12 are genuine
				// inputs in this app, not computed/carried-in figures. Only the
				// role-driven "Computed"/"Carried in" badge is read-only-specific.
				(to || !resolved.editable) && (
					<ProvenanceBadge
						role={role}
						note={note}
						from={from}
						to={to}
						onNavigate={onNavigate}
						sourceLabel={!resolved.editable ? resolved.sourceLabel : undefined}
					/>
				)
			}
		</div>
	);
}

/** One pool's continuity, as the shared grid renders it — see `Schedule21Pool` in the generated layout. */
export interface ContinuityPoolInput {
	key: string;
	label: string;
	rows: readonly {
		kind: string;
		caption: string;
		line: string;
		role: string;
		to?: { form: string; line: string; note?: string };
		note?: string;
	}[];
}

/** One cell of `PaperContinuityGrid` — its own component so `useLineHighlight` (a hook) can run per cell, not once for the whole grid. */
function ContinuityCell<T extends Record<string, unknown>>({
	pool,
	row,
	poolRow,
	name,
	control,
	disabled,
	onNavigate,
	highlightLine,
}: {
	pool: ContinuityPoolInput;
	row: { kind: string; caption: string };
	poolRow: ContinuityPoolInput["rows"][number] | undefined;
	name: string | undefined;
	control: Control<T>;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const { ref, active } = useLineHighlight<HTMLTableCellElement>(poolRow?.line ?? "", highlightLine);

	return (
		<td ref={ref} className={cn("px-3 py-1.5 transition-colors duration-500", active && "bg-amber-100 dark:bg-amber-900/40")}>
			{!poolRow ? (
				<TooltipWrapper content={`${pool.label} has no line for "${row.caption}" on the printed form — this pool's continuity genuinely skips this row.`} side="top">
					<span className="block cursor-help text-center text-muted-foreground">—</span>
				</TooltipWrapper>
			) : (
				<div className="space-y-0.5">
					<div className="flex items-center justify-between gap-1">
						<span className="font-mono text-[10px] text-muted-foreground">{poolRow.line}</span>
						{poolRow.to && (
							<ProvenanceBadge to={poolRow.to} onNavigate={onNavigate} />
						)}
					</div>
					{name ? (
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
									onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
									onBlur={field.onBlur}
								/>
							)}
						/>
					) : (
						<TooltipWrapper
							content={
								poolRow.note ||
								`This app doesn't collect ${pool.label.toLowerCase()} — ${row.caption.toLowerCase()} as its own entry yet — line ${poolRow.line} exists on the form but has no field here.`
							}
							side="top"
						>
							<span className="block h-8 cursor-help rounded-md border border-dashed bg-muted/50 text-center text-xs leading-8 text-muted-foreground">
								not collected
							</span>
						</TooltipWrapper>
					)}
				</div>
			)}
		</td>
	);
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
	onNavigate,
	highlightLine,
}: {
	pools: readonly ContinuityPoolInput[];
	/** Row kinds in print order — the union of every pool's row kinds, deduped. */
	rowOrder: readonly { kind: string; caption: string }[];
	control: Control<T>;
	/** `undefined` return means this (pool, row) has no app-side field — render a blank, non-editable cell. */
	fieldName: (poolKey: string, rowKind: string) => string | undefined;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
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
									<ContinuityCell
										key={pool.key}
										pool={pool}
										row={row}
										poolRow={poolRow}
										name={name}
										control={control}
										disabled={disabled}
										onNavigate={onNavigate}
										highlightLine={highlightLine}
									/>
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
										) : readOnlyText ? (
											<span
												className="block h-8 overflow-hidden truncate rounded-md border border-dashed bg-muted/50 px-1.5 text-right leading-8 text-muted-foreground"
												title={readOnlyText}
											>
												{readOnlyText}
											</span>
										) : (
											<TooltipWrapper
												content={
													row.arrayIndex === undefined
														? `${row.label} has not been added to this return yet -- there's no row to show a value for.`
														: `No value yet for ${row.label} -- ${col.caption.toLowerCase()}.`
												}
												side="top"
											>
												<span className="block h-8 cursor-help rounded-md border border-dashed bg-muted/50 text-center leading-8 text-muted-foreground">
													{row.arrayIndex === undefined ? "not added" : "—"}
												</span>
											</TooltipWrapper>
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
 * The form's own asterisked notes and filing-requirement text — from
 * `FormDefinition.footnotes` via a schedule's generated `_FOOTNOTES` export.
 * Form-wide guidance, not tied to one line, so a plain numbered list at the
 * foot of the section rather than a per-field tooltip.
 */
export function PaperFootnotes({ notes }: { notes: readonly string[] | undefined }) {
	if (!notes || notes.length === 0) return null;
	return (
		<ol className="space-y-1 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
			{notes.map((note, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static, generator-ordered content — never reordered at runtime
				<li key={i} className="flex gap-2">
					<span className="shrink-0 font-mono">*</span>
					<span>{note}</span>
				</li>
			))}
		</ol>
	);
}
