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
};

const CORP_TYPES = [
  { value: "CCPC", label: "CCPC: Canadian-controlled private corporation" },
  { value: "Other private", label: "Other private corporation" },
  { value: "Public", label: "Public corporation" },
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
    ],
  });
}
