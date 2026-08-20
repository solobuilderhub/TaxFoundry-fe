import { defineSchema, field, section, type BaseField } from "@classytic/formkit";
import { T183_METHODS } from "@/api/engagements";

/**
 * A date-AND-time field. Formkit has no `datetime` builder, but fluid registers
 * a `datetime` adapter, so the type is overridden the same way `money` is in
 * `return/_config/fields.ts`.
 *
 * Date alone will not do here: CRA requires an electronic signature to report
 * the date **and time** the form was signed.
 */
const datetime = <T extends Record<string, unknown>>(
  name: string,
  label: string,
  props?: Parameters<typeof field.text>[2],
): BaseField<T> =>
  ({ ...field.text(name, label, props), type: "datetime" }) as unknown as BaseField<T>;

export type T183Values = {
  officerName: string;
  officerPosition: string;
  signedAt: string;
  authorizationMethod: string;
  evidenceRef: string;
  formVersion: string;
};

/**
 * Form T183CORP — the corporate officer's authorization to e-file.
 *
 * ── Why every field here is entered rather than assumed ─────────────────────
 *
 * CRA requires an authorized signing officer **of the corporation** to complete
 * and sign the T183CORP *before* the return is transmitted; for an electronic
 * signature the form must report **the date and time it was signed**; and the
 * transmitter keeps the signed original for **six years**.
 *
 * The server used to default `signedAt` to "now" and the method to
 * `wet_signature`. Both are gone: a signing moment nobody observed is a
 * fabricated attestation, and defaulting to a method that PERMITS filing is
 * backwards for a control that gates transmission. Submitting without them is
 * refused, so they are asked for here.
 *
 * ── The officer is not the preparer ─────────────────────────────────────────
 *
 * This is a separate control from the review sign-off. Sign-off is the
 * preparer's attestation that the review is complete; this is the client
 * corporation's officer certifying they examined the return. Recording it is
 * deliberately not available to an automated caller — an officer of the client
 * is a person, never the software preparing the return.
 *
 * Bound to the CURRENT computed return, so a recompute invalidates it and it
 * must be captured again.
 */
export function getT183Schema() {
  return defineSchema<T183Values>({
    sections: [
      section<T183Values>(
        "officer",
        "Authorized signing officer",
        [
          field.text<T183Values>("officerName", "Officer name", {
            required: true,
            placeholder: "e.g. Jane Okafor",
            description: "The officer of the corporation, not the preparer.",
          }),
          field.text<T183Values>("officerPosition", "Position, office or rank", {
            required: true,
            placeholder: "e.g. President",
          }),
        ],
        { variant: "card", cols: 2 },
      ),
      section<T183Values>(
        "signature",
        "Signature",
        [
          datetime<T183Values>("signedAt", "Date and time signed", {
            required: true,
            description: "When the officer signed — not now.",
          }),
          field.select<T183Values>(
            "authorizationMethod",
            "How it was authorized",
            [...T183_METHODS],
            {
              required: true,
              description: "Only wet or electronic permits filing.",
            },
          ),
          field.text<T183Values>("evidenceRef", "Where the signed T183 is retained", {
            required: true,
            placeholder: "e.g. DMS reference, file name",
            description: "You must keep the signed original for six years.",
          }),
          field.text<T183Values>("formVersion", "Form version", {
            placeholder: "e.g. T183CORP-2024",
          }),
        ],
        // Two columns now that the dialog is wide enough for them: the signing
        // moment beside the method, and the retention reference beside the form
        // version. Six stacked fields ran past the bottom of the viewport.
        { variant: "card", cols: 2 },
      ),
    ],
  });
}
