import { defineSchema, field, section } from "@classytic/formkit";

export type CertificationValues = {
	firstName: string;
	lastName: string;
	position: string;
	/** AT1 transmit only — the filer's agreement to TRA's declaration. */
	declarationAgreed?: boolean;
};

/**
 * TRA's Net File declaration, verbatim (AT1 specification §3.3.12). It must be
 * presented, exactly as written, on every submission and agreed to before the
 * software may transmit; TRA may refuse or revoke certification otherwise.
 */
export const AT1_DECLARATION = [
	"This return meets Alberta Corporate Net File eligibility requirements.",
	"I will not attempt to disrupt Alberta Corporate Net File service by uploading files other than an eligible Alberta corporate income tax return. If I do, Tax and Revenue Administration (TRA) may deny me access to electronic services.",
	"I am an authorized signing officer of the corporation, or, if I am acting on behalf of the corporation, an authorized signing officer of the corporation has instructed me to file this return.",
	"I certify, or, if filing on behalf of a corporation, an authorized signing officer of the corporation has certified, that this electronic return, including schedules, is a true, correct and complete return and that the method of computing income for this taxation year is consistent with that of the previous taxation year except as specifically disclosed on the return.",
] as const;

/**
 * Authorized-signer certification captured before prepare-netfile / transmit.
 * The server's prepare/transmit actions require these three fields.
 *
 * `at1Declaration` adds TRA's declaration and a required agreement — for the
 * AT1 transmit dialog, not for preparing a payload to look at.
 */
export function getCertificationSchema(
	options: { at1Declaration?: boolean } = {},
) {
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
			...(options.at1Declaration
				? [
						section<CertificationValues>(
							"declaration",
							"Declaration",
							[
								field.switch<CertificationValues>(
									"declarationAgreed",
									"I have read and agree to the above.",
									{ required: true },
								),
							],
							{
								cols: 1,
								description: AT1_DECLARATION.join("\n\n"),
								// Four paragraphs, presented "exactly as below" (§3.3.12).
								className: "whitespace-pre-line",
							},
						),
					]
				: []),
		],
	});
}
