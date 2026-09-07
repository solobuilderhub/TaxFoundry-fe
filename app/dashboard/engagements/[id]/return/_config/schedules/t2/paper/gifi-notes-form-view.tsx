"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { GifiNotesValues } from "../../../../_lib/return-input";
import { PaperSection } from "../../at1/paper/components/paper-primitives";
import type { NavigateToLine } from "../../at1/paper/resolve-line";
import {
	T2_SCHEDULE_141_FIELDS,
	T2_SCHEDULE_141_SECTIONS,
} from "./generated/schedule141.layout";
import { PaperFormSections } from "./paper-form-sections";

/**
 * Federal T2 Schedule 141 — the notes checklist (GIFI additional information).
 *
 * Unlike Schedules 100 and 125, which are blank grids the corporation fills
 * with whichever GIFI codes its own accounts use, this is a genuine numbered
 * questionnaire: five parts asking who prepared the financial statements, what
 * level of assurance they carry, and what the notes disclose. It now has a form
 * definition (`T2_SCHEDULE_141`), so all 32 lines render from it. This file used
 * to retype nine of them by hand and describe the other twenty-three in prose.
 *
 * ── The four this app collects, and how they were traced ────────────────────
 *
 * Mapped by following `apps/server/src/filing/t2-cif.service.ts`'s
 * `buildGifiFromReturn`, which turns them into the `{preparedByAccountant,
 * assuranceLevel, notesIncluded}` object actually filed at `schedule141`. That
 * matters for line 101 in particular: the guided editor labels its own field
 * "financial statements are included / attached", which is worded differently
 * from the form's "Were notes to the financial statements prepared?" — the
 * filed field name is what confirms they are the same question.
 *
 * ── The default nobody chooses ──────────────────────────────────────────────
 *
 * `assuranceLevel` is a tri-state this app derives rather than a filed line:
 * audit if line 300 is ticked, else review if 301 is, else compilation. A
 * preparer who leaves both switches off does not file "unanswered" — they file
 * an explicit claim that a compilation engagement was conducted, which is line
 * 302, a line this app never lets anyone tick deliberately. That is worth
 * knowing and is why it is stated on screen rather than only here.
 */
const BOUND_FIELDS: Readonly<Record<string, keyof GifiNotesValues>> = {
	"095": "preparedByAccountant",
	"300": "auditEngagement",
	"301": "reviewEngagement",
	"101": "financialStatementsIncluded",
};

export function GifiNotesFormView({
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
	return (
		<div className="space-y-4">
			<PaperSection
				title="Four of these thirty-two questions are collected"
				description="Lines 095, 300, 301 and 101 are editable and reach the filed return. Every other line renders read-only because this app does not ask it — the form is shown whole so a preparer can see what is missing rather than only what is present."
			>
				<p className="p-4 text-xs text-muted-foreground">
					Leaving both line 300 and line 301 unticked does not file an
					unanswered question. It files an explicit compilation-engagement
					claim, which is line 302, and this app never lets anyone tick that
					line on purpose.
				</p>
			</PaperSection>

			<PaperFormSections
				sections={T2_SCHEDULE_141_SECTIONS}
				fields={T2_SCHEDULE_141_FIELDS}
				control={control}
				boundFields={BOUND_FIELDS}
				computed={computed}
				scheduleId="T2SCH141"
				formId="T2SCH141"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
			/>
		</div>
	);
}
