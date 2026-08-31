"use client";

import { AlertTriangle } from "lucide-react";
import type { ComputedReturn } from "@/api/computed-returns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { at1Money as money, parseAt1LineItemId } from "../_config/schedules/at1/paper/at1-lines";

/**
 * `computed.issues` is ONE flat array covering every schedule the engine
 * touched — there is no per-schedule tag, only prose. Every issue message
 * this engine raises names its own schedule as "Schedule N" somewhere in the
 * text (confirmed across every `issues.push(...)` call site in
 * `packages/ca-tax/src/t2/at1/schedules/`) — Schedule 1 is the one named
 * exception ("Alberta SBD:", not "Alberta Schedule 1:"). Matching on that
 * convention, rather than hand-maintaining a prefix-per-schedule table, is
 * what lets this filter keep working as new schedules add their own issues
 * without a second place to update. `\s+` (not `\s*`) before the number is
 * required — without it, "Schedule 1" would also match inside "Schedule 11".
 */
function issuesForSchedule(issues: string[] | null | undefined, scheduleNum: string): string[] {
	if (!issues || issues.length === 0) return [];
	const bare = scheduleNum.replace(/^0+/, "") || "0";
	const pattern = new RegExp(`Schedule\\s+0*${bare}\\b`, "i");
	const isSbd = scheduleNum === "001";
	return issues.filter((msg) => pattern.test(msg) || (isSbd && /\bSBD\b/.test(msg)));
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
	const issues = issuesForSchedule(computed?.issues, scheduleNum);
	const hasRows = !!payload && payload.values.length > 0;
	if (!hasRows && issues.length === 0) return null;

	const rows = hasRows
		? [...payload.values].sort((a, b) => a.lineItemId.localeCompare(b.lineItemId))
		: [];

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
			{issues.length > 0 && (
				<ul className="space-y-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
					{issues.map((msg) => (
						<li key={msg} className="flex gap-1.5">
							<AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
							<span>{msg}</span>
						</li>
					))}
				</ul>
			)}
			{hasRows && (
				<>
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
				</>
			)}
		</div>
	);
}
