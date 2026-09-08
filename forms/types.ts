/**
 * The form model — what a TaxFoundry form definition *is*.
 *
 * Hand-authored and deliberately small. The 42 definitions in `./definitions/`
 * conform to these types; `./aux.ts` carries the handful of per-schedule tables
 * whose shape a flat field list can't express (matrix columns, pool tables).
 *
 * The vocabulary here is TRA's and CRA's, not ours. A `line` is the number
 * printed beside the box on the paper form, and `scheme` says which numbering
 * system that number belongs to. Keep it that way: the entire value of these
 * definitions is that a preparer can reconcile them against the published form,
 * and a caption we reworded for readability is a caption that no longer matches
 * the page in front of them.
 */

/** The filing program a form belongs to. */
export type FormProgram = "T2" | "AT1" | "CO17";

/**
 * Which numbering system this form's `line` values use.
 *
 * - `cra-line` — federal T2. The 3-4 digit line number printed on the form.
 * - `tra-line-item-id` — Alberta AT1. The 9-digit `SSSFFFOOO` composite
 *   (schedule, field, occurrence) TRA's Net File schema requires. The printed
 *   form shows only the middle three digits, so the UI splits it before
 *   display — see `parseAt1LineItemId`.
 * - `rq-box` — Revenu Québec CO-17 box numbers.
 */
export type FormScheme = "cra-line" | "tra-line-item-id" | "rq-box";

/** What kind of value a box holds. Drives which input the editor renders. */
export type FormFieldKind = "money" | "date" | "text" | "rate" | "flag" | "code";

/**
 * Where a box's value comes from — the distinction that decides whether a
 * preparer may type into it.
 *
 * - `input` — the preparer enters it.
 * - `computed` — the engine derives it from other lines on this form.
 * - `total` — a sum of lines above it on this form.
 * - `carried-in` — it arrives from another form; see the field's `from`.
 *
 * Only `input` fields reach the guided editor. A paper Form View renders every
 * role, and is responsible for keeping the other three read-only.
 */
export type FormFieldRole = "input" | "computed" | "total" | "carried-in";

/**
 * Whether the jurisdiction requires the line to be filed.
 *
 * `mandatory` is an obligation on the OUTPUT, not on the preparer's attention:
 * TRA spec §3.2.3 requires every mandatory field id to appear in the payload.
 * That is why an unanswered mandatory question blocks filing rather than
 * defaulting — see the AT1 jacket's radios.
 */
export type FormFieldRequirement = "mandatory" | "optional" | "conditional";

/** Which side of a running total a line falls on, where the form says so. */
export type FormFieldSide = "add" | "deduct";

/** A reference to a line on another form. */
export interface FormLineRef {
	/** The other form's `id` — e.g. `"AT1SCH12"`. */
	form: string;
	/** The line, in that form's own `scheme`. */
	line: string;
	/** Why the two are connected, when it isn't obvious from the captions. */
	note?: string;
}

/**
 * How the form says a line is calculated from other lines on the SAME form.
 *
 * Recorded only where the form actually prints the arithmetic — `Line 320 plus
 * line 330`, `(Lesser of line 310 and line 340)`, `Subtotal of lines 002 to
 * 012`. Where a value is derived but the form doesn't state how, this is absent
 * rather than reverse-engineered: an invented formula would read as
 * authoritative and be nobody's rule.
 *
 * The expression stays in the form's own words (which cite the short printed
 * line numbers); `inputs` carries the same lines as full `FormField.line`
 * values, so a check can confirm they exist.
 */
export interface FormFormula {
	/** The arithmetic as printed, e.g. `"Line 015 - 017 + 019"`. */
	expression: string;
	/** The lines it reads, as `FormField.line` values on this form. */
	inputs: readonly string[];
}

/** One numbered box on a form. */
export interface FormField {
	/** The line number, in the owning form's `scheme`. */
	line: string;
	/**
	 * The caption as PRINTED on the form.
	 *
	 * Copy it, don't improve it. Instructions the form prints inside the caption
	 * — "(enter as a positive amount)", "(if positive, enter \"0\")",
	 * "Carry forward to Schedule 12, line 082" — are part of the caption, because
	 * they are how the form states its own arithmetic.
	 */
	caption: string;
	kind: FormFieldKind;
	role: FormFieldRole;
	/** The `id` of the `FormSection` this field sits in. */
	section: string;
	requirement?: FormFieldRequirement;
	/** How the form says this line is calculated, where it says so. */
	formula?: FormFormula;
	/** Our own guidance, kept separate from the printed `caption`. */
	note?: string;
	side?: FormFieldSide;
	/** Page of the printed form this box appears on, 1-based. */
	page?: number;
	/** This line's value arrives from another form. */
	from?: FormLineRef;
	/** This line's value carries forward to another form. */
	to?: FormLineRef;
	/** Indices into the owning form's `footnotes`, for the asterisks the form prints. */
	footnoteMarks?: readonly number[];
}

/** A titled block of fields, mirroring how the printed form groups them. */
export interface FormSection {
	id: string;
	title: string;
	description?: string;
	/** Page of the printed form this section starts on, 1-based. */
	page?: number;
	/**
	 * A continuation of the preceding section rather than a heading of its own —
	 * the printed form repeats a block (a second pool, a facing column) without
	 * restating the title.
	 */
	secondary?: boolean;
}

/**
 * Where this definition's content came from, and when.
 *
 * Treat this as the trust signal it is. A definition traced to the published
 * PDF or to TRA's Chapter 3 specification can be relied on; one traced to a
 * summary or field map is second-hand and has historically been where captions
 * and whole lines went missing. `./README.md` lists which is which.
 */
export interface FormProvenance {
	/** The source document — a published form, a specification, or a field map. */
	document: string;
	/** ISO date the document was retrieved. */
	retrieved: string;
	/** Free-text note on the revision or how it was checked. */
	revision?: string;
}

/** One CRA or TRA form. */
export interface FormDefinition {
	/** Stable identifier — `"AT1SCH21"`, `"T2SCH1"`. Used by `FormLineRef.form`. */
	id: string;
	program: FormProgram;
	/** Schedule number as the jurisdiction writes it — `"21"`, `"200"` for a jacket. */
	schedule: string;
	title: string;
	scheme: FormScheme;
	/** The tax years this definition is valid for. */
	taxYears: { from: number };
	sections: readonly FormSection[];
	fields: readonly FormField[];
	provenance: FormProvenance;
	/** Printed footnotes, in order. `FormField.footnoteMarks` indexes into this. */
	footnotes?: readonly string[];
}
