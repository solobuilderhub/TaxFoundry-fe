"use client";

import type { ComputedReturn } from "@/api/computed-returns";
import {
	AT1_SCHEDULE_12_FIELDS,
	AT1_SCHEDULE_12_SECTIONS,
} from "./generated/schedule12.layout";
import type { Control } from "react-hook-form";
import type { ReturnInput } from "../../../../_lib/return-input";
import { type LinkedLines, ReadOnlyScheduleView } from "./read-only-schedule-view";
import type { NavigateToLine } from "./resolve-line";

/**
 * The Area B lines whose figure is a T2 amount, and the one slot the working
 * return keeps each in — the SAME slot AT1 Schedule 21 Part 1 reads for its
 * lines 005/007/011/012/017, so editing either box edits both. The federal
 * side of each pair; the Alberta side defaults to it and is overridden in the
 * guided "Alberta Area B" editor.
 *
 * 082 is here, not its federal twin 083 alone, because 082 IS Schedule 21 line
 * 017 ("Carry forward to Schedule 12, line 082") — the same figure, linked in
 * both places.
 */
const T2_LINKED_LINES: LinkedLines = {
	"061": { path: "albertaSchedule12.taxableDividendsDeductible", label: "T2 line 320" },
	"063": { path: "albertaSchedule12.partVI1TaxDeductible", label: "T2 line 325" },
	"079": { path: "albertaSchedule12.prospectorsShares", label: "T2 line 350" },
	"141": { path: "albertaSchedule12.nonQualifiedSecuritiesDeduction", label: "T2 line 352" },
	"083": { path: "albertaSchedule12.section110_5Additions", label: "T2 line 355" },
	"082": {
		path: "albertaSchedule12.albertaSection110_5Additions",
		label: "Alberta s.110.5 additions (defaults to T2 line 355)",
	},
};

/**
 * AT1 Schedule 12 — read-only, always. There is no editable side because
 * there's no `ScheduleDef`/nav entry of its own at all today: it's fully
 * computed by the engine from the OTHER schedules' Alberta-override fields
 * (`cca.ts`, `reserves.ts`, `capital-gains.ts`, `alberta-continuity.ts`).
 * Wired directly into `return-editor.tsx` as a special-cased nav entry (the
 * same pattern already used for "Tax Summary (jacket)"), not the registry.
 *
 * `emitOnlyWhenDifferent` (see `schedule12.ts`'s own doc comment): a
 * reconciling pair whose federal and Alberta figures agree is correctly
 * OMITTED from the filed payload, not a gap — shown blank without flagging
 * it, same as any other genuinely-nil line.
 */
export function Schedule12View({
	computed,
	stale,
	onNavigate,
	highlightLine,
	returnInput,
	writeInput,
	control,
}: {
	computed?: ComputedReturn;
	stale?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	returnInput?: ReturnInput;
	writeInput?: (path: string, value: number | undefined) => Promise<void>;
	/**
	 * Present only when this is the guided "Alberta Area B" schedule's own Form
	 * View — every linked line here lives in THAT schedule's slice, so it binds
	 * through its form rather than writing around it. Absent on the read-only
	 * Schedule 12 nav entry, where the lines write the return directly.
	 */
	control?: Control<Record<string, unknown>>;
}) {
	return (
		<ReadOnlyScheduleView
			scheduleId="012"
			formId="AT1SCH12"
			sections={AT1_SCHEDULE_12_SECTIONS}
			fields={AT1_SCHEDULE_12_FIELDS}
			computed={computed}
			stale={stale}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			linkedLines={T2_LINKED_LINES}
			returnInput={returnInput}
			writeInput={writeInput}
			control={control}
			ownSlice={control ? "albertaSchedule12" : undefined}
			notComputedMessage="Not yet computed — the form below is Schedule 12 as TRA prints it; its figures appear once you compute the return."
			nothingToReportMessage="Computed, and Schedule 12 has nothing to reconcile — Alberta and federal figures agree on Schedules 13, 17, 18 and 21 this filing. That's a real result, not a gap: the form itself says only to report a pair where the amounts differ."
		/>
	);
}
