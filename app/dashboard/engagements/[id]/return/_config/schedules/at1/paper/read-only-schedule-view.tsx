"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import type { ComputedReturn } from "@/api/computed-returns";
import { cn } from "@/lib/utils";
import { parseAt1LineItemId } from "./at1-lines";
import {
	captionFormula,
	formatSignedMoney,
	OfficialPdfLink,
	ProvenanceBadge,
	useLineHighlight,
} from "./components/paper-primitives";
import type {
	NavigateToLine,
	PaperField,
	PaperSectionDef,
} from "./resolve-line";

function ReadOnlyRow({
	field,
	filedByField,
	highlightLine,
	onNavigate,
}: {
	field: PaperField;
	filedByField: Map<string, string | number>;
	highlightLine?: string;
	onNavigate?: NavigateToLine;
}) {
	const lineNumber = parseAt1LineItemId(field.line)?.field ?? field.line;
	const value = filedByField.get(lineNumber);
	const isNegative = typeof value === "number" && value < 0;
	/*
	 * Only MONEY gets the money treatment. A `code` field is a selector the
	 * form prints as a bare digit — AT1 Schedule 18's line 084, "Specify:
	 * 1 = shares or 2 = debt", rendered as "$1" here, which reads as a
	 * one-dollar figure rather than the code it is. `rate` is likewise a
	 * decimal (Schedule 10's inclusion rate is filed to six places), and a
	 * `flag`/`date`/`text` value is already a string by the time it arrives.
	 */
	const display =
		typeof value === "number"
			? field.kind === "money"
				? formatSignedMoney(value)
				: String(value)
			: value != null
				? String(value)
				: "";
	const formula =
		field.role === "computed" || field.role === "total"
			? captionFormula(field.caption)
			: undefined;
	const { ref, active } = useLineHighlight<HTMLDivElement>(
		field.line,
		highlightLine,
	);

	return (
		<div
			ref={ref}
			className={cn(
				"flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-500",
				active && "bg-amber-100 dark:bg-amber-900/40",
			)}
		>
			<span className="w-16 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-[11px] text-muted-foreground">
				{lineNumber}
			</span>
			<span className="min-w-0 flex-1 truncate" title={field.caption}>
				{field.caption}
			</span>
			{/*
			 * The absent-figure state is the same dashed empty box `PaperLeaderRow`
			 * shows for a read-only line with nothing in it — an em dash, never a
			 * zero. A zero on a tax form is an assertion ("this line is nil"); a
			 * blank box is the truth here ("nothing has been computed for it").
			 */}
			<span className="flex w-36 shrink-0 items-center justify-end gap-1.5">
				<TooltipWrapper content={display} side="top" disabled={!display}>
					<span
						className={cn(
							"h-8 flex-1 overflow-hidden truncate rounded-md border border-dashed bg-muted/50 px-1.5 text-right text-sm tabular-nums leading-8",
							isNegative
								? "text-red-600 dark:text-red-400"
								: "text-muted-foreground",
						)}
					>
						{display || "—"}
					</span>
				</TooltipWrapper>
			</span>
			<ProvenanceBadge
				role={field.role}
				note={field.note}
				formula={formula}
				from={field.from}
				sourceText={field.sourceText}
				to={field.to}
				onNavigate={onNavigate}
			/>
		</div>
	);
}

/**
 * Shared shell for schedules with no editable side at all — Schedule 12
 * (fully computed from other schedules' overrides), and Schedule 2/10 (no
 * dedicated `ReturnInput` slice; whatever this product does compute for
 * them lives entirely in OTHER schedules' fields). Each gets its own
 * nav entry outside the normal registry (see `return-editor.tsx`), the same
 * special-cased pattern as "Tax Summary (jacket)".
 *
 * The FORM always renders — every section, line number, caption, role badge,
 * note and carry-forward pill — whether or not a computed return exists. A
 * paper Form View exists to show the form; a preparer who opens one before
 * computing is looking for its shape, and an empty form answers that where a
 * single sentence does not. The two "why are the figures blank" explanations
 * moved to a line above the form rather than replacing it.
 */
export function ReadOnlyScheduleView({
	scheduleId,
	formId,
	sections,
	fields,
	computed,
	stale,
	notComputedMessage,
	nothingToReportMessage,
	onNavigate,
	highlightLine,
}: {
	scheduleId: string;
	/** The `FormDefinition.id` (e.g. `"AT1SCH12"`) — for the "View official PDF" link, when a vendored copy exists (see `OFFICIAL_PDF`). */
	formId?: string;
	sections: readonly PaperSectionDef[];
	fields: readonly PaperField[];
	computed?: ComputedReturn;
	stale?: boolean;
	/** Shown above the form when the return has never been computed at all — no figure on it reflects a real filing yet. */
	notComputedMessage: string;
	/** Shown above the form when the return HAS been computed but this schedule genuinely has nothing to report — a real, correct outcome, not a gap. */
	nothingToReportMessage: string;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === scheduleId,
	);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	// `computed` presence and `filed` presence answer two different questions —
	// conflating them into one message reads as "is this even real?" (the
	// exact question this distinction exists to answer). No computed return at
	// all is a genuinely different state from a computed return where this
	// schedule correctly had nothing to reconcile. Either way the form below is
	// the same form; only the reason its value cells are empty differs.
	const emptyReason = !computed
		? notComputedMessage
		: !filed
			? nothingToReportMessage
			: undefined;

	return (
		<div className="space-y-4">
			{formId && (
				<div className="flex justify-end">
					<OfficialPdfLink formId={formId} />
				</div>
			)}
			{emptyReason && (
				<p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
					{emptyReason}
				</p>
			)}
			{stale && (
				<p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
					Inputs changed since — recompute to refresh these figures.
				</p>
			)}
			{sections.map((section) => {
				const sectionFields = fields.filter((f) => f.section === section.id);
				if (sectionFields.length === 0) return null;
				return (
					<div key={section.id} className="rounded-lg border bg-card">
						<div className="border-b bg-muted/40 px-4 py-2">
							<h3 className="text-sm font-semibold">{section.title}</h3>
							{section.description && (
								<p className="mt-0.5 text-xs text-muted-foreground">
									{section.description}
								</p>
							)}
						</div>
						<div className="divide-y">
							{sectionFields.map((f) => (
								<ReadOnlyRow
									key={f.line}
									field={f}
									filedByField={filedByField}
									highlightLine={highlightLine}
									onNavigate={onNavigate}
								/>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
