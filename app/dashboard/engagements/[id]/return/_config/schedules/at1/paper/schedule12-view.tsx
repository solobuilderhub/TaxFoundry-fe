"use client";

import type { ComputedReturn } from "@/api/computed-returns";
import { AT1_SCHEDULE_12_FIELDS, AT1_SCHEDULE_12_SECTIONS } from "./generated/schedule12.layout";
import { ReadOnlyScheduleView } from "./read-only-schedule-view";

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
export function Schedule12View({ computed, stale }: { computed?: ComputedReturn; stale?: boolean }) {
	return (
		<ReadOnlyScheduleView
			scheduleId="012"
			sections={AT1_SCHEDULE_12_SECTIONS}
			fields={AT1_SCHEDULE_12_FIELDS}
			computed={computed}
			stale={stale}
			emptyMessage="Not yet computed, or nothing to reconcile this filing — Schedule 12 only files when Alberta figures diverge from federal on another schedule. Compute the return first."
		/>
	);
}
