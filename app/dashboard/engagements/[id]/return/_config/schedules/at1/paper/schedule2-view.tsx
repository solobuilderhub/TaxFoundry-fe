"use client";

import type { ComputedReturn } from "@/api/computed-returns";
import { AT1_SCHEDULE_2_FIELDS, AT1_SCHEDULE_2_SECTIONS } from "./generated/schedule2.layout";
import { ReadOnlyScheduleView } from "./read-only-schedule-view";

/**
 * AT1 Schedule 2 — read-only. No dedicated editor exists (Area A's 4 lines
 * are carried in from the federal Schedule 5 establishments allocation);
 * Area B's seven industry-specific formulas are not modelled at all — see
 * `schedule2.ts`'s own doc comment. Special-cased nav entry like Schedule 12.
 */
export function Schedule2View({ computed, stale }: { computed?: ComputedReturn; stale?: boolean }) {
	return (
		<ReadOnlyScheduleView
			scheduleId="002"
			sections={AT1_SCHEDULE_2_SECTIONS}
			fields={AT1_SCHEDULE_2_FIELDS}
			computed={computed}
			stale={stale}
			emptyMessage="Not yet computed — Schedule 2 only files when the corporation has permanent establishments outside Alberta. Compute the return first."
		/>
	);
}
