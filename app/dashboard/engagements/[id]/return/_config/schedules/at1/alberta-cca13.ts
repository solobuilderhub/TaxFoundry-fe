import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaCca13Values } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { CCA_CLASS_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule13FormView } from "./paper/schedule13-form-view";

const f = fieldsFor<AlbertaCca13Values>();

/**
 * AT1 Schedule 13 — Alberta Capital Cost Allowance.
 *
 * Alberta permits a different discretionary CCA claim from federal: a
 * corporation may claim a class federally and not provincially, or the
 * reverse. Only the opening UCC and the claim can diverge, which is why the
 * form is required precisely "if the opening UCC or the CCA claimed for
 * Alberta purposes for any class of assets differs from that for federal
 * purposes".
 *
 * ── Why this is its own schedule now ────────────────────────────────────────
 *
 * These two figures used to be extra fields on the FEDERAL CCA class
 * (`cca.classes[].albertaOpeningUCC` / `.albertaClaim`). One `ReturnInput` key
 * held both jurisdictions' forms, and the registry pins one nav entry per key
 * — so Alberta Schedule 13 could only ever be a second grid inside federal
 * Schedule 8's entry, invisible under the "AT1 only" filter and reachable only
 * by someone who already knew it was there.
 *
 * Rows pair back to the federal classes BY `ccaClass`, the class number, which
 * is the class's identity on both returns — never by position, so the two
 * lists can differ in length and order.
 *
 * Every row is an OVERRIDE: omit a class and Alberta takes the federal figure.
 * An explicit 0 is a real answer ("claim nothing for Alberta"), not a blank.
 *
 * TRA forbids the schedule outright unless jacket line 000060 or 000061 says
 * the return diverges — entering figures here is not enough on its own.
 */
export const albertaCca13 = defineSchedule({
	key: "albertaCca13",
	num: "013",
	label: "Alberta Capital Cost Allowance (S13)",
	hint: "Per-class overrides where Alberta's UCC or claim differs from federal",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule13FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"classes",
				"Alberta CCA by class (line 003, 019)",
				[
					f.array("classes", "Classes that diverge", [
						field.select("ccaClass", "Class", CCA_CLASS_OPTIONS, {
							placeholder: "Select a CCA class",
							description:
								"Pairs this row to the federal class of the same number.",
						}),
						money("openingUCC", "Alberta opening UCC (line 003)", {
							description: "Blank = the same as federal.",
						}),
						money("claim", "Alberta CCA claim (line 019)", {
							description:
								"Blank = the same as federal; an explicit 0 claims nothing for Alberta, which is a real answer.",
						}),
					]),
				],
				{
					variant: "card",
					cols: 1,
					description:
						"Add a row only for a class whose Alberta figures DIFFER from federal — anything omitted takes the federal figure. The other twenty-two printed columns are federal or computed; see Form View for the whole grid.",
				},
			),
		],
	}),
});
