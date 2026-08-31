"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import type { ComputedReturn } from "@/api/computed-returns";
import { at1Money, parseAt1LineItemId } from "./at1-lines";
import type { PaperField, PaperSectionDef } from "./resolve-line";

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
	sections,
	fields,
	computed,
	stale,
	emptyMessage,
}: {
	scheduleId: string;
	sections: readonly PaperSectionDef[];
	fields: readonly PaperField[];
	computed?: ComputedReturn;
	stale?: boolean;
	emptyMessage: string;
}) {
	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === scheduleId);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	if (!filed) {
		return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
	}

	return (
		<div className="space-y-4">
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
							{sectionFields.map((f) => {
								const field = parseAt1LineItemId(f.line)?.field ?? f.line;
								const value = filedByField.get(field);
								const display = typeof value === "number" ? at1Money(value) : value != null ? String(value) : "—";
								const tooltip =
									f.note ??
									(f.from
										? [`From ${f.from.form}${f.from.line ? ` line ${f.from.line}` : ""}`, f.from.note]
												.filter(Boolean)
												.join(" — ")
										: undefined);
								return (
									<div key={f.line} className="flex items-center gap-3 px-4 py-2 text-sm">
										<span className="w-16 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-[11px] text-muted-foreground">
											{field}
										</span>
										<span className="min-w-0 flex-1 truncate" title={f.caption}>
											{f.caption}
										</span>
										<TooltipWrapper content={tooltip} side="top" disabled={!tooltip}>
											<span className="w-32 shrink-0 cursor-help text-right text-sm tabular-nums text-muted-foreground">
												{display}
											</span>
										</TooltipWrapper>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
