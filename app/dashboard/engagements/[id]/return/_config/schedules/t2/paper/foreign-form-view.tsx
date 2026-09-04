"use client";

import type { Control } from "react-hook-form";
import type { ForeignValues } from "../../../../_lib/return-input";
import { PaperLeaderRow, PaperSection } from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine, ResolveLine } from "../../at1/paper/resolve-line";

/**
 * Federal T2 Schedule 21 — Federal foreign income tax credits. NOT to be
 * confused with AT1's own Schedule 21 (loss continuity) — same number,
 * different program, different form entirely.
 *
 * Verified against `packages/ca-tax/src/t2/forms/schedule21.ts` (hand-
 * authored from the rendered form; its own doc comment warns the raw
 * `pdftotext -layout` extraction only reaches 5 of the form's real rows).
 * The guided editor's three existing citations — 110/120 (non-business),
 * 210/220 (business), 348 (opening business FTC pool) — were all already
 * correct.
 *
 * Both real forms are PER-COUNTRY grids (Part 1 line 100, Part 2 line 200,
 * Part 3 line 345); this app collects one aggregate figure per box, not a
 * country breakdown — disclosed rather than fabricated.
 *
 * Lines 180 and 280 (the two credit TOTALS, each landing on a different T2
 * jacket line — 632 for non-business, 636 for business, per this form's own
 * doc comment warning "getting 632 and 636 the wrong way round is not
 * cosmetic") are a real s.126 limitation computed by the engine
 * (`computeSchedule21` — capped at the Canadian tax on the same foreign
 * income), not a trivial sum. Unlike this session's other client-side
 * "computed" displays (which only ever replicate genuinely trivial
 * arithmetic), duplicating that formula here would risk drifting from the
 * engine — shown as a disclosure pointing at the computed return instead.
 */
export function ForeignFormView({
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
	const foreignControl = control as unknown as Control<ForeignValues>;

	const FIELDS: readonly { line: string; caption: string; fieldName: keyof ForeignValues }[] = [
		{ line: "110", caption: "Net foreign non-business income earned in the year", fieldName: "foreignNonBusinessIncome" },
		{ line: "120", caption: "Foreign non-business income tax paid for the year", fieldName: "foreignNonBusinessTaxPaid" },
		{ line: "210", caption: "Net foreign business income", fieldName: "foreignBusinessIncome" },
		{ line: "220", caption: "Foreign business income tax", fieldName: "foreignBusinessTaxPaid" },
		{ line: "348", caption: "Balance of unused business foreign tax credit at the end of the previous tax year", fieldName: "openingBusinessFtcPool" },
	];

	const resolveLine: ResolveLine = (line): LineValue => {
		const field = FIELDS.find((f) => f.line === line);
		return field ? { editable: true, name: field.fieldName } : { editable: false, value: undefined };
	};

	return (
		<div className="space-y-4">
			<PaperSection
				title="Part 1 — Federal foreign non-business income tax credit"
				description="Per-country in the real form (line 100); this app collects one aggregate figure for both income and tax paid, not a per-country breakdown."
				formId="T2SCH21"
			>
				<PaperLeaderRow
					line="100"
					caption="Country of source"
					kind="text"
					role="input"
					note="Not collected — this app aggregates all countries into one figure."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				{FIELDS.slice(0, 2).map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={foreignControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
				<PaperLeaderRow
					line="130"
					caption="Foreign non-business income tax paid, deducted from income under subsection 20(12)"
					kind="money"
					role="input"
					note="Not collected — the alternative to claiming the credit, used when the credit cannot be. This app always claims the credit."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="180"
					caption="Total deductible federal foreign non-business income tax credit → T2 jacket line 632"
					kind="money"
					role="computed"
					note="A real s.126 limitation (capped at the Canadian tax on the same foreign income) computed by the engine — not duplicated here to avoid drifting from it. See the computed return."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Part 2 — Federal foreign business income tax credit"
				description="Per-country in the real form (line 200); this app collects one aggregate figure, not a per-country breakdown."
				formId="T2SCH21"
			>
				<PaperLeaderRow
					line="200"
					caption="Country in which foreign business income was earned"
					kind="text"
					role="input"
					note="Not collected — this app aggregates all countries into one figure."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				{FIELDS.slice(2, 4).map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={f.line}
						caption={f.caption}
						kind="money"
						role="input"
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={foreignControl}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
				<PaperLeaderRow
					line="230"
					caption="Unused foreign income tax"
					kind="money"
					role="input"
					note="Not collected as a separate figure by this app."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="280"
					caption="Total deductible federal foreign business income tax credit → T2 jacket line 636"
					kind="money"
					role="computed"
					note="A real s.126 limitation computed by the engine, same caveat as line 180 — not duplicated here. See the computed return."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Part 3 — Continuity of unused federal foreign business income tax credits"
				description="Per-country in the real form (line 345); this app tracks one aggregate opening pool, and does not collect the expiry (350) or amalgamation/wind-up transfer (360) adjustments — only the opening balance and the (engine-computed) closing balance."
				formId="T2SCH21"
			>
				<PaperLeaderRow
					line="345"
					caption="Country in which foreign business income was earned"
					kind="text"
					role="input"
					note="Not collected — this app aggregates all countries into one figure."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					key={FIELDS[4]!.line}
					line={FIELDS[4]!.line}
					caption={FIELDS[4]!.caption}
					kind="money"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={foreignControl}
					resolveLine={resolveLine}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="350"
					caption="Amount expired in the year"
					kind="money"
					role="input"
					note="Not collected by this app."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="360"
					caption="Credits transferred on an amalgamation or the wind-up of a subsidiary"
					kind="money"
					role="input"
					note="Not collected by this app."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="380"
					caption="Closing balance"
					kind="money"
					role="computed"
					note="Opening pool less expiry plus transfers, computed by the engine — not duplicated here since expiry/transfer are not collected."
					control={foreignControl}
					resolveLine={(): LineValue => ({ editable: false, value: undefined })}
					disabled={disabled}
				/>
			</PaperSection>
		</div>
	);
}
