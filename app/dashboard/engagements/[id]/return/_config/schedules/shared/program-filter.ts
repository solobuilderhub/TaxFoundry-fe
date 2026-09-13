/**
 * The sidebar's program filter, as a pure predicate.
 *
 * Extracted from `registry.ts` so it can be tested. That module imports every
 * schedule definition, each of which imports its paper Form View, which import
 * `@classytic/fluid` components — so anything loading `registry.ts` loads the
 * entire UI graph and fails outside Next's bundler. A rule about which nav rows
 * to show needs none of that, and could not be verified while it lived there.
 */
import type { ScheduleProgram } from "./define";

/**
 * True for a schedule that belongs ONLY to `program`.
 *
 * Drives "AT1 only" in the sidebar: narrowing to one program hides the federal
 * schedules a provincial return merely consumes as input (Schedule 8's CCA
 * classes, Schedule 13's reserve rows) and keeps the ones that program owns.
 *
 * A federal schedule briefly gained a `carriesProgramForms` marker so that
 * rows holding an Alberta form could pass this too — because Alberta Schedules
 * 13 and 17 lived INSIDE federal Schedule 8 and 13's slices and had no entry
 * of their own. Both are now real schedules with their own slices and their own
 * nav rows, so nothing carries another program's forms any more and the marker
 * is gone. If a schedule ever does again, this is the seam to widen; the
 * better answer is usually to give the form its own slice, as those two got.
 */
export const isProgramSpecific = (
	s: { programs?: readonly ScheduleProgram[] },
	program: string,
) => !!s.programs && s.programs.every((p) => p === program);
