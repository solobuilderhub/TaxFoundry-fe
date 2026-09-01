"use client";

import { Pill } from "@classytic/fluid/client/pill";
import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import { cn } from "@/lib/utils";
import type { ComputedReturn } from "@/api/computed-returns";
import { at1Money, parseAt1LineItemId } from "./at1-lines";
import { OfficialPdfLink, useLineHighlight } from "./components/paper-primitives";
import type { NavigateToLine, PaperField, PaperSectionDef } from "./resolve-line";

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
	const display = typeof value === "number" ? at1Money(value) : value != null ? String(value) : "—";
	const tooltip =
		field.note ??
		(field.from
			? [`From ${field.from.form}${field.from.line ? ` line ${field.from.line}` : ""}`, field.from.note]
					.filter(Boolean)
					.join(" — ")
			: undefined);
	const { ref, active } = useLineHighlight<HTMLDivElement>(field.line, highlightLine);

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
			<TooltipWrapper content={tooltip} side="top" disabled={!tooltip}>
				<span className="w-32 shrink-0 cursor-help text-right text-sm tabular-nums text-muted-foreground">
					{display}
				</span>
			</TooltipWrapper>
			{field.to &&
				(onNavigate ? (
					<TooltipWrapper content={field.to.note || `Carries forward to ${field.to.form}, line ${field.to.line}.`} side="top">
						<button type="button" onClick={() => onNavigate(field.to!.form, field.to!.line)} className="inline-flex shrink-0">
							<Pill variant="outline" className="cursor-pointer text-[10px] hover:bg-accent">
								{`→ ${field.to.form} line ${field.to.line}`}
							</Pill>
						</button>
					</TooltipWrapper>
				) : (
					<TooltipWrapper content={field.to.note || `Carries forward to ${field.to.form}, line ${field.to.line}.`} side="top">
						<span className="inline-flex shrink-0">
							<Pill variant="outline" className="cursor-help text-[10px]">
								{`→ ${field.to.form} line ${field.to.line}`}
							</Pill>
						</span>
					</TooltipWrapper>
				))}
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
	/** Shown when the return has never been computed at all — nothing here reflects a real filing yet. */
	notComputedMessage: string;
	/** Shown when the return HAS been computed but this schedule genuinely has nothing to report — a real, correct outcome, not a gap. */
	nothingToReportMessage: string;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === scheduleId);
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
	// schedule correctly had nothing to reconcile.
	if (!computed) {
		return <p className="text-sm text-muted-foreground">{notComputedMessage}</p>;
	}
	if (!filed) {
		return <p className="text-sm text-muted-foreground">{nothingToReportMessage}</p>;
	}

	return (
		<div className="space-y-4">
			{formId && (
				<div className="flex justify-end">
					<OfficialPdfLink formId={formId} />
				</div>
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
								<p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>
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
