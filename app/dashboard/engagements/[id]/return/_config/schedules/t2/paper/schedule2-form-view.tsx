"use client";

import type { Control } from "react-hook-form";
import type { DonationsValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";
import { T2_SCHEDULE_2_FIELDS, T2_SCHEDULE_2_SECTIONS } from "./generated/schedule2.layout";

/**
 * The 4 of 15 real form lines this schedule's guided editor
 * (`t2/donations.ts`) actually collects. The remaining 11 — the
 * expired/transferred/acquisition-of-control lines for all three gift
 * types, and the opening balance for cultural/ecological specifically
 * (only charitable's opening, line 240, has a field) — are genuine
 * collection gaps, not role mistakes: they render "not collected" honestly
 * rather than a fabricated box.
 */
const FIELD_NAME: Partial<Record<string, keyof DonationsValues>> = {
	"210": "charitable",
	"410": "cultural",
	"520": "ecological",
	"240": "openingDonationPool",
};

function buildResolveLine(): ResolveLine {
	return (line: string): LineValue => {
		const name = FIELD_NAME[line];
		if (name) return { editable: true, name };
		return { editable: false, value: undefined };
	};
}

/**
 * Federal T2 Schedule 2 — Charitable donations and gifts, as a paper Form
 * View. Three parallel continuities (charitable/cultural/ecological), each
 * with the same 5-line shape, matching the printed form's own Parts 2-4.
 */
export function Schedule2FormView({
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
	const c = control as unknown as Control<DonationsValues>;
	const resolveLine = buildResolveLine();

	return (
		<div className="space-y-4">
			{T2_SCHEDULE_2_SECTIONS.map((section) => {
				const fields = T2_SCHEDULE_2_FIELDS.filter((f) => f.section === section.id);
				if (fields.length === 0) return null;
				return (
					<PaperSection
						key={section.id}
						title={section.title}
						description={section.description}
						formId={section.id === "charitable" ? "T2SCH2" : undefined}
					>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								to={f.to}
								onNavigate={onNavigate}
								highlightLine={highlightLine}
								control={c}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
		</div>
	);
}
