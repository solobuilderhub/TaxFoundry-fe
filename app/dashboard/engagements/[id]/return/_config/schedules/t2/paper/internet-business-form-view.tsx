"use client";

import { useWatch, type Control } from "react-hook-form";
import type { InternetBusinessValues } from "../../../../_lib/return-input";
import {
	PaperClassGrid,
	PaperLeaderRow,
	PaperSection,
	type ClassGridColumn,
	type ClassGridRow,
} from "../../at1/paper/components/paper-primitives";
import type { LineValue, NavigateToLine } from "../../at1/paper/resolve-line";

/**
 * Federal T2 Schedule 88 — Internet Business Activities. Verified against
 * `research/sources/cra-forms/extracted/T2SCH88-internet-business.layout.txt`
 * (the raw text) — this form genuinely has NO numbered boxes anywhere,
 * confirmed already by the guided editor's own doc comment ("Schedule 88
 * numbers nothing... Recorded here so the next person auditing line-number
 * coverage does not go looking for numbers that were never printed"). Every
 * row below shows a dash rather than a line number, and that dash is
 * correct, not a gap.
 *
 * `hasInternetBusiness` is a UI-only filing gate, like `isFirstReturn`
 * elsewhere in this app — the form itself has no yes/no box; whether it is
 * filed at all is the signal ("File this schedule if your corporation earns
 * income from one or more web pages or websites").
 *
 * The printed form has 5 fixed URL slots ("CRA asks for the five sites
 * generating the most gross revenue. Extra rows are dropped on compute" —
 * the guided editor's own description) — mirrored here the same way
 * Schedule 4's 3-slot carry-back grid shows unused slots as "not added".
 */
export function InternetBusinessFormView({
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
	const ibControl = control as unknown as Control<InternetBusinessValues>;
	const urls = useWatch({ control: ibControl, name: "urls" }) ?? [];

	const urlRows: ClassGridRow[] = [0, 1, 2, 3, 4].map((i) => ({
		key: `url-${i}`,
		label: `Site ${i + 1}`,
		arrayIndex: i < urls.length ? i : undefined,
	}));

	const URL_COLUMNS: ClassGridColumn[] = [{ line: "", caption: "Web page or website address (URL)", kind: "text", fieldName: "url" }];

	return (
		<div className="space-y-4">
			<PaperSection
				title="Internet business activities — no numbered lines"
				description="Confirmed against the rendered form: this schedule prints no line numbers at all. A dash below is correct, not a missing citation."
				formId="T2SCH88"
			>
				<PaperLeaderRow
					line="—"
					caption="The corporation earns income from one or more web pages or websites"
					kind="bool-flag"
					role="input"
					note="UI-only filing gate — the form has no checkbox of its own; whether it is filed at all is the answer."
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={ibControl}
					resolveLine={(): LineValue => ({ editable: true, name: "hasInternetBusiness" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="—"
					caption="How many Internet web pages or websites does your corporation earn income from?"
					kind="rate"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={ibControl}
					resolveLine={(): LineValue => ({ editable: true, name: "webPageCount" })}
					disabled={disabled}
				/>
				<PaperLeaderRow
					line="—"
					caption="What percentage of the corporation's total gross revenue is generated from the Internet?"
					kind="rate"
					role="input"
					onNavigate={onNavigate}
					highlightLine={highlightLine}
					control={ibControl}
					resolveLine={(): LineValue => ({ editable: true, name: "percentOfGrossRevenue" })}
					disabled={disabled}
				/>
			</PaperSection>

			<PaperSection
				title="Site addresses"
				description="The form provides 5 URL slots. CRA asks for the five sites generating the most gross revenue — extra rows are dropped on compute."
				formId="T2SCH88"
			>
				<div className="p-2">
					<PaperClassGrid
						arrayName="urls"
						rows={urlRows}
						columns={URL_COLUMNS}
						control={ibControl}
						disabled={disabled}
						resolveCell={() => undefined}
					/>
				</div>
			</PaperSection>
		</div>
	);
}
