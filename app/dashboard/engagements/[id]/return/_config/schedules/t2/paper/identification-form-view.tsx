"use client";

import type { Control } from "react-hook-form";
import type { IdentificationValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";

interface JacketField {
	line: string;
	caption: string;
	fieldName: keyof IdentificationValues;
	note?: string;
}

/**
 * T2 jacket, PAGE 1 (identification) — NOT covered by `T2_JACKET` in
 * `packages/ca-tax/src/t2/forms/jacket.ts`, whose own doc comment states
 * pages 1-2 are "filing metadata rather than a computation, and is not
 * modelled here." No FormDefinition exists for this page, so these lines
 * were verified DIRECTLY against the rendered PDF
 * (`research/sources/cra-forms/pdf/T2-jacket.pdf`, pages 1-2, rendered via
 * PyMuPDF since the raw `pdftotext -layout` extraction for this page is
 * unreliable — the same class of caption/number misalignment already found
 * on Schedule 5 and Schedule 13) — NOT from the guided editor's own
 * pre-existing captions, several of which turned out to be citing the wrong
 * line entirely:
 *
 *   addressChanged  was "(line 063)"  — 063 is actually acquisition of control
 *   firstReturn     was "(line 067)"  — 067 is actually professional corp/partnership
 *   nonResident     was "(line 071)"  — 071 is actually first year after amalgamation
 *   amalgamation    was "(line 072)"  — 072 is actually wind-up of a subsidiary
 *   windUp          was "(line 076)"  — 076 is actually final year BEFORE amalgamation
 *                                        (a different concept from windUp entirely)
 *
 * Corrected here AND in `identification.ts`'s own guided-editor captions
 * (both fixed together — see that file's comment for the same table).
 *
 * SEPARATELY, and more significant than the line-number mix-up: as of
 * 2026-09-03 most of this schedule's Yes/No fields DO feed the filed T2 CIF
 * jacket questionnaire (`apps/server/src/filing/t2-cif.service.ts` +
 * `packages/ca-tax/src/t2/filing/t2-cif-renderer.ts`) — a real gap where
 * they were previously collected and silently discarded before reaching the
 * filed payload. What's STILL true: none of them feed a computed DOLLAR
 * figure (`acquisitionOfControl`/`deemedYearEnd`/`amalgamation`/`windUp` can
 * genuinely force a short tax year with its own proration under the Act,
 * which this app does not model), and `corpType` genuinely does nothing —
 * CCPC/SBD eligibility is deliberately sourced ONLY from the client record
 * (a trust-boundary decision in `engagement-compute.service.ts`, not an
 * oversight — see that row's own note below). See
 * `research/findings/federal/T2-identification-schedule-is-inert.md` for the
 * full history.
 */
const FIELDS: readonly JacketField[] = [
	{ line: "040", caption: "Type of corporation at the end of the tax year", fieldName: "corpType" },
	{
		line: "063",
		caption: "Has there been an acquisition of control resulting in the application of subsection 249(4) since the tax year start?",
		fieldName: "acquisitionOfControl",
	},
	{
		line: "066",
		caption: "Is the date on line 061 a deemed tax year-end according to subsection 249(3.1)?",
		fieldName: "deemedYearEnd",
	},
	{
		line: "067",
		caption: "Is the corporation a professional corporation that is a member of a partnership?",
		fieldName: "professionalCorp",
	},
	{ line: "070", caption: "Is this the first year of filing after incorporation?", fieldName: "firstReturn" },
	{ line: "071", caption: "Is this the first year of filing after amalgamation?", fieldName: "amalgamation" },
	{
		line: "072",
		caption: "Has there been a wind-up of a subsidiary under section 88 during the current tax year?",
		fieldName: "windUp",
	},
	{ line: "078", caption: "Is this the final return up to dissolution?", fieldName: "finalReturn" },
	{
		line: "080",
		caption: "Is the corporation a resident of Canada?",
		fieldName: "nonResident",
		note: "The printed form asks the OPPOSITE of this app's field — this app collects \"is the corporation a NON-resident\", so a preparer answering Yes here means the printed form's own line 080 would read No. Shown as entered, not inverted, to avoid a second place this could drift from what was actually typed.",
	},
	{
		line: "150",
		caption: "Is the corporation related to any other corporations?",
		fieldName: "relatedCorporations",
		note: "Schedule 9.",
	},
];

/**
 * Federal T2 jacket, page 1 (Identification) and the start of page 2
 * (Attachments) — the portion `identification.ts`'s guided editor collects.
 * See this file's own doc comment for the line-number corrections and the
 * (more significant) finding that most of these answers are not yet
 * consumed by any computation or filing output in this app.
 */
export function IdentificationFormView({
	control,
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const identControl = control as unknown as Control<IdentificationValues>;

	const resolveLine: ResolveLine = (line): LineValue => {
		const field = FIELDS.find((f) => f.line === line);
		return field ? { editable: true, name: field.fieldName } : { editable: false, value: undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Feeds the filed jacket Yes/No answers — not any computed dollar figure"
				description="Every Yes/No field below now answers the matching line in the filed T2 CIF questionnaire. None of them changes a computed dollar figure: acquisitionOfControl/deemedYearEnd/amalgamation/windUp can genuinely force a short tax year with its own proration under the Act, which this app does not model, and line 040 (type of corporation) is READ from the client record instead — see the note on that row — since CCPC/SBD eligibility is a trust-boundary fact, not a return input."
				formId="T2"
			>
				<p className="p-4 text-xs text-muted-foreground">
					research/findings/federal/T2-identification-schedule-is-inert.md
				</p>
			</PaperSection>
			<PaperSection
				title="Identification and attachments (page 1-2)"
				description="Line numbers verified directly against the rendered PDF, not the guided editor's original (several wrong) citations — see this schedule's own source comment."
				formId="T2"
			>
				{FIELDS.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind={f.line === "040" ? "code" : "bool-flag"}
						role="input"
						note={
							f.line === "040"
								? "This app's actual CCPC/SBD-eligibility determination reads the CLIENT RECORD's own corporation-type field, not this one — confirmed in engagement-compute.service.ts. Answering here does not change SBD eligibility."
								: f.note
						}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={identControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
		</div>
	);
}
