"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { QuebecValues } from "../../../../_lib/return-input";
import {
	PaperLeaderRow,
	PaperSection,
} from "../../at1/paper/components/paper-primitives";
import type {
	LineValue,
	NavigateToLine,
	ResolveLine,
} from "../../at1/paper/resolve-line";
import { PaperFormSections } from "../../t2/paper/paper-form-sections";
import {
	CO17_RETURN_FIELDS,
	CO17_RETURN_SECTIONS,
} from "./generated/co17.layout";

/**
 * The two fields this app's guided editor collects for Québec.
 *
 * Neither is a box of the CO-17 itself. Québec taxable income and active
 * business income are DERIVED server-side from the federal return times the
 * Québec allocation factor, so nothing on the form is retyped here; what is
 * asked for is the eligibility attestation the federal return has no equivalent
 * of (Québec's small-business deduction rests on a paid-hours test) and the
 * shared business limit for an associated group.
 *
 * They are shown in their own leading section rather than mixed into the form's
 * numbered boxes. In particular `businessLimit` is NOT box 420c: that box is
 * "revenu provenant d'une entreprise admissible" — income from an eligible
 * business — and binding an editor field to a box that means something else is
 * how a return stops footing.
 */
const OVERRIDES: readonly {
	key: keyof QuebecValues;
	caption: string;
	kind: "money" | "bool-flag";
}[] = [
	{
		key: "sbdEligibleQC",
		caption:
			"Meets Québec's small-business eligibility (≥5,500 paid hours, or the primary / manufacturing exemption)",
		kind: "bool-flag",
	},
	{
		key: "businessLimit",
		caption:
			"Québec business limit — blank is $500,000; enter the shared limit for a group",
		kind: "money",
	},
];

/**
 * Québec CO-17 — Déclaration de revenus des sociétés, as a paper Form View.
 *
 * The one form in this app whose identifiers are not CRA line numbers: Revenu
 * Québec numbers its own boxes and some carry a letter suffix (420c, 440b). The
 * definition records that as `lineScheme: 'rq-box'`. Captions stay in French,
 * as Revenu Québec prints them — a preparer matching this screen against the
 * paper form is matching French to French.
 *
 * Every box renders read-only. Nothing on the form is entered in this app (see
 * OVERRIDES), so each box shows the figure the last compute filed for it rather
 * than a client-side re-derivation that could drift from the engine. No CO-17
 * payload is emitted yet — `federalSchedulePayloads` covers the federal
 * schedules and Alberta has its own — so the boxes still show no figure, and
 * will fill in of their own accord once a per-box CO-17 breakdown is persisted.
 */
export function Co17FormView({
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
	const quebecControl = control as unknown as Control<QuebecValues>;

	// The overrides are keyed by array index, not a box number — see OVERRIDES.
	const resolveOverride: ResolveLine = (line): LineValue => {
		const field = OVERRIDES[Number(line)];
		return field
			? { editable: true, name: field.key }
			: { editable: false, value: undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Québec small-business deduction"
				description="Asked here because the federal return has no equivalent. Fail-closed: the reduced Québec rate applies only when the attestation is given AND the corporation is a CCPC; otherwise all Québec income is taxed at the general rate. Neither field is a box of the CO-17."
				formId="CO17"
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
						control={quebecControl}
						resolveLine={resolveOverride}
						disabled={disabled}
					/>
				))}
			</PaperSection>

			<PaperFormSections
				sections={CO17_RETURN_SECTIONS}
				fields={CO17_RETURN_FIELDS}
				control={control}
				computed={computed}
				scheduleId="CO17"
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
			/>
		</div>
	);
}
