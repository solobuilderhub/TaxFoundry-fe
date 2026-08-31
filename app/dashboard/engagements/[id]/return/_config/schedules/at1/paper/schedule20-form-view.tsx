"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaDonationsValues } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import { PaperLeaderRow, PaperSection } from "./components/paper-primitives";
import { AT1_SCHEDULE_20_FIELDS, AT1_SCHEDULE_20_SECTIONS } from "./generated/schedule20.layout";
import type { LineValue, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "020";

/**
 * Own editable fields, by 3-digit line — everything with no federal
 * equivalent (Schedule 21's own pattern: only what genuinely cannot be
 * derived from elsewhere is an override). Charitable's opening (002) and
 * current-year (010) come from the federal donations schedule instead —
 * read-only here, sourced from the last computed return, same as any other
 * carried-in figure this product doesn't re-collect on a second schedule.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaDonationsValues>> = {
	"004": "charitableExpired",
	"008": "charitableTransferredIn",
	"013": "charitableAcquisitionOfControlAdjustment",
	"016": "charitableApplied",
	"062": "giftsOpening",
	"064": "giftsExpired",
	"068": "giftsTransferredIn",
	"070": "giftsCurrentYear",
	"073": "giftsAcquisitionOfControlAdjustment",
	"076": "giftsApplied",
	"032": "taxableCapitalGainsOnGifts",
	"034": "deemedGiftGains",
	"036": "recaptureOnGifts",
	"038": "proceedsNetOfOutlays",
	"040": "capitalCost",
	"090": "carryforwardYearOfOrigin",
	"092": "carryforwardCharitable",
	"094": "carryforwardToCanadaOrProvince",
	"096": "carryforwardCulturalProperty",
	"098": "carryforwardEcologicalLand",
	"100": "carryforwardMedicine",
};

function buildResolveLine(computed: ComputedReturn | undefined): ResolveLine {
	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	return (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		const ownName = OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		const value = filedByField.get(field) as string | number | undefined;
		const sourceLabel = field === "002" || field === "010" ? "Donations & Gifts (S2)" : undefined;
		return { editable: false, value, sourceLabel };
	};
}

/**
 * AT1 Schedule 20 paper Form View — two independent 10-row donation
 * continuities (charitable, gifts), the Area B maximum-deduction
 * calculation, and the carryforward-by-category block (090-100). Rendered
 * as flat leader-line sections rather than
 * `PaperContinuityGrid` deliberately: unlike Schedule 21's five loss pools
 * (which share one editable field shape per row), charitable's opening and
 * current-year lines are read-only carry-ins from a DIFFERENT schedule
 * while the rest of the row is editable — a mix the grid primitive doesn't
 * model, so each pool gets its own section instead.
 */
export function Schedule20FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const donationsControl = control as unknown as Control<AlbertaDonationsValues>;
	const resolveLine = buildResolveLine(computed);

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_20_SECTIONS.map((section) => {
				const fields = AT1_SCHEDULE_20_FIELDS.filter((f) => f.section === section.id);
				if (fields.length === 0) return null;
				return (
					<PaperSection key={section.id} title={section.title} description={section.description}>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={parseAt1LineItemId(f.line)?.field ?? f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								control={donationsControl}
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
