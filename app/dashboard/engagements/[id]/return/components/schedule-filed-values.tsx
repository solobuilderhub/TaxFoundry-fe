"use client";

import { AlertTriangle } from "lucide-react";
import type { ComputedReturn } from "@/api/computed-returns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const money = (n: number) =>
	new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD",
		maximumFractionDigits: 0,
	}).format(n);

/**
 * AT1's Net File line-item id is nine digits, `SSSFFFOOO` — schedule, field,
 * occurrence. Splitting it back out is how this component labels each row
 * without needing a second, hand-maintained line-number table: the id
 * already carries everything except the caption, and the caption is exactly
 * what the schedule's own entry form already shows next to each field's
 * `(line NNN)` citation.
 */
function parseAt1LineItemId(
	lineItemId: string,
): { field: string; occurrence: number } | undefined {
	if (!/^\d{9}$/.test(lineItemId)) return undefined;
	return {
		field: lineItemId.slice(3, 6),
		occurrence: Number(lineItemId.slice(6, 9)),
	};
}

/**
 * Exactly what this schedule would transmit, read straight from the last
 * computed return's `schedulePayloads` — not a second calculation, not a
 * paraphrase. This is the same reconciliation a preparer would do line by
 * line against a competitor's rendered form, except sourced from the one
 * thing that actually matters: the filed data itself.
 *
 * Renders nothing when the schedule was never computed, or when the last
 * compute filed nothing for it (e.g. a reconciliation-gated schedule like
 * CCA/reserves/dispositions that TRA forbids filing without a divergence
 * flag) — an empty card would read as a bug, not as "correctly omitted".
 */
export function ScheduleFiledValues({
	computed,
	stale,
	scheduleNum,
}: {
	computed: ComputedReturn | undefined;
	stale: boolean;
	scheduleNum: string;
}) {
	const payload = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === scheduleNum,
	);
	if (!payload || payload.values.length === 0) return null;

	const rows = [...payload.values].sort((a, b) =>
		a.lineItemId.localeCompare(b.lineItemId),
	);

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-muted-foreground">
					As filed (Schedule {scheduleNum}, from the last compute)
				</h3>
				{stale && (
					<span className="flex items-center gap-1.5 text-xs text-amber-600">
						<AlertTriangle className="size-3.5 shrink-0" />
						Inputs changed since — recompute to refresh
					</span>
				)}
			</div>
			<div className="divide-y rounded-lg border">
				{rows.map((v) => {
					const parsed = parseAt1LineItemId(v.lineItemId);
					const isNumeric = typeof v.value === "number";
					return (
						<div
							key={v.lineItemId}
							className="flex items-center justify-between gap-4 px-4 py-2 text-sm"
						>
							<span className="text-muted-foreground">
								{parsed
									? `Line ${parsed.field}${parsed.occurrence > 1 ? ` (occurrence ${parsed.occurrence})` : ""}`
									: v.lineItemId}
							</span>
							<span
								className={cn(
									"font-medium tabular-nums",
									!isNumeric && "font-mono text-xs",
								)}
							>
								{isNumeric ? money(v.value as number) : String(v.value)}
							</span>
						</div>
					);
				})}
			</div>
			<Badge variant="outline" className="font-normal text-muted-foreground">
				{rows.length} line{rows.length === 1 ? "" : "s"} would be transmitted
				for this schedule
			</Badge>
		</div>
	);
}
