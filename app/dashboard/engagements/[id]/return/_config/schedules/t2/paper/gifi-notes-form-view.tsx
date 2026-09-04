"use client";

import type { Control } from "react-hook-form";
import type { GifiNotesValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";

/**
 * Federal T2 Schedule 141 — GIFI Additional Information. Unlike Schedule
 * 100/125, this IS a genuine line-numbered questionnaire (verified against
 * `research/sources/cra-forms/extracted/T2SCH141-gifi-notes.layout.txt`) —
 * 5 parts, ~25 real yes/no/checkbox lines. This app collects 4 booleans.
 *
 * Mapped by tracing `apps/server/src/filing/t2-cif.service.ts`'s
 * `buildGifiFromReturn`, which turns them into a `{preparedByAccountant,
 * assuranceLevel, notesIncluded}` object actually filed at `schedule141`:
 *
 *   - `preparedByAccountant` → line 095 (Part 1: "Does that person have a
 *     professional designation in accounting?")
 *   - `auditEngagement` → line 300 (Part 2 checkbox: "Completed an
 *     auditor's report")
 *   - `reviewEngagement` → line 301 (Part 2 checkbox: "Completed a review
 *     engagement report")
 *   - `financialStatementsIncluded` → line 101 (Part 4: "Were notes to the
 *     financial statements prepared?") — filed as `notesIncluded`; the
 *     guided editor's own label ("included / attached") is worded
 *     differently from the real question, but the filed field name
 *     confirms this is the intended line.
 *
 * `assuranceLevel` is a computed TRI-STATE the app derives, not a direct
 * filed line: `audit` if `auditEngagement`, else `review` if
 * `reviewEngagement`, else it silently defaults to `compilation` —
 * disclosed below since a preparer leaving both switches off does not get
 * "unanswered", they get an explicit "compilation engagement" claim on file.
 *
 * Not modelled at all: Part 1's identify/connected questions (111, 097),
 * Part 2's other 3 involvement types (302 compilation, 303 accounting
 * services, 304 bookkeeping, 305 other), Part 3's reservations question
 * (099), Part 4's subsequent-events/re-evaluation/contingent-liabilities/
 * commitments/joint-venture questions (104-108) and its entire impairment /
 * fair-value / financial-instruments / opening-equity-adjustment section
 * (200, 210/211, 215/216, 220, 225, 230/231, 235/236, 250, 255, 260, 265),
 * and Part 5's return-preparer-source checklist (310-314).
 */
export function GifiNotesFormView({
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
	const notesControl = control as unknown as Control<GifiNotesValues>;

	return (
		<div className="space-y-4">
			<PaperSection title="Part 1 — Person primarily involved with the financial information" formId="T2SCH141">
				<PaperLeaderRow
					line="095"
					caption="Does that person have a professional designation in accounting?"
					kind="bool-flag"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: true, name: "preparedByAccountant" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="111"
					caption="Can you identify the person specified in the heading of Part 1?"
					kind="bool-flag"
					role="input"
					note="Not collected by this app."
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="097"
					caption="Is that person connected with the corporation?"
					kind="bool-flag"
					role="input"
					note="Not collected by this app."
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Part 2 — Type of involvement"
				description="Choose one or more. This app collects only 2 of the 5 options; the other 3 (compilation, accounting services, bookkeeping) are not collected."
				formId="T2SCH141"
			>
				<PaperLeaderRow
					line="300"
					caption="Completed an auditor's report"
					kind="bool-flag"
					role="input"
					note="Feeds this app's assuranceLevel = 'audit' (highest priority over 301 below)."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: true, name: "auditEngagement" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="301"
					caption="Completed a review engagement report"
					kind="bool-flag"
					role="input"
					note="Feeds assuranceLevel = 'review', used only when 300 above is not checked. If NEITHER 300 nor 301 is checked, this app files assuranceLevel = 'compilation' automatically — not an unanswered question, an explicit default claim."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: true, name: "reviewEngagement" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="302 / 303 / 304 / 305"
					caption="Compilation engagement / accounting services / bookkeeping services / other"
					kind="bool-flag"
					role="input"
					note="Not collected by this app — a compilation engagement is only ever reached as the silent default above, never chosen explicitly."
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection title="Part 3 — Reservations" formId="T2SCH141">
				<PaperLeaderRow
					line="099"
					caption="Has the person referred to in Part 1 expressed a reservation?"
					kind="bool-flag"
					role="input"
					note="Only asked when Part 2 selected an auditor's or review engagement report. Not collected by this app."
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Part 4 — Other information"
				description="This app collects only the first question (101). The rest of Part 4 — subsequent events, asset re-evaluation, contingent liabilities, commitments, joint ventures, and the entire impairment / fair-value / financial-instruments / opening-equity-adjustment section — is not modelled."
				formId="T2SCH141"
			>
				<PaperLeaderRow
					line="101"
					caption="Were notes to the financial statements prepared?"
					kind="bool-flag"
					role="input"
					note="The guided editor's own label ('Financial statements are included / attached') is worded differently — matched via the filed field name (notesIncluded)."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: true, name: "financialStatementsIncluded" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="104-108, 200-265"
					caption="Subsequent events, re-evaluations, contingent liabilities, commitments, joint ventures, impairment, fair value, financial instruments, opening equity adjustments"
					kind="text"
					role="input"
					note="Not collected by this app."
					control={notesControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Part 5 — Information on the person who prepared the T2 return — not modelled"
				description="Lines 310-314 (prepared the return / client provided statements, trial balance, general ledger / other) are not collected by this app."
			>
				<p className="p-4 text-xs text-muted-foreground">Not modelled — no fields collected for this Part.</p>
			</PaperSection>
		</div>
	);
}
