"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { IdentificationValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type {
	LineValue,
	NavigateToLine,
	ResolveLine,
} from "../../at1/paper/resolve-line";
import {
	T2_JACKET_FIELDS,
	T2_JACKET_SECTIONS,
} from "./generated/jacket.layout";
import { PaperFormSections } from "./paper-form-sections";

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
/**
 * The jacket lines this app collects, and the notes that belong to them rather
 * than to the form.
 *
 * The captions are gone: page 1 of the jacket is now modelled in
 * `T2_JACKET`'s own `identification` section, hand-authored from the rendered
 * page, so retyping them here would be a third transcription of the same PDF.
 * What stays is the mapping to this app's own field names, which no form
 * definition can know, and the two warnings that are about THIS APP rather
 * than about the form.
 *
 * Line 150 is not here. It is on page 2 (the attachments checklist), which the
 * jacket definition deliberately does not model, so its row is still written
 * out by hand below.
 */
const BOUND_FIELDS: Readonly<Record<string, keyof IdentificationValues>> = {
	"040": "corpType",
	"063": "acquisitionOfControl",
	"066": "deemedYearEnd",
	"067": "professionalCorp",
	"070": "firstReturn",
	"071": "amalgamation",
	"072": "windUp",
	"078": "finalReturn",
	"080": "nonResident",
};

/**
 * Federal T2 jacket, page 1 (Identification) and the start of page 2
 * (Attachments) — the portion `identification.ts`'s guided editor collects.
 * See this file's own doc comment for the line-number corrections and the
 * (more significant) finding that most of these answers are not yet
 * consumed by any computation or filing output in this app.
 */
export function IdentificationFormView({
	control,
	computed,
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	computed?: ComputedReturn;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const identControl = control as unknown as Control<IdentificationValues>;

	const IDENTIFICATION = T2_JACKET_SECTIONS.filter(
		(s) => s.id === "identification",
	);

	return (
		<div className="space-y-4">
			<PaperSection
				title="Feeds the filed jacket Yes/No answers — not any computed dollar figure"
				description="Every Yes/No field below now answers the matching line in the filed T2 CIF questionnaire. None of them changes a computed dollar figure: acquisitionOfControl/deemedYearEnd/amalgamation/windUp can genuinely force a short tax year with its own proration under the Act, which this app does not model, and line 040 (type of corporation) is READ from the client record instead — see the note on that row — since CCPC/SBD eligibility is a trust-boundary fact, not a return input."
				formId="T2"
			>
				<p className="p-4 text-xs text-muted-foreground">
					Line 040 is the sharpest case: this app determines CCPC and
					small-business eligibility from the CLIENT RECORD's corporation type,
					never from this answer, so changing it here does not change the
					deduction. See
					research/findings/federal/T2-identification-schedule-is-inert.md
				</p>
			</PaperSection>
			<PaperFormSections
				sections={IDENTIFICATION}
				fields={T2_JACKET_FIELDS}
				control={control}
				boundFields={BOUND_FIELDS}
				computed={computed}
				scheduleId="T2"
				formId="T2"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
			/>

			<PaperSection
				title="Attachments checklist (page 2)"
				description="Page 2 asks which schedules are in the envelope. The jacket definition models page 1 and pages 3 to 9 and deliberately leaves this one out, so the single question this app collects from it is written out here rather than rendered from a form."
			>
				<PaperLeaderRow
					line="150"
					caption="Is the corporation related to any other corporations?"
					kind="bool-flag"
					role="input"
					note="Schedule 9."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={identControl}
					resolveLine={
						((): LineValue => ({
							editable: true,
							name: "relatedCorporations",
						})) as ResolveLine
					}
					disabled={disabled}
				/>
			</PaperSection>
		</div>
	);
}
