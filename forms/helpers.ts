/**
 * The two lookups the form registry needs beyond plain data access.
 *
 * Kept as free functions rather than methods on `FormDefinition` so the
 * definitions stay pure, serialisable data — which is what lets them be diffed
 * structurally against the published package during the migration, and what let
 * them be extracted from it in the first place.
 */
import type { FormDefinition, FormField } from "./types";

/** Every field in one section, in the form's own order. */
export function fieldsInSection(
	form: FormDefinition,
	sectionId: string,
): readonly FormField[] {
	return form.fields.filter((f) => f.section === sectionId);
}

/**
 * Build an Alberta AT1 Schedule 21 line-item id from the 3-digit field number
 * printed on the form.
 *
 * AT1 ids are the 9-digit `SSSFFFOOO` composite (schedule, field, occurrence)
 * TRA's Net File schema requires. Schedule 21 is `021`, and every line outside
 * the repeating tables is occurrence 1. `parseAt1LineItemId` is the inverse,
 * used when rendering a line back to what the preparer sees.
 */
export function scheduleTwentyOneLineId(field: string, occurrence = 1): string {
	return `021${field}${String(occurrence).padStart(3, "0")}`;
}
