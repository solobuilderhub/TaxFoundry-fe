import { parseAt1LineItemId } from "./paper/at1-lines";
import { AT1_SCHEDULE_21_FIELDS, type PaperField } from "./paper/generated/schedule21.layout";

/**
 * AT1 Schedule 21 page 5 — the RIFE lines the editor shows, keyed by the
 * printed three-digit field.
 *
 * Read from the GENERATED FormDefinition — the same data the paper view and
 * `tests/ui-line-citations.test.ts` validate against, itself extracted from the
 * TRA form — rather than typed into JSX. A line number shown to a preparer is
 * a promise about where the figure lands on the printed form; this makes that
 * promise the form's, not this file's. `tests/rife-line-provenance.test.ts`
 * pins every key here to a real field, so a typo fails a test instead of
 * shipping.
 *
 * Kept as plain data with no React in it so the test can import it directly.
 */
export const RIFE_LINE_KEYS = [
	"200",
	"210",
	"220",
	"230",
	"240",
	"250",
	"310",
	"320",
	"330",
	"340",
	"350",
] as const;

export type RifeLineKey = (typeof RIFE_LINE_KEYS)[number];

export const RIFE_FIELD: ReadonlyMap<string, PaperField> = new Map(
	AT1_SCHEDULE_21_FIELDS.filter((f) => f.section === "rife").map(
		(f) => [parseAt1LineItemId(f.line)?.field ?? f.line, f] as const,
	),
);

/**
 * The form's own caption, note and carry-forward instruction for a line, for
 * the hover text beside the editor's shorter label.
 *
 * `to` is part of what the page prints, not metadata about it: line 240's row
 * reads "RIFE deducted for the tax year. Line 240 must not exceed line 350
 * (Enter amount on line 130 of the Schedule 12)", and that parenthesis is the
 * only place the form says where the figure goes. It was being dropped here,
 * so the tooltip stated the cap on the line and stayed silent on its
 * destination — while `tests/rife-line-provenance.test.ts` was already
 * asserting the `to` exists, which made the omission look intended.
 *
 * `to.note` carries the printed wording verbatim and is preferred for that
 * reason; the composed fallback is for a line that has a `to` without one.
 * Same precedence `ProvenanceBadge` uses for its own `to` tooltip.
 */
export function rifeFormText(key: RifeLineKey): string | undefined {
	const f = RIFE_FIELD.get(key);
	if (!f) return undefined;
	const carriesTo = f.to
		? (f.to.note ??
			`Carries forward to ${f.to.form}, line ${parseAt1LineItemId(f.to.line)?.field ?? f.to.line}.`)
		: undefined;
	return (
		[f.note ? `${f.caption} — ${f.note}` : f.caption, carriesTo]
			.filter(Boolean)
			.join(" ") || undefined
	);
}
