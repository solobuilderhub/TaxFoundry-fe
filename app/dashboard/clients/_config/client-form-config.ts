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
  corporateAccountNumber?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
  contactPerson?: string;
  contactTelephone?: string;
  natureOfBusiness?: string;
  typeOfCorporation?: string;
  authorizedEmail?: string;
};

const CORP_TYPES = [
  { value: "CCPC", label: "CCPC: Canadian-controlled private corporation" },
  { value: "Other private", label: "Other private corporation" },
  { value: "Public", label: "Public corporation" },
];

/**
 * AT1 field 000029 — Type of Corporation, a single-digit code. Codes are from
 * the AT1 Net File specification (Chapter 3, field 029), not invented here:
 * a CCPC at year end but not throughout the year files as 5, not 1.
 */
const AT1_TYPE_OF_CORPORATION = [
  { value: "1", label: "1 — Canadian-controlled private corporation" },
  { value: "2", label: "2 — Alberta professional corporation" },
  { value: "3", label: "3 — Other private corporation" },
  { value: "4", label: "4 — Public corporation" },
  { value: "5", label: "5 — Other (incl. CCPC at year end but not throughout)" },
];

/**
 * Client form schema (formkit). Mirrors the server `client` model. Rendered by
 * fluid's SchemaFormSheet via FluidFormSystemProvider — no hand-wired inputs.
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
          placeholder: "9 digits, e.g. 100092287",
        }),
        field.select<ClientFormValues>("corpType", "Corporation type", CORP_TYPES),
        field.number<ClientFormValues>(
          "fiscalYearEndMonth",
          "Fiscal year-end month",
          { min: 1, max: 12, placeholder: "1–12" },
        ),
      ]),
      section<ClientFormValues>("alberta", "Alberta filing identity", [
        field.text<ClientFormValues>(
          "corporateAccountNumber",
          "Alberta Corporate Account Number (CAN)",
          { placeholder: "Alberta CAN on the AT1" },
        ),
        // Nested object — child names are relative to the group.
        field.group<ClientFormValues>("address", "Registered address", [
          field.text("street", "Street", { fullWidth: true }),
          field.text("city", "City"),
          field.text("postalCode", "Postal code", { placeholder: "T2P 0A0" }),
        ]),
      ]),
      // Every field below is MANDATORY on the AT1 and has no safe default, so
      // `assertAt1MandatoryComplete` refuses the filing when one is absent.
      // They live on the client rather than the return because they describe
      // the corporation, not the year — but they were previously collected by
      // the server model only, which made the AT1 filing path unsatisfiable
      // from the UI. Not marked `required` here: a client may be created for a
      // federal-only T2 engagement, where none of these apply.
      section<ClientFormValues>("at1-contact", "Alberta AT1 contact and codes", [
        field.text<ClientFormValues>("contactPerson", "Contact person", {
          placeholder: "Who TRA may contact about the return",
        }),
        field.text<ClientFormValues>("contactTelephone", "Contact telephone", {
          placeholder: "10 digits, e.g. 4035550142",
        }),
        field.text<ClientFormValues>("authorizedEmail", "CIT authorized email", {
          fullWidth: true,
          placeholder: "Address TRA sends corporate income tax notices to",
        }),
        field.text<ClientFormValues>("natureOfBusiness", "Nature of business", {
          placeholder: "4-digit code, e.g. 0198",
        }),
        field.select<ClientFormValues>(
          "typeOfCorporation",
          "Type of corporation (AT1)",
          AT1_TYPE_OF_CORPORATION,
        ),
      ]),
    ],
  });
}
