"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { EifelValues } from "../../../../_lib/return-input";
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
	T2_SCHEDULE_130_FIELDS,
	T2_SCHEDULE_130_SECTIONS,
} from "./generated/schedule130.layout";
import { PaperFormSections } from "./paper-form-sections";

/**
 * The three fields this app's guided editor collects.
 *
 * None of them is a numbered Schedule 130 line. They feed the EXCLUDED-ENTITY
 * pre-filter: most CCPCs are exempt from the whole regime on their corporation
 * type and taxable capital alone, which the engine determines by itself, and
 * these exist only to override that determination where it does not apply. They
 * are shown in their own leading section rather than mixed into the form's own
 * parts, because putting an unnumbered override beside numbered lines would
 * read as a line of the form.
 */
const OVERRIDES: readonly {
	key: keyof EifelValues;
	caption: string;
	kind: "money" | "bool-flag";
}[] = [
	{
		key: "netInterestAndFinancingExpenses",
		caption: "Net interest and financing expenses (corporation and group)",
		kind: "money",
	},
	{
		key: "groupTaxableCapital",
		caption: "Group taxable capital employed in Canada",
		kind: "money",
	},
	{
		key: "domesticExceptionApplies",
		caption:
			"Domestic exception applies (all or substantially all business carried on in Canada)",
		kind: "bool-flag",
	},
];

/**
 * Federal T2 Schedule 130 — excessive interest and financing expenses
 * limitation (EIFEL, ITA s.18.2). The largest schedule in the federal return:
 * 20 lettered sub-parts over 162 lines.
 *
 * ── Why this renders the whole form now ─────────────────────────────────────
 *
 * It used to render only the three override fields above, under a heading
 * saying the app does not render Schedule 130 line-by-line. That was true when
 * written: the engine computed five parts, and a facsimile would have been
 * mostly empty boxes. It is no longer true — the engine now computes the
 * capacity chain (Parts 1A, 2G, 2H, 2I, 2J, 2O) and the interest and financing
 * expense and revenue parts (1B-1E, 2A-2E, 2L, 2M, 2N) as well. A paper view
 * that still refused to show the form would be hiding the thing it exists to
 * show.
 *
 * ── Why every line is read-only ─────────────────────────────────────────────
 *
 * Schedule 130 has no preparer-entered numbered lines in this app: everything
 * on it is derived, from the return's own figures or from the group's. The
 * computed return is now read for the figures — `schedulePayloads` carries
 * federal schedules as well as Alberta ones — but `federalSchedulePayloads`
 * does not yet emit anything under `T2SCH130`, so every line still renders with
 * its caption, number, part and cross-references and no figure, rather than a
 * client-side re-derivation that could drift from the engine. The lines fill in
 * of their own accord once the engine reports them.
 */
export function Schedule130FormView({
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
	const eifelControl = control as unknown as Control<EifelValues>;

	// The overrides are keyed by array index, not a line number — see OVERRIDES.
	const resolveOverride: ResolveLine = (line): LineValue => {
		const field = OVERRIDES[Number(line)];
		return field
			? { editable: true, name: field.key }
			: { editable: false, value: undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Is the corporation an excluded entity?"
				description="Answered before the form itself. Most CCPCs are excluded from the EIFEL regime entirely, and the engine determines that from corporation type and taxable capital on its own. These three override that determination for the corporations where it does not hold; none of them is a numbered line of Schedule 130."
				formId="T2SCH130"
			>
				{OVERRIDES.map((f, i) => (
					<PaperLeaderRow
						key={f.key}
						line={String(i)}
						caption={f.caption}
						kind={f.kind}
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={eifelControl}
						resolveLine={resolveOverride}
						disabled={disabled}
					/>
				))}
			</PaperSection>

			<PaperFormSections
				sections={T2_SCHEDULE_130_SECTIONS}
				fields={T2_SCHEDULE_130_FIELDS}
				control={control}
				computed={computed}
				scheduleId="T2SCH130"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
			/>
		</div>
	);
}
