"use client";

import type { Control } from "react-hook-form";
import type { EifelValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";

const FIELDS: readonly { key: keyof EifelValues; caption: string; kind: "money" | "bool-flag" }[] = [
	{ key: "netInterestAndFinancingExpenses", caption: "Net interest and financing expenses (corporation and group)", kind: "money" },
	{ key: "groupTaxableCapital", caption: "Group taxable capital employed in Canada", kind: "money" },
	{ key: "domesticExceptionApplies", caption: "Domestic exception applies (all or substantially all business carried on in Canada)", kind: "bool-flag" },
];

/**
 * T2 Schedule 130 — excessive interest and financing expenses limitation
 * (EIFEL, ITA s.18.2). Confirmed against `packages/ca-tax/src/t2/forms/schedule130.ts`'s
 * own doc comment: **16 lettered sub-parts, ~150 lines**, the largest
 * schedule in the federal return by structure — of which the engine
 * computes only 5 (Parts 2A/2D/2F/2K/2L) and explicitly does NOT compute
 * two more (2G/2H/2I, the excess/absorbed/cumulative capacity
 * carry-forward — "a genuine gap rather than an oversight").
 *
 * This app's guided editor collects exactly THREE fields, and — confirmed
 * against `packages/ca-tax/src/t2/schedules/eifel-excluded-entity.ts` —
 * none of them is a numbered Schedule 130 LINE at all. They feed a
 * PRE-FILTER: most CCPCs are an "excluded entity" (exempt from the whole
 * regime) purely from their corporation type and taxable capital, which the
 * engine determines on its own; these three fields exist only to override
 * that determination for the corporations where it doesn't apply. There is
 * no line-by-line facsimile to show here — rendering one would fabricate
 * ~150 boxes this app has no data for and no line number to hang most of
 * them on anyway (the excluded-entity test is described in the Act, not
 * printed as its own numbered line on the form).
 */
export function Schedule130FormView({
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
	const eifelControl = control as unknown as Control<EifelValues>;

	// Keyed by array index, not a real line number — see this component's own
	// doc comment on why none of these three fields has one.
	const resolveLine: ResolveLine = (line): LineValue => {
		const field = FIELDS[Number(line)];
		return field ? { editable: true, name: field.key } : { editable: false, value: undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="This app does not render Schedule 130 line-by-line"
				description="A 16-part, ~150-line form (see schedule130.ts's own doc comment) of which the engine computes only 5 parts even when the regime applies. This app instead asks a small EXCLUDED-ENTITY pre-filter — most CCPCs never need to complete Schedule 130 at all, and the engine determines that on its own from corporation type and taxable capital. The three fields below override that determination only for corporations where it doesn't apply; none of them is itself a numbered Schedule 130 line."
				formId="T2SCH130"
			>
				{FIELDS.map((f, i) => (
					<PaperLeaderRow
						key={f.key}
						line={String(i)}
						caption={f.caption}
						kind={f.kind}
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={eifelControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</PaperSection>
		</div>
	);
}
