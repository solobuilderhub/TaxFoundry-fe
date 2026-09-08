"use client";

import { Pill } from "@classytic/fluid/client/pill";
import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import { Fragment, useEffect, useRef, useState } from "react";
import { Controller, type Control, type Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { at1Money, parseAt1LineItemId } from "../at1-lines";
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
	T2SCH1: "/cra-forms/T2SCH01-net-income-for-tax.pdf",
	T2SCH8: "/cra-forms/T2SCH08-cca.pdf",
	T2SCH2: "/cra-forms/T2SCH02-donations.pdf",
	T2SCH13: "/cra-forms/T2SCH13-continuity-of-reserves.pdf",
	T2SCH50: "/cra-forms/T2SCH50-shareholders.pdf",
	T2SCH5: "/cra-forms/T2SCH05-provincial-tax.pdf",
	T2SCH33: "/cra-forms/T2SCH33-taxable-capital.pdf",
	T2SCH31: "/cra-forms/T2SCH31-sred-itc.pdf",
	T2: "/cra-forms/T2-jacket.pdf",
	T2SCH130: "/cra-forms/T2SCH130-eifel.pdf",
	T2SCH4: "/cra-forms/T2SCH04-loss-continuity.pdf",
	T2SCH3: "/cra-forms/T2SCH03-dividends-part-iv.pdf",
	T2SCH24: "/cra-forms/T2SCH24-first-return.pdf",
	T2SCH6: "/cra-forms/T2SCH06-capital-gains.pdf",
	T2SCH21: "/cra-forms/T2SCH21-foreign-tax-credits.pdf",
	T2SCH43: "/cra-forms/T2SCH43-part-vi-1.pdf",
	T2SCH88: "/cra-forms/T2SCH88-internet-business.pdf",
	T2SCH100: "/cra-forms/T2SCH100-balance-sheet.pdf",
	T2SCH125: "/cra-forms/T2SCH125-income-statement.pdf",
	T2SCH141: "/cra-forms/T2SCH141-gifi-notes.pdf",
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

/**
 * `<input type="date">` requires exactly `YYYY-MM-DD` — a full ISO datetime
 * ("2025-08-31T00:00:00.000Z", written by older saves or by the engagement's
 * own `taxYearStart`/`taxYearEnd` fields) makes the native picker silently
 * render blank even though a real value is stored. Used on every EDITABLE
 * date input's `value` binding, not just the read-only formatter below.
 */
function dateInputValue(value: string | number | undefined): string {
	if (typeof value !== "string") return "";
	return value.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? value;
}

/**
 * Most lines on a TRA-certified form are "+" only (per the spec's own +/-
 * column, e.g. AT1-Chapter3 §3.2.3.21) — a handful, like Schedule 21's own
 * net-income and current-year-loss lines, are genuinely `+/-` and can be
 * negative. `at1Money`'s plain `Intl.NumberFormat` already prefixes a
 * negative with "-$", so a negative value was never silently shown as
 * positive — this is a readability upgrade (the standard accounting
 * parentheses convention, easier to spot at a glance than a leading minus
 * sitting between a dash-bordered box and small text) applied uniformly to
 * every computed/carried-in read-only money value, not a per-field
 * `signConvention` audited against each schedule's own +/- column — that
 * would require re-verifying every schedule's spec section individually,
 * which nothing found so far justifies (Schedule 21's own continuity grid,
 * the one place this session had spec text in hand, turned out to be
 * entirely "+"-only — the two signed lines are both in Part 1, outside the
 * grid, and already rendered through this same formatter).
 */
export function formatSignedMoney(n: number): string {
	return n < 0 ? `(${at1Money(Math.abs(n))})` : at1Money(n);
}

function formatReadOnly(kind: PaperFieldKind, value: string | number | undefined): string {
	if (value === undefined) return "";
	if (kind === "money" && typeof value === "number") return formatSignedMoney(value);
	if (kind === "flag") return value === "yes" ? "Yes" : value === "no" ? "No" : String(value);
	if (kind === "date" && typeof value === "string") {
		// `engagement.taxYearStart`/`taxYearEnd` (and any other client/engagement
		// date field) arrive as full ISO datetimes ("2025-08-31T00:00:00.000Z") —
		// a preparer reconciling against the form needs the calendar date, not
		// the wire format, and the untruncated string is long enough to wrap a
		// fixed-width box and collide with the row below it.
		return dateInputValue(value);
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
		if (!role || role === "input") {
			// An editable field can still carry a `note` worth surfacing (a caveat,
			// a cross-reference, a "this line means the opposite of what you'd
			// expect" warning) — the "Computed"/"Carried in"/"Total" pills below
			// are provenance-specific and would misrepresent a genuinely editable
			// field, so this is a plain info marker instead, not a colored pill.
			if (!note) return null;
			return (
				<TooltipWrapper content={note} side="top">
					<span
						className="inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-full border border-muted-foreground/40 text-[10px] text-muted-foreground"
						aria-label="Note"
					>
						i
					</span>
				</TooltipWrapper>
			);
		}
		const isCarriedIn = role === "carried-in";
		const fromDisplayLine = from?.line ? (parseAt1LineItemId(from.line)?.field ?? from.line) : undefined;
		const label = isCarriedIn ? sourceLabel || from?.form || "Carried in" : role === "total" ? "Total" : "Computed";
		const tooltip = isCarriedIn
			? [from?.form && `From ${from.form}${fromDisplayLine ? ` line ${fromDisplayLine}` : ""}`, from?.note]
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

	// `to.line` is stored as the wire-format id (e.g. AT1's 9-digit composite);
	// what a preparer sees on the printed form is the 3-digit field — display
	// that, not the internal key. `parseAt1LineItemId` falls back to the raw
	// string for a target that isn't AT1-scheme (e.g. a federal T2SCHx line,
	// already stored plain).
	const toDisplayLine = parseAt1LineItemId(to.line)?.field ?? to.line;
	const toLabel = `→ ${to.form} line ${toDisplayLine}`;
	const toTooltip = to.note || `Carries forward to ${to.form}, line ${toDisplayLine}.`;
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
	formula,
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
	/**
	 * How the FORM says this line is calculated, shown beside the caption. Only
	 * ever the arithmetic the form itself prints — a reviewer cross-checking a
	 * computed box against the paper should see the same rule in both places.
	 */
	formula?: { expression: string; inputs: readonly string[] };
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
				{formula && (
					<TooltipWrapper
						content={`The form states this line as: ${formula.expression}`}
						side="top"
					>
						<span className="ml-2 cursor-help rounded bg-muted/60 px-1 py-0.5 align-middle font-mono text-[10px] text-muted-foreground">
							= {formula.expression}
						</span>
					</TooltipWrapper>
				)}
			</span>
			{resolved.editable ? (
				kind === "flag" || kind === "bool-flag" ? (
					<Controller
						control={control}
						name={resolved.name as Path<T>}
						render={({ field }) => {
							// "flag" fields are AT1's own string convention ("yes"/"no");
							// "bool-flag" fields are a genuine TypeScript `boolean` —
							// mapping happens ONLY here, at the DOM boundary, so the
							// underlying form value stays whichever type the schema
							// actually declares (never silently coerced to a string the
							// server would then reject).
							const isYes = kind === "bool-flag" ? field.value === true : field.value === "yes";
							const isNo = kind === "bool-flag" ? field.value === false : field.value === "no";
							const setOpt = (opt: "yes" | "no") =>
								field.onChange(kind === "bool-flag" ? opt === "yes" : opt);
							return (
								<div className="flex shrink-0 gap-3" role="radiogroup" aria-label={caption}>
									{(["yes", "no"] as const).map((opt) => (
										<label key={opt} className="flex items-center gap-1 text-xs">
											<input
												type="radio"
												name={`${resolved.name}-paper`}
												value={opt}
												disabled={disabled}
												checked={opt === "yes" ? isYes : isNo}
												onChange={() => setOpt(opt)}
												className="disabled:cursor-not-allowed"
											/>
											{opt === "yes" ? "Yes" : "No"}
										</label>
									))}
								</div>
							);
						}}
					/>
				) : (
					<Controller
						control={control}
						name={resolved.name as Path<T>}
						render={({ field }) => {
							const input = (
								<input
									type={kind === "date" ? "date" : kind === "money" || kind === "rate" ? "number" : "text"}
									inputMode={kind === "money" || kind === "rate" ? "decimal" : undefined}
									step={kind === "money" ? "1" : kind === "rate" ? "any" : undefined}
									disabled={disabled}
									aria-label={caption}
									className={cn(
										"h-8 rounded-md border border-l-2 border-input border-l-blue-500/60 bg-transparent px-1.5 text-right text-sm tabular-nums outline-none dark:border-l-blue-400/70",
										// A money box leaves room for the currency mark below.
										kind === "money" ? "w-full pl-5" : "w-36 shrink-0",
										"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
										"disabled:cursor-not-allowed disabled:border-dashed disabled:border-l-2 disabled:bg-muted/50 disabled:opacity-50",
									)}
									value={
										kind === "date"
											? dateInputValue(field.value as string | number | undefined)
											: ((field.value as string | number | undefined) ?? "")
									}
									onChange={(e) => {
										const v = e.target.value;
										field.onChange(v === "" ? undefined : kind === "money" || kind === "rate" ? Number(v) : v);
									}}
									onBlur={field.onBlur}
								/>
							);
							// Money boxes carry a currency mark, so an editable amount reads
							// as money the same way the read-only ones already do (those go
							// through `formatSignedMoney`, which prints "$"). Without it the
							// two states of the same line looked like different kinds of
							// value.
							if (kind !== "money") return input;
							return (
								<span className="relative inline-flex w-36 shrink-0 items-center">
									<span
										aria-hidden
										className="pointer-events-none absolute left-2 text-sm text-muted-foreground"
									>
										$
									</span>
									{input}
								</span>
							);
						}}
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
								"h-8 flex-1 overflow-hidden truncate rounded-md border border-dashed bg-muted/50 px-1.5 text-right text-sm tabular-nums leading-8",
								kind === "money" && typeof resolved.value === "number" && resolved.value < 0
									? "text-red-600 dark:text-red-400"
									: "text-muted-foreground",
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
				// `note` ALSO belongs on an editable row — an editable field with a
				// caveat worth surfacing (see `ProvenanceBadge`'s own `!role ||
				// role === "input"` branch) must not be silently dropped just
				// because it has neither a `to` nor a read-only role.
				(to || note || !resolved.editable) && (
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
		footnoteMarks?: readonly number[];
	}[];
}

/**
 * The printed form's own asterisk convention — the first footnote index
 * encountered (reading the grid row by row, pool by pool) gets `*`, the
 * next distinct one `**`, and so on. Computed once per grid render, in
 * print order, rather than by raw footnote-array index — a schedule's
 * `footnotes` are a flat list but only some are marked inline, and two
 * schedules marking the same index shouldn't have to agree on a glyph.
 */
function buildFootnoteSymbolMap(
	pools: readonly ContinuityPoolInput[],
	rowOrder: readonly { kind: string }[],
): ReadonlyMap<number, string> {
	const seen: number[] = [];
	for (const row of rowOrder) {
		for (const pool of pools) {
			const poolRow = pool.rows.find((r) => r.kind === row.kind);
			for (const mark of poolRow?.footnoteMarks ?? []) {
				if (!seen.includes(mark)) seen.push(mark);
			}
		}
	}
	return new Map(seen.map((mark, i) => [mark, "*".repeat(i + 1)]));
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
	resolveLine,
	footnoteSymbols,
	footnotes,
}: {
	pool: ContinuityPoolInput;
	row: { kind: string; caption: string };
	poolRow: ContinuityPoolInput["rows"][number] | undefined;
	name: string | undefined;
	control: Control<T>;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	/** Reads a line's filed value for computed/carried-in/total rows — the same mechanism `PaperLeaderRow` uses, threaded down here too. */
	resolveLine?: ResolveLine;
	footnoteSymbols?: ReadonlyMap<number, string>;
	footnotes?: readonly string[];
}) {
	const { ref, active } = useLineHighlight<HTMLTableCellElement>(poolRow?.line ?? "", highlightLine);
	const displayLine = poolRow ? (parseAt1LineItemId(poolRow.line)?.field ?? poolRow.line) : undefined;
	const marks = poolRow?.footnoteMarks;
	// Only a genuine `role: 'input'` row with no editor binding is a real
	// not-yet-collected gap. Anything else (computed / carried-in / total)
	// has a real value sitting in the computed return — go get it instead
	// of claiming this app doesn't capture it.
	const isUncollectedInput = poolRow ? poolRow.role === "input" && !name : false;
	const resolved = poolRow && !name && !isUncollectedInput ? resolveLine?.(poolRow.line) : undefined;
	const resolvedValue = resolved && !resolved.editable ? resolved.value : undefined;

	return (
		<td ref={ref} className={cn("px-3 py-1.5 transition-colors duration-500", active && "bg-amber-100 dark:bg-amber-900/40")}>
			{!poolRow ? (
				<TooltipWrapper content={`${pool.label} has no line for "${row.caption}" on the printed form — this pool's continuity genuinely skips this row.`} side="top">
					<span className="block cursor-help text-center text-muted-foreground">—</span>
				</TooltipWrapper>
			) : (
				<div className="space-y-0.5">
					<div className="flex items-center justify-between gap-1">
						<span className="font-mono text-[10px] text-muted-foreground">
							{displayLine}
							{marks?.map((m) => {
								const symbol = footnoteSymbols?.get(m) ?? "*";
								const text = footnotes?.[m];
								return (
									<TooltipWrapper key={m} content={text} side="top" disabled={!text}>
										<sup className="ml-0.5 cursor-help font-sans text-[9px] text-amber-600 dark:text-amber-400">{symbol}</sup>
									</TooltipWrapper>
								);
							})}
						</span>
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
					) : isUncollectedInput ? (
						<TooltipWrapper
							content={
								poolRow.note ||
								`This app doesn't collect ${pool.label.toLowerCase()} — ${row.caption.toLowerCase()} as its own entry yet — line ${displayLine} exists on the form but has no field here.`
							}
							side="top"
						>
							<span className="block h-8 cursor-help rounded-md border border-dashed bg-muted/50 text-center text-xs leading-8 text-muted-foreground">
								not collected
							</span>
						</TooltipWrapper>
					) : (
						<TooltipWrapper
							content={poolRow.note || `${row.caption} — ${poolRow.role === "carried-in" ? "carried in from another schedule" : "computed by the engine"}, not a preparer entry.`}
							side="top"
							disabled={!poolRow.note && resolved?.editable === false && resolved.value === undefined}
						>
							<span
								className={cn(
									"block h-8 rounded-md border border-dashed bg-muted/50 px-1.5 text-right text-sm tabular-nums leading-8",
									typeof resolvedValue === "number" && resolvedValue < 0
										? "text-red-600 dark:text-red-400"
										: "text-muted-foreground",
								)}
							>
								{resolved && !resolved.editable ? formatReadOnly("money", resolvedValue) || "—" : "—"}
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
	resolveLine,
	dividerAfter,
	footnotes,
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
	/** Resolves a computed/carried-in/total row's real value from the last computed return — see `ContinuityCell`. */
	resolveLine?: ResolveLine;
	/**
	 * Row kinds after which to print a plain "Subtotal" divider — a pure
	 * print-layout grouping label the real form shows between the additions
	 * block and the "Deduct:" block, NOT a numbered transmittable line (no
	 * `FormField` exists for it; confirmed against the TRA spec). Purely
	 * visual — matches the printed form's shape without inventing a line.
	 */
	dividerAfter?: readonly string[];
	/** The schedule's own `FormDefinition.footnotes` — text a `footnoteMarks` index points into. */
	footnotes?: readonly string[];
}) {
	const footnoteSymbols = buildFootnoteSymbolMap(pools, rowOrder);
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
						<Fragment key={row.kind}>
						<tr className="border-b last:border-b-0">
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
										resolveLine={resolveLine}
										footnoteSymbols={footnoteSymbols}
										footnotes={footnotes}
									/>
								);
							})}
						</tr>
						{dividerAfter?.includes(row.kind) && (
							<tr className="border-b bg-muted/20">
								<td colSpan={pools.length + 1} className="sticky left-0 px-3 py-1 text-center text-xs font-medium text-muted-foreground">
									Subtotal
								</td>
							</tr>
						)}
						</Fragment>
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
	lineFor,
}: {
	arrayName: string;
	rows: readonly ClassGridRow[];
	columns: readonly ClassGridColumn[];
	control: Control<T>;
	/** The read-only value for a cell with no `fieldName`, or whose row has no `arrayIndex`. */
	resolveCell: (row: ClassGridRow, column: ClassGridColumn) => string | number | undefined;
	disabled?: boolean;
	/**
	 * Override the printed line number PER CELL instead of per column —
	 * Schedule 5's provincial allocation grid is the reason this exists: every
	 * row (jurisdiction) has its OWN salaries/revenue line numbers (Alberta
	 * 119/159, Ontario 113/153, …), unlike every other `PaperClassGrid`
	 * consumer (Schedule 8/13/17/50), where one column really is one fixed
	 * line for every row. When omitted, the column header shows `column.line`
	 * as before; when supplied, the header drops its line number (it would be
	 * misleading — no single number applies to the whole column) and each
	 * cell shows its own instead.
	 */
	lineFor?: (row: ClassGridRow, column: ClassGridColumn) => string;
}) {
	return (
		<div className="overflow-x-auto rounded-lg border bg-card">
			<table className="w-full border-collapse text-xs">
				<thead>
					<tr className="border-b bg-muted/40">
						<th className="sticky left-0 min-w-[10rem] bg-muted/40 px-3 py-2 text-left font-medium">
							&nbsp;
						</th>
						{columns.map((c, i) => (
							<th key={c.fieldName ?? `col-${i}`} className="min-w-[7rem] px-2 py-2 text-left font-medium">
								{!lineFor && (
									<span className="block font-mono text-[10px] text-muted-foreground">{c.line}</span>
								)}
								{c.caption}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.key} className="border-b last:border-b-0">
							<td className="sticky left-0 bg-card px-3 py-1.5 text-muted-foreground">{row.label}</td>
							{columns.map((col, i) => {
								const editable = row.arrayIndex !== undefined && col.fieldName;
								const readOnlyText = formatReadOnly(col.kind, resolveCell(row, col));
								const cellLine = lineFor?.(row, col);
								return (
									<td key={col.fieldName ?? `col-${i}`} className="px-2 py-1.5">
										{cellLine && (
											<span className="mb-0.5 block font-mono text-[10px] text-muted-foreground">
												{cellLine}
											</span>
										)}
										{editable ? (
											<Controller
												control={control}
												name={`${arrayName}.${row.arrayIndex}.${col.fieldName}` as Path<T>}
												render={({ field }) => (
													<input
														type={col.kind === "date" ? "date" : isTextKind(col.kind) ? "text" : "number"}
														inputMode={col.kind === "date" || isTextKind(col.kind) ? undefined : "decimal"}
														step="any"
														disabled={disabled}
														aria-label={`${row.label} — ${col.caption}`}
														className={cn(
															"h-8 w-full min-w-[5.5rem] rounded-md border border-input bg-transparent px-1.5 text-sm tabular-nums outline-none",
															col.kind === "date" || isTextKind(col.kind) ? "text-left" : "text-right",
															"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
															"disabled:cursor-not-allowed disabled:border-dashed disabled:bg-muted/50 disabled:opacity-50",
														)}
														value={
															col.kind === "date"
																? dateInputValue(field.value as string | number | undefined)
																: ((field.value as string | number | undefined) ?? "")
														}
														onChange={(e) => {
															const v = e.target.value;
															field.onChange(
																v === "" ? undefined : col.kind === "date" || isTextKind(col.kind) ? v : Number(v),
															);
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
