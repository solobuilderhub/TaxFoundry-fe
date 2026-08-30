import {
	type BaseField,
	defineSchema,
	type FormSchema,
	field,
	section,
} from "@classytic/formkit/server";
import { money } from "../fields";
import { defineSchedule } from "./define";

/**
 * AT1 Schedule 15 — Alberta Resource Related Deductions.
 *
 * `ri.albertaResourceDeductions15` — this exact shape, read directly by
 * `apps/server/src/engine/at1-schedule-composers/schedule-15-compose.ts`'s
 * `assembleSchedule15`. Kept in lockstep with that composer by hand until this
 * schedule gets its own key on `ReturnInput` and is wrapped with
 * `defineSchedule(...)` — both done centrally, once every AT1 schedule being
 * wired this round is in (see `alberta-schedule5.ts` for the identical
 * arrangement on the sibling schedule built the same round).
 *
 * Full field-by-line-number derivation:
 * `packages/ca-tax/src/t2/at1/schedules/schedule15-resource-related-deductions.ts`
 * (spec §3.2.3.16, lines 12394-15937 of the NetFile mapping text — this
 * schedule has no standalone form PDF in this engine's sources).
 *
 * ── Captions are VERBATIM, not paraphrased ──────────────────────────────────
 *
 * Every field label below is the spec's own MAPPINGS table "Line Name" column
 * text, reproduced exactly (only PDF line-wrap whitespace is collapsed) —
 * the same rule federal T2 caption modules already follow (see
 * `packages/ca-tax/src/t2/forms/generated/schedule1.captions.ts`'s own
 * docstring: "holds ONLY what the printed page states"). There is no
 * standalone AT1SCH15 PDF, but the spec's MAPPINGS table IS the source the
 * live TRA-certified renderers (e.g. AuraTax) draw their own captions from,
 * so matching it exactly here is what makes this UI read the same as theirs.
 * A handful of source-text irregularities are called out where they occur
 * (a missing "of", an unclosed parenthesis, an inconsistent "at [the] end",
 * a trailing period some captions have and others don't) — preserved as
 * printed rather than silently tidied, except where noted.
 *
 * ── Shape ─────────────────────────────────────────────────────────────────
 *
 * EIGHT resource-expense continuity pools (there is no "resource allowance"
 * line on this schedule — that federal deduction was repealed for post-1989
 * years; see the engine module's doc comment). Six are split into a
 * REGULAR and a SUCCESSOR side, each its own top-level key here
 * (`edaRegular`/`edaSuccessor`, …) rather than nested under a shared `eda`
 * object — matching `alberta-schedule5.ts`'s flat-block convention, since
 * `field.group` (used for each block below) is only demonstrated working one
 * level deep in this codebase. CMEDB has no successor side. SFEDE and CFRE
 * are PER-COUNTRY, so `f.array` rows replace `field.group` blocks there.
 *
 * Every reconciled figure is a PARALLEL PAIR — `federal<Name>` (a plain
 * reference entry; this engine has no federal Schedule 15 tracker to derive
 * it from, so the preparer supplies it directly) and `alberta<Name>` (the
 * ACTUAL AT1 Schedule 15 line; blank = defaults to the federal figure) — the
 * same convention `cca.ts` uses for `openingUCC` / `albertaOpeningUCC`. A
 * field the spec marks "must equal federal" (no Alberta variant permitted —
 * e.g. current-year CEE/CDE/CCOGPE expenses, government assistance) gets
 * ONLY the `federal<Name>` half, which then IS the AT1 line (there is nothing
 * to override, so the caption's "(line NNN)" citation sits on that single
 * field). `claimed` is the one discretionary claim amount per block (blank =
 * claim the maximum the pool/rate/income caps all allow), matching the
 * engine's own `Input.claimed` field 1:1 — EXCEPT EDA and CMEDB, whose only
 * "claim" IS one of the reconciled fields itself (`regulation1201Claim` /
 * `regulation1202Claim` for EDA; a bare `claimed` for CMEDB, which has no
 * federal counterpart line at all).
 *
 * Given the size, this file prioritizes USABILITY over exhaustiveness per the
 * task brief: one card per pool (not per regular/successor half), each
 * holding its regular block, its successor block (or array), side by side —
 * rather than the finer "amounts" / "advanced adjustments" split
 * `alberta-continuity.ts` uses, which would have produced SIXTEEN cards for
 * eight pools. The 015105/015133/015167/015191/015139 spec ambiguities the
 * engine module flags are called out in the relevant field's `description`
 * so a preparer sees the caveat at the point of entry, not just buried in
 * `result.issues` after computing.
 */

// ── Row shapes ───────────────────────────────────────────────────────────

export type EdaRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalSaleTransfer?: number;
	albertaSaleTransfer?: number;
	/** 015007 — the claim itself, reconciled the same way as every other EDA figure. */
	federalRegulation1201Claim?: number;
	albertaRegulation1201Claim?: number;
};
export type EdaSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalSaleTransfer?: number;
	albertaSaleTransfer?: number;
	/** 015019 */
	federalRegulation1202Claim?: number;
	albertaRegulation1202Claim?: number;
};
export type CmedbRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalDisposalTransfer?: number;
	albertaDisposalTransfer?: number;
	/** 015031 — no federal default line exists for this one; blank = claim the maximum pool balance. */
	claimed?: number;
};
export type CeeRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalCurrentYearExpenses?: number;
	federalLookBackExpenses?: number;
	federalReclassifiedFromCde?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalRenewableConservationExpenses?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalGovernmentAssistance?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalRenouncedFlowThrough?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	federalRenouncedLookBack?: number;
	/** 015061 — 100% claimable to the pool, no percentage rate. */
	claimed?: number;
};
export type CeeSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalReclassifiedFromCde?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	/** 015081 */
	claimed?: number;
};
export type CdeRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalCurrentYearExpenses?: number;
	federalLookBackExpenses?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalReclassifiedFromCee?: number;
	federalGovernmentAssistance?: number;
	federalReceivableOnDisposition?: number;
	albertaReceivableOnDisposition?: number;
	/** 015105 — auto-derives from a negative CCOGPE-regular pool; see field description. */
	federalCreditBalanceInCogpePool?: number;
	albertaCreditBalanceInCogpePool?: number;
	/** 015107 — the spec's own text references an undefined "015139"; see field description. */
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalRenouncedFlowThrough?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	federalRenouncedLookBack?: number;
	/** 015115 — capped at 30% of the pool (prorated for a short tax year). */
	claimed?: number;
};
export type CdeSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalReclassifiedFromCee?: number;
	/** 015133 — no federal default line; ambiguous "may not exceed" wording, see field description. */
	federalCreditBalanceInCogpePool?: number;
	albertaCreditBalanceInCogpePool?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	/** 015141 */
	claimed?: number;
};
export type CcogpeRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalCurrentYearExpenses?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalReceivableOnDisposition?: number;
	albertaReceivableOnDisposition?: number;
	federalGovernmentAssistance?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	/** 015167 — a negative pool total here may need to be routed to CDE per the 66.7(4)(a)(iii) designation; see field description. */
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	/** 015169 — capped at 10% of the pool (prorated for a short tax year). */
	claimed?: number;
};
export type CcogpeSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalReceivableOnDisposition?: number;
	albertaReceivableOnDisposition?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	/** 015189 */
	claimed?: number;
};
export type FedeRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/** 015209 — lesser of the pool and the greater of a 10% floor or foreign resource income. */
	claimed?: number;
};
export type FedeSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/** 015221 — no percentage rate; capped only by the pool and foreign resource income. */
	claimed?: number;
};
export type SfedeCountryRegularRow = {
	/** 015241 — 2-letter country code (Chapter 1, Appendix 1-5). */
	countryCode?: string;
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/** 015253 */
	claimed?: number;
};
export type SfedeCountrySuccessorRow = {
	countryCode?: string;
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/** 015273 — no percentage rate. */
	claimed?: number;
};
export type CfreCountryRegularRow = {
	countryCode?: string;
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalCurrentYearExpenses?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/** 015293 = A + B; B needs `globalForeignResourceLimit` below or it is treated as nil. */
	claimed?: number;
	/** No line number — undefined anywhere in the spec text this engine was built from; see field description. */
	globalForeignResourceLimit?: number;
};
export type CfreCountrySuccessorRow = {
	countryCode?: string;
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/** 015313 — capped at 30%-prorated pool OR the sum of every country's foreign resource income. */
	claimed?: number;
};

export type AlbertaResourceDeductions15Values = {
	/** Days in the tax year — feeds every claim cap the spec prorates for a short year (CDE/CCOGPE/FEDE regular/SFEDE regular/CFRE). Blank = 365. */
	daysInTaxYear?: number;
	// The 000060/000061 divergence-gate flags are NOT collected here — they are
	// jacket-level fields shared by every reconciliation-gated schedule
	// (13/17/18/15), collected once on the AT1 jacket form (`alberta.ts`) and
	// read from `ri.alberta` by `schedule-15-compose.ts`.

	/** EDA — Continuity of Earned Depletion Base (line 001-021, grandfathered). */
	edaRegular?: EdaRegularRow;
	edaSuccessor?: EdaSuccessorRow;
	/** CMEDB — Continuity of Mining Exploration Depletion Base (line 023-033). No successor side. */
	cmedb?: CmedbRow;
	/** CEE — Cumulative Canadian Exploration Expenses (line 041-083). */
	ceeRegular?: CeeRegularRow;
	ceeSuccessor?: CeeSuccessorRow;
	/** CDE — Cumulative Canadian Development Expenses (line 091-143). */
	cdeRegular?: CdeRegularRow;
	cdeSuccessor?: CdeSuccessorRow;
	/** CCOGPE — Cumulative Canadian Oil and Gas Property Expenses (line 151-191). */
	ccogpeRegular?: CcogpeRegularRow;
	ccogpeSuccessor?: CcogpeSuccessorRow;
	/** FEDE — Foreign Exploration and Development Expenses (line 201-233). */
	fedeRegular?: FedeRegularRow;
	fedeSuccessor?: FedeSuccessorRow;
	/** SFEDE — Specified Foreign Exploration and Development Expenses, PER COUNTRY (line 241-277). */
	sfedeRegular?: SfedeCountryRegularRow[];
	sfedeSuccessor?: SfedeCountrySuccessorRow[];
	/** CFRE — Cumulative Foreign Resource Expenses, PER COUNTRY (line 281-317). */
	cfreRegular?: CfreCountryRegularRow[];
	cfreSuccessor?: CfreCountrySuccessorRow[];
};

// ── Field-authoring helpers ──────────────────────────────────────────────

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * One reconciled figure = one or two flat `BaseField`s (relative names — this
 * is always used inside a `field.group`/`f.array` item list). `caption` is
 * the spec's VERBATIM "Line Name" text for `atLine` — no paraphrasing.
 *
 * - `overridable = false` ("must equal federal", no Alberta variant): ONE
 *   field, captioned `${caption} (line ${atLine})` exactly as the coordinator
 *   specified, since that single field IS the AT1 line.
 * - `overridable = true`: TWO fields — a plain federal reference (captioned
 *   with the fed cross-reference, not an AT1 line of its own) and the actual
 *   AT1 line (`${caption} (line ${atLine})`), which is what a preparer fills
 *   in only when Alberta differs.
 */
function reconciled(
	name: string,
	caption: string,
	atLine: string,
	fedLine: string,
	overridable: boolean,
	description?: string,
): BaseField[] {
	if (!overridable) {
		return [
			money(`federal${cap(name)}`, `${caption} (line ${atLine})`, {
				description: `Must equal federal (fed ${fedLine}) — the spec permits no Alberta override on this line.${
					description ? ` ${description}` : ""
				}`,
			}),
		];
	}
	return [
		money(
			`federal${cap(name)}`,
			`${caption} — federal figure (fed ${fedLine})`,
			{
				description: `Defaults AT1 line ${atLine} below. Enter Alberta's own figure only if it differs.`,
			},
		),
		money(`alberta${cap(name)}`, `${caption} (line ${atLine})`, {
			description: `Blank = same as federal.${description ? ` ${description}` : ""}`,
		}),
	];
}

function claimField(
	atLine: string,
	caption: string,
	description: string,
): BaseField {
	return money("claimed", `${caption} (line ${atLine})`, { description });
}

// ── EDA — Continuity of Earned Depletion Base ───────────────────────────────

const edaRegularFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Regular Expenses: Balance at end of preceding taxation year",
		"001",
		"012101",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Regular Expenses: transferred on amalgamation or wind-up of subsidiary",
		"003",
		"012105",
		true,
	),
	...reconciled(
		"saleTransfer",
		"Regular Expenses: transferred on sale of resource property to successor",
		"005",
		"012110",
		true,
	),
	...reconciled(
		"regulation1201Claim",
		"Regular Expenses: Claim for the year per federal Regulation 1201",
		"007",
		"012115",
		true,
		"Capped at the pool (opening + amalgamation transfer − sale transfer).",
	),
];
const edaSuccessorFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Successor Expenses: Balance at end of preceding taxation year",
		"011",
		"012126",
		true,
	),
	// Verbatim — the spec's own caption omits "of" before "subsidiary" here
	// (compare line 015's caption, three rows down, which DOES include it).
	...reconciled(
		"amalgamationTransfer",
		"Successor Expenses: transferred on amalgamation or wind-up subsidiary",
		"013",
		"012130",
		true,
	),
	...reconciled(
		"otherTransfer",
		"Successor Expenses: transferred other than on amalgamation or wind-up of subsidiary",
		"015",
		"012132",
		true,
	),
	...reconciled(
		"saleTransfer",
		"Successor Expenses: transferred on sale of resource property",
		"017",
		"012135",
		true,
	),
	...reconciled(
		"regulation1202Claim",
		"Successor Expenses: Claim for the year per federal Regulation 1202(2)",
		"019",
		"012140",
		true,
		"Capped at the pool (opening + amalgamation + other transfer − sale transfer).",
	),
];

// ── CMEDB — Continuity of Mining Exploration Depletion Base ─────────────────

const cmedbFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Continuity of Mining Exploration Depletion Base: Balance at end of preceding taxation year",
		"023",
		"012150",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Continuity of Mining Exploration Depletion Base: transferred on amalgamation or wind-up of subsidiary",
		"025",
		"012155",
		true,
	),
	...reconciled(
		"otherTransfer",
		"Continuity of Mining Exploration Depletion Base: transferred other than on amalgamation or wind-up of subsidiary",
		"027",
		"012160",
		true,
	),
	...reconciled(
		"disposalTransfer",
		"Continuity of Mining Exploration Depletion Base: transferred on disposal of resource property to successor",
		"029",
		"012165",
		true,
	),
	// Verbatim — the spec's own caption lower-cases "base" here, unlike every
	// other CMEDB line, which capitalizes it.
	claimField(
		"031",
		"Continuity of Mining Exploration Depletion base: deduct: Claim for the year per federal Regulation 1203(1)",
		"No federal default line exists — a genuinely discretionary Alberta claim. Blank = claim the maximum positive pool balance.",
	),
];

// ── CEE — Cumulative Canadian Exploration Expenses ──────────────────────────

const ceeRegularFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Regular Exp.: Balance at end of preceding taxation year",
		"041",
		"012200",
		true,
	),
	...reconciled(
		"currentYearExpenses",
		"Regular Exp.: Add: current year expenses excluding expenses incurred under look-back rule",
		"043",
		"012205",
		false,
	),
	...reconciled(
		"lookBackExpenses",
		"Regular Exp.: Add: current year expenses under look-back rule [federal subsection 66(12.66)]",
		"044",
		"012206",
		false,
	),
	...reconciled(
		"reclassifiedFromCde",
		"Regular Exp.: Add: reclassified from Canadian development expenses (federal subsections 66.1(9) and 66.7 (9))",
		"045",
		"012210",
		false,
	),
	...reconciled(
		"amalgamationTransfer",
		"Regular Exp.: Add: transferred on amalgamation or wind-up of subsidiary",
		"047",
		"012215",
		true,
	),
	...reconciled(
		"renewableConservationExpenses",
		"Regular Exp.: Add: Canadian renewable and conservation expenses",
		"049",
		"012217",
		false,
	),
	...reconciled(
		"otherAdditions",
		"Regular Exp.: Add: other additions",
		"051",
		"012220",
		true,
	),
	...reconciled(
		"governmentAssistance",
		"Regular Exp.: Deduct: government assistance and grants",
		"053",
		"012225",
		false,
	),
	...reconciled(
		"otherDeductions",
		"Regular Exp.: Deduct: other deductions or transfers",
		"055",
		"012230",
		true,
	),
	...reconciled(
		"renouncedFlowThrough",
		"Regular Exp.: Deduct: current and previous year Canadian exploration expenses renounced in the year pursuant to a flow-through share agreement",
		"058",
		"012243",
		false,
	),
	...reconciled(
		"transferredToSuccessor",
		"Regular Exp.: Deduct: transferred on disposition of resource property to successor",
		"059",
		"012240",
		true,
	),
	...reconciled(
		"renouncedLookBack",
		"Regular Exp.: Deduct: expenses renounced under look-back rule [federal subsection 66(12.66)]",
		"060",
		"012244",
		false,
	),
	claimField(
		"061",
		"Regular Exp.: Deduct: current year claim per federal subsections 66.1(2) and 66.7(3)",
		"100% claimable to the pool, no percentage rate. If the pool subtotal is ≤ 0, the engine forces this to equal the subtotal (an income inclusion) regardless of what is entered here.",
	),
];
const ceeSuccessorFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Successor Exp.: Balance at end of preceding taxation year",
		"064",
		"012250",
		true,
	),
	...reconciled(
		"reclassifiedFromCde",
		"Successor Exp.: Add: reclassified from Canadian development expenses",
		"065",
		"012255",
		false,
	),
	...reconciled(
		"amalgamationTransfer",
		"Successor Exp.: Add: transferred on amalgamation or wind-up of subsidiary",
		"067",
		"012260",
		true,
	),
	...reconciled(
		"otherTransfer",
		"Successor Exp.: Add: transferred other than on amalgamation or wind-up of subsidiary",
		"069",
		"012265",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Successor Exp.: Deduct: other deductions or transfers",
		"077",
		"012280",
		true,
	),
	...reconciled(
		"transferredToSuccessor",
		"Successor Exp.: Deduct: transferred on disposition of resource property to successor",
		"079",
		"012290",
		true,
	),
	claimField(
		"081",
		"Successor Exp.: Deduct: current year claim (or income inclusion if subtotal is negative)",
		"100% claimable, same income-inclusion rule as the regular pool when the subtotal is ≤ 0.",
	),
];

// ── CDE — Cumulative Canadian Development Expenses ──────────────────────────

const cdeRegularFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Regular Exp.: Balance at end of preceding taxation year",
		"091",
		"012300",
		true,
	),
	...reconciled(
		"currentYearExpenses",
		"Regular Exp.: Add: current year expenses excluding expenses incurred under look-back rule",
		"093",
		"012303",
		false,
	),
	...reconciled(
		"lookBackExpenses",
		"Regular Exp.: Add: current year expenses under look-back rule [federal subsection 66(12.66)]",
		"094",
		"012304",
		false,
	),
	...reconciled(
		"amalgamationTransfer",
		"Regular Exp.: Add: transferred on amalgamation or wind-up of subsidiary",
		"095",
		"012305",
		true,
	),
	...reconciled(
		"otherAdditions",
		"Regular Exp.: Add: other additions",
		"097",
		"012310",
		true,
	),
	...reconciled(
		"reclassifiedFromCee",
		"Regular Exp.: Deduct: reclassified Canadian exploration expenses (federal subsections 66.1(9) and 66.7(9))",
		"099",
		"012315",
		false,
	),
	...reconciled(
		"governmentAssistance",
		"Regular Exp.: Deduct: government assistance and grants",
		"101",
		"012320",
		false,
	),
	...reconciled(
		"receivableOnDisposition",
		"Regular Exp.: Deduct: receivable on disposition of underground oil and gas storage rights or mining property",
		"103",
		"012325",
		true,
	),
	// Verbatim — the spec's own caption for THIS line ends with a period,
	// unlike its successor-side counterpart (line 133) three sections down.
	...reconciled(
		"creditBalanceInCogpePool",
		"Regular Exp.: Deduct: credit balance in the cumulative Canadian oil and gas property expense pool.",
		"105",
		"012330",
		true,
		"Auto-derives to the CCOGPE-regular pool's own negative subtotal when that pool is negative, per the field's own spec formula — this then overrides whatever is entered here. See the AT1 Schedule 15 issues list after computing for the 66.7(4)(a)(iii) designation ambiguity this may still need confirming.",
	),
	...reconciled(
		"otherDeductions",
		"Regular Exp.: Deduct: other deductions or transfers",
		"107",
		"012335",
		true,
		'The spec text for this line references an undefined "line 015139" nowhere else in the schedule — not resolved by the engine, flagged in the issues list rather than guessed.',
	),
	...reconciled(
		"renouncedFlowThrough",
		"Regular Exp.: Deduct: current and previous year Canadian development expenses renounced in the year pursuant to a flow-through share agreement",
		"110",
		"012343",
		false,
	),
	...reconciled(
		"transferredToSuccessor",
		"Regular Exp.: Deduct: transferred on disposition of resource property to successor",
		"111",
		"012340",
		true,
	),
	...reconciled(
		"renouncedLookBack",
		"Regular Exp.: Deduct: expenses renounced under look-back rule [federal subsection 66(12.66)]",
		"112",
		"012344",
		false,
	),
	claimField(
		"115",
		"Regular Exp.: Deduct: current year claim per federal subsection 66.2(2)",
		"Capped at 30% of the pool subtotal (prorated by days/365 only below a 357-day tax year — a full year gets the full 30%, no proration).",
	),
];
const cdeSuccessorFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Successor Exp.: Balance at end of preceding taxation year",
		"119",
		"012350",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Successor Exp.: Add: transferred on amalgamation or wind-up of subsidiary",
		"121",
		"012355",
		true,
	),
	...reconciled(
		"otherTransfer",
		"Successor Exp.: Add: transferred other than on amalgamation or wind-up of subsidiary",
		"123",
		"012357",
		true,
	),
	// The spec's own caption for this line leaves the closing parenthesis off
	// ("...66.7(9)" with no ")") — the identical phrase at line 099 above
	// DOES close it, so the closing paren is restored here to avoid an
	// obviously-broken label; flagged in the report rather than silently
	// carried over.
	...reconciled(
		"reclassifiedFromCee",
		"Successor Exp.: Deduct: reclassified Canadian exploration expenses (federal subsections 66.1(9) and 66.7(9))",
		"127",
		"012365",
		false,
	),
	// No federal default line exists for this one (unlike line 105's regular
	// counterpart) and the spec's own wording is ambiguous — see description.
	...reconciled(
		"creditBalanceInCogpePool",
		"Successor Exp.: Deduct: credit balance in the cumulative Canadian oil and gas property expense pool",
		"133",
		"n/a — no federal default line",
		true,
		"No federal default exists for this line, and the spec's own \"value may not exceed amount A\" wording is ambiguous. The engine auto-derives it from the CCOGPE-successor pool's negative subtotal, matching line 105's clearer wording — see the issues list.",
	),
	...reconciled(
		"otherDeductions",
		"Successor Exp.: Deduct: other deductions or transfers",
		"135",
		"012385",
		true,
	),
	...reconciled(
		"transferredToSuccessor",
		"Successor Exp.: Deduct: transferred on disposition of resource property",
		"137",
		"012390",
		true,
	),
	claimField(
		"141",
		"Successor Exp.: Deduct: current year claim per federal subsection 66.2(2)",
		"Capped at 30% of the pool subtotal, same short-year proration as the regular pool.",
	),
];

// ── CCOGPE — Cumulative Canadian Oil and Gas Property Expenses ─────────────

const ccogpeRegularFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Regular Exp.: Balance at end of preceding taxation year",
		"151",
		"012400",
		true,
	),
	...reconciled(
		"currentYearExpenses",
		"Regular Exp.: Add: current year expenses",
		"153",
		"012405",
		false,
	),
	...reconciled(
		"amalgamationTransfer",
		"Regular Exp.: Add: transferred on amalgamation or wind-up of subsidiary",
		"155",
		"012410",
		true,
	),
	...reconciled(
		"otherAdditions",
		"Regular Exp.: Add: other additions",
		"157",
		"012415",
		true,
	),
	...reconciled(
		"receivableOnDisposition",
		"Regular Exp.: Deduct: received or receivable on disposition of Canadian oil and gas property",
		"159",
		"012420",
		true,
	),
	...reconciled(
		"governmentAssistance",
		"Regular Exp.: Deduct: government assistance and grants",
		"161",
		"012425",
		false,
	),
	...reconciled(
		"transferredToSuccessor",
		"Regular Exp.: Deduct: transferred on disposition of resource property to successor",
		"165",
		"012435",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Regular Exp.: Deduct: other deductions or transfers",
		"167",
		"012440",
		true,
		"If this pool's subtotal goes negative, the spec routes it to a CDE line depending on a 66.7(4)(a)(iii) designation this engine has no source for — see the issues list after computing.",
	),
	claimField(
		"169",
		"Regular Exp.: Deduct: current year claim per federal subsections 66.4(2) and 66.7(5)",
		"Capped at 10% of the pool subtotal (prorated by days/365 only below a 357-day tax year).",
	),
];
const ccogpeSuccessorFields: BaseField[] = [
	// Verbatim — this successor line reads "at THE end", unlike the regular
	// pool's line 151 above ("at end"); both forms appear throughout the
	// schedule and are preserved exactly per side.
	...reconciled(
		"openingBalance",
		"Successor Exp.: Balance at the end of preceding taxation year",
		"173",
		"012450",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Successor Exp.: Add: transferred on amalgamation or wind-up of subsidiary",
		"175",
		"012455",
		true,
	),
	...reconciled(
		"otherTransfer",
		"Successor Exp.: Add: transferred other than on amalgamation or wind-up of subsidiary",
		"177",
		"012460",
		true,
	),
	...reconciled(
		"receivableOnDisposition",
		"Successor Exp.: Deduct: received or receivable on disposition of Canadian oil and gas property",
		"181",
		"012470",
		true,
	),
	...reconciled(
		"transferredToSuccessor",
		"Successor Exp.: Deduct: transferred on disposition of resource property",
		"185",
		"012485",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Successor Exp.: Deduct: other deductions or transfers",
		"187",
		"012490",
		true,
		"Also the destination the spec routes a negative CCOGPE-regular pool to when no 66.7(4)(a)(iii) designation was made — not auto-applied, see the issues list.",
	),
	claimField(
		"189",
		"Successor Exp.: Deduct: current year claim per federal subsections 66.4(2) and 66.7(5)",
		"Capped at 10% of the pool subtotal, same short-year proration as the regular pool.",
	),
];

// ── FEDE — Foreign Exploration and Development Expenses ────────────────────

const fedeRegularFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Regular Exp.: Balance at end of preceding taxation year",
		"201",
		"012500",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Regular Exp.: Add: transferred on amalgamation or wind-up of subsidiary",
		"205",
		"012510",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Regular Exp.: Deduct: other deductions or transfers",
		"207",
		"012515",
		true,
	),
	// PDF line-wrap artifact normalized: source reads "Foreign - source" with
	// a spurious hyphenation space; rendered as the intended "Foreign-source".
	...reconciled(
		"foreignResourceIncome",
		"Regular Exp.: Foreign-source resource income",
		"231",
		"012530",
		false,
		"Also caps the claim below.",
	),
	claimField(
		"209",
		"Regular Exp.: Deduct: current year claim per federal subsections 66(4) and 66.7(2)",
		"Lesser of the pool and the greater of a 10%-prorated floor or foreign-source resource income.",
	),
];
const fedeSuccessorFields: BaseField[] = [
	...reconciled(
		"openingBalance",
		"Successor Exp.: Balance at the end of preceding taxation year",
		"213",
		"012550",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Successor Exp.: Add: transferred on amalgamation or wind-up of subsidiary",
		"215",
		"012555",
		true,
	),
	...reconciled(
		"otherTransfer",
		"Successor Exp.: Add: transferred other than on amalgamation or wind-up of subsidiary",
		"217",
		"012560",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Successor Exp.: Deduct: other deductions or transfers",
		"219",
		"012565",
		true,
	),
	...reconciled(
		"foreignResourceIncome",
		"Successor Exp.: Foreign-source resource income",
		"233",
		"012580",
		false,
		"Also caps the claim below.",
	),
	claimField(
		"221",
		"Successor Exp.: Deduct: current year claim per federal subsections 66(4) and 66.7(2)",
		"No percentage rate — capped only by the pool and foreign-source resource income.",
	),
];

// ── SFEDE — Specified Foreign Exploration and Development Expenses, per country ──

const sfedeRegularItemFields: BaseField[] = [
	field.text(
		"countryCode",
		"Regular Exp.: Country in which regular expenses were incurred (line 241)",
		{
			description:
				"2-letter code, must equal the federal country code (fed 012601). See Chapter 1, Appendix 1-5 of the spec for valid codes.",
		},
	),
	...reconciled(
		"openingBalance",
		"Regular Exp.: Balance at end of preceding taxation year",
		"243",
		"012600",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Regular Exp.: Amount transferred on amalgamation or wind-up of subsidiary",
		"247",
		"012610",
		true,
	),
	...reconciled(
		"otherAdditions",
		"Regular Exp.: Other additions",
		"249",
		"012611",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Regular Exp.: Other deductions or transfers",
		"251",
		"012615",
		true,
	),
	...reconciled(
		"foreignResourceIncome",
		"Regular Exp.: Foreign resource income",
		"257",
		"012630",
		false,
		"Also caps the claim below.",
	),
	claimField(
		"253",
		"Regular Exp.: Current year claim per federal subsection 66(4)",
		"Lesser of the pool and the greater of a 10%-prorated floor or this country's foreign resource income.",
	),
];
const sfedeSuccessorItemFields: BaseField[] = [
	field.text(
		"countryCode",
		"Successor Exp.: Country in which successor expenses were incurred (line 261)",
		{
			description:
				"2-letter code, must equal the federal country code (fed 012651).",
		},
	),
	// Verbatim — no "the" here, unlike the CCOGPE/FEDE successor "balance"
	// lines elsewhere in this schedule, which read "at THE end".
	...reconciled(
		"openingBalance",
		"Successor Exp.: Balance at end of preceding taxation year",
		"263",
		"012650",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Successor Exp.: Amount transferred on amalgamation or wind-up of subsidiary",
		"265",
		"012655",
		true,
	),
	...reconciled(
		"otherTransfer",
		"Successor Exp.: Amount transferred other than on amalgamation or wind-up of subsidiary",
		"267",
		"012660",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Successor Exp.: Other deductions or transfers",
		"269",
		"012665",
		true,
	),
	...reconciled(
		"foreignResourceIncome",
		"Successor Exp.: Foreign resource income",
		"277",
		"012680",
		false,
		"Also caps the claim below.",
	),
	claimField(
		"273",
		"Successor Exp.: Current year claim per federal subsection 66.7(2)",
		"No percentage rate — capped only by the pool and this country's foreign resource income.",
	),
];

// ── CFRE — Cumulative Foreign Resource Expenses, per country ───────────────

const cfreRegularItemFields: BaseField[] = [
	field.text(
		"countryCode",
		"Regular Exp.: Country in which regular expenses were incurred (line 281)",
		{
			description:
				"2-letter code, must equal the federal country code (fed 012701).",
		},
	),
	// Verbatim — "at THE end of THE preceding taxation year" (both articles
	// present), distinct from every other pool's "balance" caption.
	...reconciled(
		"openingBalance",
		"Regular Exp.: Balance at the end of the preceding taxation year",
		"283",
		"012700",
		true,
	),
	...reconciled(
		"currentYearExpenses",
		"Regular Exp.: Current year expenses",
		"285",
		"012705",
		false,
	),
	...reconciled(
		"amalgamationTransfer",
		"Regular Exp.: Amount transferred on amalgamation or wind-up of subsidiary",
		"287",
		"012710",
		true,
	),
	...reconciled(
		"otherAdditions",
		"Regular Exp.: Other additions",
		"289",
		"012711",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Regular Exp.: Other deductions or transfers",
		"291",
		"012715",
		true,
	),
	...reconciled(
		"foreignResourceIncome",
		"Regular Exp.: Foreign resource income (loss)",
		"297",
		"012730",
		false,
		"Also feeds the claim cap below, summed across every country too.",
	),
	money(
		"globalForeignResourceLimit",
		"Global foreign resource limit designated for this country",
		{
			description:
				"Referenced by line 015293's formula but not defined anywhere in this engine's spec source, and has no line number of its own — leave blank to have the engine treat this component as nil (the conservative, under-claim direction) and flag it in the issues list.",
		},
	),
	claimField(
		"293",
		"Regular Exp.: Current year claim per federal subsection 66.21(4)",
		"= A + B: A is a 10%-floor/30%-income-capped amount from this country's own pool; B draws on the global limit above.",
	),
];
const cfreSuccessorItemFields: BaseField[] = [
	field.text(
		"countryCode",
		"Successor Exp.: Country in which successor expenses were incurred (line 301)",
		{
			description:
				"2-letter code, must equal the federal country code (fed 012751).",
		},
	),
	...reconciled(
		"openingBalance",
		"Successor Exp.: Balance at the end of the preceding taxation year",
		"303",
		"012750",
		true,
	),
	...reconciled(
		"amalgamationTransfer",
		"Successor Exp.: Amount transferred on amalgamation or wind-up of subsidiary",
		"305",
		"012755",
		true,
	),
	...reconciled(
		"otherTransfer",
		"Successor Exp.: Amount transferred other than on amalgamation or wind-up of subsidiary",
		"307",
		"012760",
		true,
	),
	...reconciled(
		"otherDeductions",
		"Successor Exp.: Other deductions or transfers",
		"309",
		"012765",
		true,
	),
	...reconciled(
		"foreignResourceIncome",
		"Successor Exp.: Foreign resource income (loss)",
		"317",
		"012780",
		false,
		"Feeds the claim cap below, summed across every country.",
	),
	claimField(
		"313",
		"Successor Exp.: Current year claim per federal subsection 66.7(2.3)",
		"Capped at 30%-prorated pool OR the sum of every country's foreign resource income, whichever is less.",
	),
];

// ── Schema ────────────────────────────────────────────────────────────────

export const albertaSchedule15Schema: FormSchema = defineSchema({
	sections: [
		section(
			"jacket",
			"Short-year proration",
			[
				money("daysInTaxYear", "Days in the tax year", {
					description:
						"Blank = 365. Prorates the CDE/CCOGPE/FEDE-regular/SFEDE-regular/CFRE claim caps for a short tax year.",
				}),
			],
			{
				variant: "card",
				cols: 3,
				description:
					"Per the spec, this form cannot be completed at all when the AT1 jacket's divergence flags (lines 000060 and 000061, on the main Alberta jacket schedule) are both No, and IS required once any opening balance or claim below differs from federal.",
			},
		),
		section(
			"eda",
			"Continuity of Earned Depletion Base (line 001-021)",
			[
				field.group(
					"edaRegular",
					"Regular expenses (line 001-009)",
					edaRegularFields,
					{ cols: 2 },
				),
				field.group(
					"edaSuccessor",
					"Successor expenses (line 011-021)",
					edaSuccessorFields,
					{ cols: 2 },
				),
			],
			{
				variant: "card",
				description:
					"A grandfathered pool — new earned depletion allowance has not accrued since the mid-1990s, but a legacy balance can still be drawn down.",
			},
		),
		section(
			"cmedb",
			"Continuity of Mining Exploration Depletion Base (line 023-033)",
			[
				field.group("cmedb", "Continuity (line 023-033)", cmedbFields, {
					cols: 2,
				}),
			],
			{ variant: "card", description: "No successor side on this pool." },
		),
		section(
			"cee",
			"Cumulative Canadian Exploration Expenses (line 041-083)",
			[
				field.group(
					"ceeRegular",
					"Regular expenses (line 041-063)",
					ceeRegularFields,
					{ cols: 2 },
				),
				field.group(
					"ceeSuccessor",
					"Successor expenses (line 064-083)",
					ceeSuccessorFields,
					{ cols: 2 },
				),
			],
			{ variant: "card" },
		),
		section(
			"cde",
			"Cumulative Canadian Development Expenses (line 091-143)",
			[
				field.group(
					"cdeRegular",
					"Regular expenses (line 091-117)",
					cdeRegularFields,
					{ cols: 2 },
				),
				field.group(
					"cdeSuccessor",
					"Successor expenses (line 119-143)",
					cdeSuccessorFields,
					{ cols: 2 },
				),
			],
			{
				variant: "card",
				description:
					"The credit-balance lines (105/133) cross-reference the CCOGPE pool below — the engine computes CCOGPE first and feeds its negative subtotal in automatically. See each field's description for the designation ambiguity this may still need manual confirmation on.",
			},
		),
		section(
			"ccogpe",
			"Cumulative Canadian Oil and Gas Property Expenses (line 151-191)",
			[
				field.group(
					"ccogpeRegular",
					"Regular expenses (line 151-171)",
					ccogpeRegularFields,
					{ cols: 2 },
				),
				field.group(
					"ccogpeSuccessor",
					"Successor expenses (line 173-191)",
					ccogpeSuccessorFields,
					{ cols: 2 },
				),
			],
			{ variant: "card" },
		),
		section(
			"fede",
			"Foreign Exploration and Development Expenses (line 201-233)",
			[
				field.group(
					"fedeRegular",
					"Regular expenses (line 201-211, 231)",
					fedeRegularFields,
					{ cols: 2 },
				),
				field.group(
					"fedeSuccessor",
					"Successor expenses (line 213-223, 233)",
					fedeSuccessorFields,
					{ cols: 2 },
				),
			],
			{ variant: "card" },
		),
		section(
			"sfede",
			"Specified Foreign Exploration and Development Expenses (line 241-277, per country)",
			[
				field.array(
					"sfedeRegular",
					"Regular expenses, by country (line 241-257)",
					sfedeRegularItemFields,
				),
				field.array(
					"sfedeSuccessor",
					"Successor expenses, by country (line 261-277)",
					sfedeSuccessorItemFields,
				),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"One row per country. A row without a country code is not filed.",
			},
		),
		section(
			"cfre",
			"Cumulative Foreign Resource Expenses (line 281-317, per country)",
			[
				field.array(
					"cfreRegular",
					"Regular expenses, by country (line 281-297)",
					cfreRegularItemFields,
				),
				field.array(
					"cfreSuccessor",
					"Successor expenses, by country (line 301-317)",
					cfreSuccessorItemFields,
				),
			],
			{
				variant: "card",
				cols: 1,
				description:
					"One row per country. The regular pool's claim caps (line 293) partly depend on the SUM of every country's foreign resource income and the undefined \"global foreign resource limit\" — see each field's description.",
			},
		),
	],
});

export const albertaResourceDeductions15 = defineSchedule({
	key: "albertaResourceDeductions15",
	num: "015",
	label: "Resource Related Deductions (S15)",
	hint: "Eight resource-expense pool continuities",
	programs: ["AT1"],
	schema: albertaSchedule15Schema,
});
