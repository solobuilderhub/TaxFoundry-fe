"use client";

import { useWatch, type Control } from "react-hook-form";
import type { At1DispositionCategory, CapitalGainsValues, Disposition } from "../../../../_lib/return-input";
import {
	PaperClassGrid,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "../../at1/paper/components/paper-primitives";

/**
 * Federal T2 Schedule 6 — Summary of dispositions of capital property.
 * Backed by a real `FormDefinition` (`packages/ca-tax/src/t2/forms/schedule6.ts`,
 * "hand-authored from the rendered pages: like Schedules 8 and 13 the numbers
 * head COLUMNS" — 7 separate property-type grids, each with its own set of
 * line numbers).
 *
 * This app's guided editor collects ONE flat `dispositions` array shared
 * across all property types, tagged with a `category` field. The guided
 * editor cited a single fixed "(line 120)/(line 130)/(line 140)" on
 * proceeds/ACB/outlays — those are only correct for the SHARES grid (Part
 * 1); every other category has its own real, different lines (real estate
 * 220/230/240, bonds 320/330/340, other 420/430/440, personal-use
 * 520/530/540, listed personal 620/630/640). Fixed here by keying the line
 * number off each row's own `category`, the same `lineFor`-per-cell
 * mechanism used for Schedule 5's per-province lines.
 *
 * `category`'s own doc comment (`return-input.ts`) says it "feeds AT1
 * Schedule 18 only; the federal Schedule 6 computation ignores it" — true
 * for the TAX ARITHMETIC (federal sums every row into one pool regardless
 * of type), but irrelevant to this view's job, which is showing where each
 * dollar would sit on the PRINTED federal form. The category is still the
 * real property type; using it to place the row is correct for that.
 *
 * `category` has no "abil" option (Part 7 — allowable business investment
 * loss) and the guided editor's `Disposition` type has no acquisition-date
 * field at all (real lines 110/210/310/410/510/610, one per grid) — both
 * disclosed below rather than fabricated. The summary section (designation
 * 050, stop-loss adjustment 160, ABIL total 406, capital gains dividend
 * 875, reserve continuity 880/885, net total 890) is not modelled by this
 * app's `CapitalGainsValues` at all (only the `dispositions` array exists)
 * — disclosed as its own section rather than silently omitted.
 */

const CATEGORY_LINES: Record<
	At1DispositionCategory,
	{ description: string; proceeds: string; acb: string; outlays: string; gain: string }
> = {
	shares: { description: "105", proceeds: "120", acb: "130", outlays: "140", gain: "150" },
	realEstate: { description: "200", proceeds: "220", acb: "230", outlays: "240", gain: "250" },
	bonds: { description: "307", proceeds: "320", acb: "330", outlays: "340", gain: "350" },
	otherProperties: { description: "400", proceeds: "420", acb: "430", outlays: "440", gain: "450" },
	personalUse: { description: "500", proceeds: "520", acb: "530", outlays: "540", gain: "550" },
	listedPersonal: { description: "600", proceeds: "620", acb: "630", outlays: "640", gain: "650" },
};

const FLOORED_CATEGORIES = new Set<At1DispositionCategory>(["personalUse", "listedPersonal"]);

const COLUMNS: ClassGridColumn[] = [
	{ line: "", caption: "Property", kind: "text", fieldName: "description" },
	{ line: "", caption: "Proceeds of disposition", kind: "money", fieldName: "proceeds" },
	{ line: "", caption: "Adjusted cost base", kind: "money", fieldName: "acb" },
	{ line: "", caption: "Outlays and expenses", kind: "money", fieldName: "outlays" },
	{ line: "", caption: "Gain (or loss)", kind: "money" },
];

function gainFor(row: Disposition | undefined): number | undefined {
	if (!row || row.proceeds == null) return undefined;
	const gain = (row.proceeds ?? 0) - (row.acb ?? 0) - (row.outlays ?? 0);
	return row.category && FLOORED_CATEGORIES.has(row.category) ? Math.max(0, gain) : gain;
}

export function CapitalGainsFormView({
	control,
	disabled,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
}) {
	const cgControl = control as unknown as Control<CapitalGainsValues>;
	const dispositions = useWatch({ control: cgControl, name: "dispositions" }) ?? [];

	const rows: ClassGridRow[] = dispositions.map((d, i) => ({
		key: `disposition-${i}`,
		label: d?.category ? CATEGORY_LINES[d.category].description : `Row ${i + 1} (no category set)`,
		arrayIndex: i,
	}));

	return (
		<div className="space-y-4">
			<PaperSection
				title="Dispositions of capital property"
				description="Line numbers depend on the property CATEGORY chosen for each row in Guided view — Shares (Part 1), Real estate (Part 2), Bonds (Part 3), Other properties (Part 4), Personal-use property (Part 5, gain floored at nil), Listed personal property (Part 6, gain floored at nil). A row with no category set shows no line numbers until one is chosen."
				formId="T2SCH6"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="dispositions"
						rows={rows}
						columns={COLUMNS}
						control={cgControl}
						disabled={disabled}
						resolveCell={(row, col) => {
							if (col.fieldName) return undefined;
							const d = row.arrayIndex !== undefined ? dispositions[row.arrayIndex] : undefined;
							return gainFor(d);
						}}
						lineFor={(row, col) => {
							const d = row.arrayIndex !== undefined ? dispositions[row.arrayIndex] : undefined;
							if (!d?.category) return "—";
							const lines = CATEGORY_LINES[d.category];
							if (col.fieldName === "description") return lines.description;
							if (col.fieldName === "proceeds") return lines.proceeds;
							if (col.fieldName === "acb") return lines.acb;
							if (col.fieldName === "outlays") return lines.outlays;
							return lines.gain;
						}}
					/>
				</div>
			</PaperSection>
			{rows.length === 0 && (
				<p className="px-1 text-sm text-muted-foreground">No dispositions entered yet — add one in Guided view first.</p>
			)}
			<PaperSection
				title="Not collected by this app"
				description="Real gaps on the printed form, disclosed rather than fabricated."
			>
				<div className="space-y-2 p-4 text-xs text-muted-foreground">
					<p>
						<strong>Acquisition date</strong> — every grid has its own date column (shares 110, real estate 210,
						bonds 310, other 410, personal-use 510, listed personal 610); this app's disposition rows have no date
						field at all.
					</p>
					<p>
						<strong>Shares' extra columns</strong> — number of shares (line 100) and class of shares (line 106) are
						not collected separately; only the corporation name (line 105, shown above as "Property").
					</p>
					<p>
						<strong>Bonds' extra columns</strong> — face value (line 300) and maturity date (line 305) are not
						collected separately; only the issuer name (line 307, shown above as "Property").
					</p>
					<p>
						<strong>Part 7 — allowable business investment loss</strong> (lines 900-950) has no category option in
						this app and is not modelled.
					</p>
					<p>
						<strong>Summary section</strong> — paragraph 111(4)(e) designation (line 050), the subsection 112(3)
						stop-loss adjustment (line 160), the ABIL total (line 406), capital gains dividends received (line 875),
						and the Schedule 13 reserve continuity (lines 880/885/890) are not collected by this app at all.
					</p>
				</div>
			</PaperSection>
		</div>
	);
}
