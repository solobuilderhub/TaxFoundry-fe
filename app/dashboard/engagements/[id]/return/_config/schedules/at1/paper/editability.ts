/**
 * Which box on an AT1 paper Form View a preparer may type into, and where a
 * read-only box gets its figure.
 *
 * One statement of the rule, shared by every schedule's Form View. It used to
 * live inside `schedule21-form-view.tsx`; Schedule 12 needs the same rule, and
 * two copies of "is this line the preparer's?" is exactly the kind of thing
 * that drifts and then quietly disagrees between two schedules.
 *
 * ── The rule ────────────────────────────────────────────────────────────────
 *
 *   role: "input"                → the preparer states it.
 *   role: "carried-in" from AT1  → resolved from THAT schedule's own line, and
 *                                  read-only. Alberta's CCA belongs to Schedule
 *                                  13 and its loss claims to Schedule 21;
 *                                  re-entering them here would let the return
 *                                  contradict the schedule it copies from.
 *   role: "carried-in" from T2   → the preparer transcribes it off the federal
 *                                  return, exactly as the form's caption says.
 *   role: "computed" / "total"   → derived; never editable.
 *
 * A binding is required on top of the role: the form must say the line is the
 * preparer's AND the app must have somewhere to put it. So a role changing
 * upstream can't leave a box typeable into nothing, and a stray binding can't
 * override the form.
 */
import type { ComputedReturn } from "@/api/computed-returns";
import { parseAt1LineItemId } from "./at1-lines";
import type { LineValue, PaperField, ResolveLine } from "./resolve-line";

/**
 * Whether a carried-in line's source is another Alberta schedule rather than
 * the federal return. `AT1SCH13`, `AT1`, `AT4970` are Alberta; `T2SCH1`, `T2`
 * and `T661` are federal.
 */
export const isAlbertaSourced = (formId: string): boolean => /^AT/.test(formId);

export interface ResolveLineOptions {
	/** This schedule's own 3-digit id, e.g. `"012"`. */
	scheduleId: string;
	/** The schedule's fields, from its generated paper layout. */
	fields: readonly PaperField[];
	/** 3-digit printed line → the form-state field it binds to. */
	ownField: Partial<Record<string, string>>;
	computed?: ComputedReturn;
	/**
	 * Client-side previews for lines this schedule derives, keyed by 3-digit
	 * line. They win over the filed figure so a derived line moves as the
	 * preparer types.
	 */
	derived?: Record<string, number | undefined>;
}

export function buildResolveLine({
	scheduleId,
	fields,
	ownField,
	computed,
	derived = {},
}: ResolveLineOptions): ResolveLine {
	const byLine = new Map(
		fields.map((f) => [parseAt1LineItemId(f.line)?.field ?? f.line, f]),
	);
	const payloads = computed?.schedulePayloads ?? [];
	const ownByField = new Map(
		(payloads.find((p) => p.scheduleId === scheduleId)?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	/**
	 * A figure read from the schedule the form says it comes from, by that
	 * schedule's own line id — the "referred value". An AT1 line id is
	 * `SSSFFFOOO`, so the first triplet names the schedule to look in.
	 */
	const referred = (ref: { form: string; line: string }): unknown =>
		payloads
			.find((p) => p.scheduleId === ref.line.slice(0, 3))
			?.values?.find((v) => v.lineItemId === ref.line)?.value;

	return (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		const definition = byLine.get(field);
		const role = definition?.role;
		const name = ownField[field];

		const preparerStates =
			role === "input" ||
			(role === "carried-in" &&
				!!definition?.from &&
				!isAlbertaSourced(definition.from.form));
		if (name && preparerStates) return { editable: true, name };

		if (role === "carried-in" && definition?.from && isAlbertaSourced(definition.from.form)) {
			const value = referred(definition.from);
			if (value !== undefined) {
				return {
					editable: false,
					value: value as string | number,
					sourceLabel: definition.from.form,
				};
			}
		}

		const preview = derived[field];
		if (preview !== undefined) return { editable: false, value: preview };
		return { editable: false, value: ownByField.get(field) as string | number | undefined };
	};
}
