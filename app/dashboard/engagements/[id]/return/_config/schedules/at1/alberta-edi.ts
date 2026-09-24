import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { EdiValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import {
	EDI_ORGANIZATION_TYPE_OPTIONS,
	EDI_THIRD_PARTY_OPTIONS,
} from "../../options";
import { defineSchedule } from "../shared/define";
import { EdiFormView } from "./paper/edi-form-view";

const f = fieldsFor<EdiValues>();

/**
 * The EDI schedule — Net File transmitter / software identity.
 *
 * `<Schedule Number="EDI">` in the AT1 Net File payload: who transmitted the
 * return, and with what software. It sits between the jacket (000) and Schedule
 * 1 in the nav because that is where it sits in the transmission.
 *
 * ── This schedule is the only source for these values ──────────────────────
 *
 * They came from environment variables read at server boot
 * (`src/config/at1-transmitter.ts`) with no way to see or set them, so an
 * unconfigured deployment carried `AB0000` and `0000000000` — exactly the two
 * placeholders `validateAt1Transmitter` exists to refuse — and nothing said so
 * until a live transmission came back rejected with a bare numeric code.
 *
 * That file is deleted. A first attempt kept it as a FALLBACK behind these
 * boxes; that was worse than either option alone, because the payload would
 * then state the filer's identity from two sources at once and a blank box
 * could mean either "nil" or "whatever the server happens to be configured
 * with". Filing is the one place a value must have exactly one origin.
 *
 * So a blank box transmits blank and `validateAt1Transmitter` refuses the
 * transmission naming each empty mandatory field — ten of them on an untouched
 * return. Computing and reviewing still work with it incomplete; only
 * transmitting is blocked, because refusing to render is not how a preparer
 * discovers which box is empty.
 *
 * The AT1 jacket also states the certification code, at 000005001, and it
 * reads line 001 from here — so the two halves of a transmission cannot name
 * different software.
 *
 * ── Captions are OURS, and deliberately so ─────────────────────────────────
 *
 * There is no `FormDefinition` behind this schedule, which makes it the only
 * one in the editor without one. The line numbers below are real — every one
 * comes from `AT1_EDI_LINE_ITEMS` in `@classytic/ca-tax`, transcribed from
 * spec §3.3.6.1 — but the WORDING is this codebase's own, because that section
 * is not in this checkout. Another vendor's rendering of the same schedule is
 * a lead, never a source for the words.
 *
 * When §3.3.6.1 is to hand this gets a proper form definition and a paper
 * layout like every other schedule. Two of its lines wait on the same thing:
 * EDI021 (organization operating name) and EDI039 (fax number) are absent
 * here, unverified.
 *
 * ── What is NOT here ───────────────────────────────────────────────────────
 *
 * EDI071 (amended return indicator) and EDI073 (description of changes). Those
 * two ARE per-return, and they already have a home on the engagement record.
 * Collecting them again here would give one figure two sources.
 */
export const albertaEdi = defineSchedule({
	key: "edi",
	num: "EDI",
	label: "Net File transmitter (EDI)",
	hint: "Who transmits the return, and with what software — required before it can be filed",
	programs: ["AT1"],
	formView: (props) => createElement(EdiFormView, props),
	// Every field is editable on the form itself — the printed form is the only view.
	formOnly: true,
	schema: defineSchema({
		sections: [
			section(
				"software",
				"Software identification",
				[
					f.text(
						"softwareCertCode",
						"Software Certification Code (line EDI001)",
						{
							description:
								"The code TRA issued at certification. Validated against TRA's own registry — a wrong one is error 20010 and the return is rejected before anything else is read. Also filed on the AT1 jacket at line 000005001, from this same box.",
						},
					),
					f.text("serialNumber", "Software serial number (line EDI015)", {
						description:
							"TRA checks that this is present (error 20013), not what it says.",
					}),
					f.text("webServiceVersion", "Web service version (line EDI011)", {
						description:
							"The Net File web service version this payload is built for.",
					}),
					f.text("softwareVersion", "Software version (line EDI013)", {
						description: "This product's own version.",
					}),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Properties of the software rather than of this return, but taken from here and nowhere else — a blank box is transmitted blank and the return is refused naming the field.",
				},
			),
			section(
				"organization",
				"Third party service provider",
				[
					f.select(
						"thirdPartyIndicator",
						"Is the return filed by a third party? (line EDI017)",
						EDI_THIRD_PARTY_OPTIONS,
						{
							description:
								'There is no "unanswered" here: a filer who is not a third party answers No. Answering Yes makes the organization type and the full address below mandatory — TRA rejects an incomplete set with error 10025.',
						},
					),
					f.select(
						"organizationType",
						"Type of organization (line EDI023)",
						EDI_ORGANIZATION_TYPE_OPTIONS,
						{ description: "Required when the answer above is Yes." },
					),
					f.text("legalName", "Organization legal name (line EDI019)"),
				],
				{ variant: "card", cols: 2 },
			),
			section(
				"contact",
				"Contact",
				[
					f.text("contactFirstName", "First name (line EDI031)"),
					f.text("contactLastName", "Last name (line EDI033)"),
					f.text("contactPosition", "Position (line EDI035)"),
					f.text("contactPhone", "Telephone number (line EDI037)", {
						description:
							"10 to 15 digits, numbers only. TRA rejects punctuation and placeholders with error 20100.",
					}),
					f.text("contactEmail", "E-mail address (line EDI041)"),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"The person TRA contacts about a transmission problem — the filer's own staff, not the corporation's.",
				},
			),
			section(
				"address",
				"Address",
				[
					f.text("addressStreet", "Address line 1 (line EDI051)"),
					f.text("addressLine2", "Address line 2 (line EDI053)", {
						description: "Always optional, whatever line EDI017 says.",
					}),
					f.text("addressCity", "City or town (line EDI055)"),
					f.text("addressProvince", "Province or state (line EDI057)", {
						description:
							"Two-letter code. Checked against TRA's province table when the country is CA or US.",
					}),
					f.text("addressPostalCode", "Postal or ZIP code (line EDI059)", {
						description: "A9A 9A9 for Canada; five or nine digits for the US.",
					}),
					f.text("addressCountry", "Country (line EDI061)", {
						description: "Two-letter code — CA, US.",
					}),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"The transmitting organization's own mailing address. Mandatory in full whenever line EDI017 is Yes, apart from line 2.",
				},
			),
		],
	}),
});
