"use client";

import { AlertTriangle } from "lucide-react";
import type { ReturnInput } from "../../../../../_lib/return-input";
import type { NavigateToLine } from "../resolve-line";

/**
 * AT1 Schedules 13, 17 and 18 are filed only when the jacket declares a
 * divergence — line 060 (different Alberta taxable income) or 061 (different
 * discretionary amounts or opening balances). TRA forbids them otherwise, and
 * the engine drops them.
 *
 * Silently: a preparer could fill a whole schedule here and nothing said it
 * was being ignored. This says so, where the figures were typed, with the way
 * to fix it one click away.
 */
export function DivergenceGateNotice({
	returnInput,
	hasEntries,
	schedule,
	onNavigate,
}: {
	returnInput?: ReturnInput;
	/** Only warn about figures that exist — an empty schedule has nothing to lose. */
	hasEntries: boolean;
	schedule: string;
	onNavigate?: NavigateToLine;
}) {
	const ab = (returnInput?.alberta ?? {}) as {
		reportsDifferentAlbertaIncome?: string;
		electsDifferentDiscretionaryAmounts?: string;
	};
	const declared =
		ab.reportsDifferentAlbertaIncome === "yes" ||
		ab.electsDifferentDiscretionaryAmounts === "yes";
	if (declared || !hasEntries) return null;
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm">
			<AlertTriangle className="size-4 shrink-0 text-amber-600" />
			<span className="min-w-0 flex-1">
				<b>{schedule} is not being filed.</b> TRA allows it only when the AT1
				Jacket answers <b>Yes</b> at line 060 (different Alberta taxable income)
				or 061 (different discretionary amounts or opening balances). The
				figures entered here are ignored until then.
			</span>
			{onNavigate && (
				<button
					type="button"
					onClick={() => onNavigate("AT1", "061")}
					className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent"
				>
					Go to jacket line 061
				</button>
			)}
		</div>
	);
}
