import type { PaperFieldRole as GeneratedPaperFieldRole } from "./generated/jacket.layout";

export type { NavigateToLine } from "../../shared/define";

/**
 * Structurally identical to the `PaperFieldKind`/`PaperFieldRole` declared
 * inside each GENERATED `paper/generated/*.layout.ts` file — those are kept
 * self-contained (regenerating one shouldn't require editing a hand-authored
 * file), but the hand-authored primitive components below need one canonical
 * copy to import rather than picking an arbitrary generated file's.
 */
/**
 * "flag" is AT1's own yes/no convention — the underlying field is a STRING,
 * `"yes" | "no"` (or `undefined` for unanswered; see `at1YesNo` /
 * `YES_NO` elsewhere in this app). "bool-flag" is for schedules whose
 * underlying data is a genuine TypeScript `boolean` instead (most federal T2
 * guided-editor `f.switch(...)` fields, e.g. `IdentificationValues`) — a real
 * bug once bound "flag"'s string-typed radios to a boolean field: saved
 * `true` answers rendered as unchecked (indistinguishable from unanswered),
 * and clicking a radio wrote the STRING `"yes"` into a field the server
 * schema requires to be `boolean`, which the API rejected on save.
 */
export type PaperFieldKind =
	| "money"
	| "date"
	| "text"
	| "rate"
	| "flag"
	| "bool-flag"
	| "code"
	/** A quantity that is not money — kilometres, bushels, tonnage. */
	| "count";
/**
 * `not-collected` — on the printed form, modelled nowhere: no editable
 * binding, nothing computes it, nothing files it. It was being expressed as
 * `computed`, which made the renderer print a "Computed" badge over an empty
 * cell and told a preparer the engine had worked out a nil. AT1 Schedule 1's
 * 019/020/021/044 are the current members.
 *
 * This copy is hand-authored (see above) and therefore CAN drift from the
 * generated one — it just did, when ca-tax gained this member. The assertion
 * below is what stops that happening silently a second time.
 */
export type PaperFieldRole =
	| "input"
	| "computed"
	| "total"
	| "carried-in"
	| "not-collected";

/**
 * Compile-time proof that this hand-authored union still matches what the
 * emitter writes into every generated layout. Fails in both directions: a role
 * added to ca-tax and missing here, or removed there and left here.
 */
type _Mutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const _rolesMatchGenerated: _Mutual<PaperFieldRole, GeneratedPaperFieldRole> =
	true;
void _rolesMatchGenerated;

export interface PaperField {
	line: string;
	caption: string;
	kind: PaperFieldKind;
	role: PaperFieldRole;
	section: string;
	requirement?: "mandatory" | "optional" | "conditional";
	note?: string;
	/** What the form prints over the box to say where the figure comes from, verbatim. Present even where `from` is not — a sum or a conditional has no single line to link to. */
	sourceText?: string;
	from?: { form: string; line: string; note?: string };
	to?: { form: string; line: string; note?: string };
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
	| {
			editable: true;
			name: string;
			/**
			 * The permitted answers, for a line whose value is a CODE rather than a
			 * figure or free text (jacket 030/039/041/051, and the tick-box lists
			 * elsewhere on the AT1).
			 *
			 * Carried here rather than read from the layout by the primitives,
			 * because the option lists are per-form data — the jacket's live in the
			 * generated `AT1_JACKET_CODE_OPTIONS` — and teaching a generic row
			 * component to look them up would make it know which form it is
			 * rendering. Given options, a `code` field renders as a select; without
			 * them it stays free text, which is correct for a code drawn from a
			 * published classification rather than a short list (line 028's
			 * four-digit SIC code being exactly that).
			 *
			 * It matters that this is a select where a list exists: the code IS the
			 * transmitted value, so a typo is a different answer rather than a
			 * malformed one. A "3" at line 051 files bankruptcy; at 039 it files
			 * final return.
			 */
			options?: readonly { code: string; label: string }[];
			/** What files when the box is left blank — e.g. the client profile's value. */
			placeholder?: string;
	  }
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
			/**
			 * Set when this read-only figure is really a T2 amount the app keeps in
			 * the working return — shown locked, with a toggle that lets the
			 * preparer type it directly. See {@link LinkedSlot}.
			 */
			linked?: LinkedSlot;
			/**
			 * A plain, always-open box for a value ANOTHER slice owns — the jacket's
			 * 005 (the EDI certification code) and 082 (instalments, on Payments).
			 * Printed on this form as an ordinary entry, so it is typed here like one;
			 * the write goes to its one home, so the two screens cannot disagree.
			 */
			direct?: DirectSlot;
	  };

export type DirectSlot = {
	/** What is stored at the slot now; `undefined` = never entered. */
	stored: string | number | undefined;
	write: (value: string | number | undefined) => Promise<void>;
};

/**
 * A T2 figure this return keeps in ONE place, that a schedule displays but may
 * not have computed.
 *
 * The AT1 reads several federal amounts — taxable dividends deductible (T2 line
 * 320), the Part VI.1 deduction (325), prospector's shares (350) — that the app
 * would ordinarily get from a T2 prepared in it. A preparer whose T2 was
 * prepared elsewhere has no T2 here to derive them from, so the line would sit
 * blank. The box takes the figure typed straight in.
 *
 * The edit writes the SAME slot the figure always lives in — not a copy local
 * to this schedule — so every schedule that reads it, and the engine, sees one
 * number. That is the whole point: an override that only this view knew about
 * would let the Schedule 21 box and the Schedule 12 box state two different
 * amounts for one line of the T2.
 *
 * Two backings, because a slot lives in one of two places:
 *
 *   own     a field on THIS schedule's form. Bound through `control`, so it is
 *           saved with "Save schedule" like any other box here. Writing it
 *           anywhere else would be overwritten by that save.
 *   global  a field in ANOTHER schedule's slice. Written immediately through
 *           `write`, because this schedule's save does not carry that slice.
 */
export type LinkedSlot =
	| {
			backing: "own";
			/** The field on this schedule's own `control`. */
			name: string;
			/** Where the figure belongs — "federal Schedule 4 line 310". */
			label: string;
	  }
	| {
			backing: "global";
			/** Dotted path into the working return — "albertaSchedule12.prospectorsShares". */
			path: string;
			/** What is stored there now; `undefined` = never entered. */
			stored: number | undefined;
			/** Where the figure belongs — "T2 line 350". */
			label: string;
			/** Persist a value at `path` (or clear it with `undefined`). */
			write: (value: number | undefined) => Promise<void>;
	  };

export type ResolveLine = (line: string) => LineValue;

/**
 * Every line one AT1 schedule has a value for, keyed by its printed 3-digit
 * field — the transmitted lines AND the print-only ones.
 *
 * Thirteen paper Form Views each built this map inline, identically, reading
 * `payload.values` alone. That was right when `values` was all there was; it
 * stopped being right when the engine gained a `display` channel for the
 * subtotals §3.2.3 gives no line code (Schedule 12's 052/080/081, Schedule
 * 18's column totals, Schedule 21's 013/015 and its RIFE continuity). Thirteen
 * copies meant thirteen places to forget, so there is one now.
 *
 * `values` wins on a collision. Nothing should ever appear in both — a ca-tax
 * test pins that — but if something did, the figure that was actually FILED is
 * the one a preparer needs to see.
 *
 * Read-only. This is the display side; `values` alone is what transmits, and
 * the filing path never comes through here.
 */
export function filedByFieldFor(
	computed:
		| {
				schedulePayloads?:
					| {
							scheduleId: string;
							values: { lineItemId: string; value: string | number }[];
							display?: { lineItemId: string; value: string | number }[];
					  }[]
					| null;
		  }
		| undefined,
	scheduleId: string,
	parseField: (lineItemId: string) => string | undefined,
): Map<string, string | number> {
	const payload = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === scheduleId,
	);
	const out = new Map<string, string | number>();
	// Print-only first, so a filed value overwrites it rather than the reverse.
	for (const v of [...(payload?.display ?? []), ...(payload?.values ?? [])]) {
		const field = parseField(v.lineItemId);
		if (field !== undefined) out.set(field, v.value);
	}
	return out;
}

/**
 * Read a numeric figure out of the working return by dotted path.
 *
 * Lives beside {@link LinkedSlot} because it is the other half of it: a linked
 * slot names a path, and this is how a view reads what is stored there before
 * offering to overwrite it. Schedule 21 had the only copy; Schedule 1 needed
 * the same thing for line 003, and a second copy is how two views come to
 * disagree about what "stored" means.
 *
 * Returns `undefined` for anything that is not a number — including a value
 * that is present but of the wrong type, which is a real possibility on a
 * working return assembled from many schedules and must not render as a figure.
 */
export function valueAt(ri: unknown, path: string): number | undefined {
	let cur: unknown = ri;
	for (const key of path.split(".")) {
		cur = (cur as Record<string, unknown> | undefined)?.[key];
	}
	return typeof cur === "number" ? cur : undefined;
}
