/**
 * Structurally identical to the `PaperFieldKind`/`PaperFieldRole` declared
 * inside each GENERATED `paper/generated/*.layout.ts` file — those are kept
 * self-contained (regenerating one shouldn't require editing a hand-authored
 * file), but the hand-authored primitive components below need one canonical
 * copy to import rather than picking an arbitrary generated file's.
 */
export type PaperFieldKind = "money" | "date" | "text" | "rate" | "flag" | "code";
export type PaperFieldRole = "input" | "computed" | "total" | "carried-in";

export interface PaperField {
	line: string;
	caption: string;
	kind: PaperFieldKind;
	role: PaperFieldRole;
	section: string;
	requirement?: "mandatory" | "optional" | "conditional";
	note?: string;
	from?: { form: string; line: string; note?: string };
}

export interface PaperSectionDef {
	id: string;
	title: string;
	description?: string;
}

/**
 * Where one line's value on a paper Form View actually comes from.
 *
 * A paper view has to show EVERY line the printed form has, but only some of
 * them are boxes this schedule's own editor writes to — the rest are
 * computed, carried in from another schedule, or (for the jacket's
 * identification block specifically) entered at client/engagement creation,
 * not in this schedule at all. `resolveLine` is how a `PaperLeaderRow` finds
 * out which of those a given line is, without the primitive components
 * needing to know anything about where AT1 data actually lives.
 */
export type LineValue =
	/** A genuine editable field on THIS schedule's own `control` — render a real input bound to `name`. */
	| { editable: true; name: string }
	/**
	 * Read-only — computed, carried in from elsewhere, or otherwise not this
	 * schedule's own input. `value` is `undefined` when nothing is known yet
	 * (e.g. a field never computed, or one this product doesn't collect at
	 * all) — the row still renders, empty, so the printed form's shape stays
	 * intact rather than the line silently vanishing.
	 */
	| {
			editable: false;
			value: string | number | undefined;
			/** e.g. "Schedule 5" or "client profile" — shown as a small tag on the row. */
			sourceLabel?: string;
	  };

export type ResolveLine = (line: string) => LineValue;
