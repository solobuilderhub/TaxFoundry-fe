"use client";

import type { Control } from "react-hook-form";
import type { CreditsValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";
import { T2_SCHEDULE_31_FIELDS, T2_SCHEDULE_31_SECTIONS } from "./generated/schedule31.layout";

const OWN_FIELD: Partial<Record<string, keyof CreditsValues>> = {
	"380": "sredQualifiedExpenditures",
	"520": "openingItcPool",
};

/**
 * Federal T2 Schedule 31 — investment tax credits. A 12-page, 25-part form
 * (see `schedule31.ts`'s own doc comment: five parallel credits, each with
 * an account-balance block, a carryback request, and — for two — a
 * recapture block). This app collects exactly TWO of its ~73 fields:
 * qualified SR&ED expenditures and the opening ITC pool. Rendering all ~71
 * remaining fields as individual "not collected" rows would bury the two
 * real ones in noise this app's own information architecture can't fix by
 * relabelling — so only the SR&ED expenditure/balance sections render
 * field-by-field, and everything else (qualified property, mining,
 * apprenticeship, child care, clean economy, and SR&ED's own eligibility
 * and recapture parts) is one clear section-level disclosure instead.
 *
 * Line 520 ("ITC at the beginning of the tax year") is labelled `computed`
 * in the FormDefinition — the printed form derives it as "amount 12A minus
 * amount 12B" from its own worksheet letters, which the extraction could
 * not resolve to numbered lines. This app has no year-over-year
 * continuity tracking, so `openingItcPool` is a genuine manual entry here
 * (the guided editor's own description: "auto-filled from last year on
 * compute" describes an aspiration, not current behaviour) — treated as
 * editable for display, with a note explaining the tension rather than
 * silently picking a side.
 */
export function Schedule31FormView({
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
	const creditsControl = control as unknown as Control<CreditsValues>;

	const resolveLine: ResolveLine = (line): LineValue => {
		const field = OWN_FIELD[line];
		if (field) return { editable: true, name: field };
		return { editable: false, value: undefined };
	};

	const modelledSections = new Set(["sred-expenditures", "sred-balances"]);
	const fieldsFor = (sectionId: string) => T2_SCHEDULE_31_FIELDS.filter((f) => f.section === sectionId);

	return (
		<div className="space-y-4">
			{T2_SCHEDULE_31_SECTIONS.filter((s) => modelledSections.has(s.id)).map((section) => (
				<PaperSection key={section.id} title={section.title} description={section.description} formId="T2SCH31">
					{fieldsFor(section.id).map((f) => (
						<PaperLeaderRow
							key={f.line}
							line={f.line}
							caption={f.caption}
							kind={f.kind}
							role={OWN_FIELD[f.line] ? "input" : f.role}
							note={
								f.line === "520"
									? "Labelled 'computed' on the printed form (12A minus 12B, worksheet letters this app cannot resolve to numbered lines) — but this app has no year-over-year continuity tracking, so it's a genuine manual entry here."
									: f.note
							}
							to={f.to}
							onNavigate={onNavigate}
							highlightLine={highlightLine}
							control={creditsControl}
							resolveLine={resolveLine}
							disabled={disabled}
						/>
					))}
				</PaperSection>
			))}
			<PaperSection
				title="The rest of this form"
				description="Not modelled in this app at all — a genuinely large gap, not a rendering omission. Qualified property (Parts 4-7), SR&ED eligibility and recapture (Parts 2-3, 14-17), pre-production mining (Part 18), apprenticeship job creation (Parts 19-21), child care spaces (Part 22), and the clean economy credits (Part 23) have no guided-editor fields anywhere in this product yet."
				formId="T2SCH31"
			>
				<p className="p-4 text-xs text-muted-foreground">
					{T2_SCHEDULE_31_SECTIONS.filter((s) => !modelledSections.has(s.id))
						.map((s) => s.title)
						.join(" · ")}
				</p>
			</PaperSection>
		</div>
	);
}
