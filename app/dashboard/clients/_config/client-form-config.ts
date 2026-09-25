import { defineSchema, field, section } from "@classytic/formkit";

/**
 * Field-values shape for the client form. Passed as the explicit generic to
 * every `field.*`/`section`/`defineSchema` call so the whole schema shares one
 * `TFieldValues` — otherwise each builder infers a narrow per-name type from
 * its string literal and the section array won't unify under strict TS.
 */
export type ClientFormValues = {
	name: string;
	businessNumber: string;
	corpType?: string;
	fiscalYearEndMonth?: number;
};

const CORP_TYPES = [
	{ value: "CCPC", label: "CCPC: Canadian-controlled private corporation" },
	{ value: "Other private", label: "Other private corporation" },
	{ value: "Public", label: "Public corporation" },
];

/**
 * Client form schema (formkit) — the corporation, not its return.
 *
 * Lean on purpose. The AT1 identification block (CAN, address, contact, SIC
 * code, type of corporation, CIT email) is typed on the AT1 jacket itself, as
 * in every tax package, and files from there (`at1-identity.ts` on the
 * server). Values already stored on a client still apply as the jacket's
 * fallback, so nothing here was lost — it just no longer has to be entered
 * twice, or before the return exists.
 *
 * Corporation type stays: it decides CCPC status for the small business
 * deduction, and the server reads it from here, never from the request.
 */
export function getClientFormSchema() {
	return defineSchema<ClientFormValues>({
		sections: [
			section<ClientFormValues>("identity", "Corporation", [
				field.text<ClientFormValues>("name", "Legal name", {
					required: true,
					fullWidth: true,
					placeholder: "Acme Holdings Ltd.",
				}),
				field.text<ClientFormValues>("businessNumber", "Business Number (BN)", {
					required: true,
					// The corporation income tax program account, as T2 line 001 and
					// AT1 line 035 ("AN 15", = fed 200001) both file it. The reference
					// after RC is not always 0001, so it is entered, never assumed.
					placeholder: "15 characters, e.g. 100092287RC0001",
					pattern: {
						regex: "^\\d{9}RC\\d{4}$",
						message:
							"The full program account: 9-digit BN, RC, then the 4-digit reference — e.g. 100092287RC0001",
					},
				}),
				field.select<ClientFormValues>(
					"corpType",
					"Corporation type",
					CORP_TYPES,
				),
				field.number<ClientFormValues>(
					"fiscalYearEndMonth",
					"Fiscal year-end month",
					{ min: 1, max: 12, placeholder: "1–12" },
				),
			]),
		],
	});
}
