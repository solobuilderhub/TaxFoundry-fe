import { defineSchema, field, section } from "@classytic/formkit";

export type CertificationValues = {
  firstName: string;
  lastName: string;
  position: string;
};

/**
 * Authorized-signer certification captured before prepare-netfile / transmit.
 * The server's prepare/transmit actions require these three fields.
 */
export function getCertificationSchema() {
  return defineSchema<CertificationValues>({
    sections: [
      section<CertificationValues>("cert", "Authorized signer", [
        field.text<CertificationValues>("firstName", "First name", {
          required: true,
        }),
        field.text<CertificationValues>("lastName", "Last name", {
          required: true,
        }),
        field.text<CertificationValues>("position", "Position", {
          required: true,
          placeholder: "e.g. Director",
        }),
      ]),
    ],
  });
}
