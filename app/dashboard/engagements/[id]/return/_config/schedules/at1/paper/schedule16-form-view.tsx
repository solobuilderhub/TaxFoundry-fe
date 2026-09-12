"use client";

import type { Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaSred16Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
} from "./components/paper-primitives";
import {
	AT1_SCHEDULE_16_FIELDS,
	AT1_SCHEDULE_16_FOOTNOTES,
	AT1_SCHEDULE_16_SECTIONS,
} from "./generated/schedule16.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "016";

/**
 * Every enterable line on this schedule, and all nine are genuinely entered.
 *
 * Six of them (002/004/006/008/010/015) are specified as "must equal fed
 * 032nnn" and the form names each federal source beside its box — "(federal
 * schedule 32 (T661) line 400)". This product models no T661 at all, so the
 * preparer transcribes them, which is how the paper form works. They are
 * editable here for that reason, not because Alberta may vary them.
 *
 * The three that Alberta genuinely may vary are 012 (opening pool balance),
 * 014 (transfer on amalgamation) and 020 (the claim) — which is exactly why
 * the form is required "if the opening balance or the claim for Alberta
 * purposes differs from that for federal purposes".
 *
 * 016, 018 and 022 are computed and deliberately absent: the subtotal, the
 * available pool and the carry-forward balance.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaSred16Values>> = {
	"002": "currentYearExpenditures",
	"004": "assistance",
	"006": "priorYearItcClaimed",
	"008": "saleOfCapitalAssetsAndOther",
	"010": "assistanceRepayments",
	"012": "openingPoolBalance",
	"014": "poolTransferredIn",
	"015": "priorYearItcRecaptured",
	"020": "amountClaimed",
};

function buildResolveLine(computed: ComputedReturn | undefined): ResolveLine {
	const filed = computed?.schedulePayloads?.find(
		(p) => p.scheduleId === SCHEDULE_ID,
	);
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
		return {
			editable: false,
			value: filedByField.get(field) as string | number | undefined,
		};
	};
}

/**
 * AT1 Schedule 16 paper Form View — the Alberta SR&ED expenditure POOL.
 *
 * Not the SR&ED investment tax credit (federal Schedule 31) and not the
 * Innovation Employment Grant (AT1 Schedule 29); both are elsewhere in this
 * editor. This is the deduction against income, and the pool's remainder
 * carries forward indefinitely — line 022 becomes next year's line 012.
 *
 * ── This schedule could not be filed at all ─────────────────────────────────
 *
 * `computeAlbertaSchedule16` and `schedule16Values` were complete and tested
 * in the engine, and `alberta-return.ts` already pushed the payload whenever
 * `schedules.scientificResearch` was present — but no contract slice existed
 * to collect the figures and no composer built the input, so a corporation
 * with an Alberta SR&ED pool had nowhere to enter it and nothing was ever
 * transmitted. Nothing caught it: every test called the builder directly.
 *
 * Twelve lines, no grid, so this is a plain stack of leader rows following
 * `AT1SCH16-scientific-research-TRA11737.pdf`'s own line order.
 */
export function Schedule16FormView({
	control,
	disabled,
	computed,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const s16Control = control as unknown as Control<AlbertaSred16Values>;
	const resolveLine = buildResolveLine(computed);

	return (
		<div className="space-y-4">
			{AT1_SCHEDULE_16_SECTIONS.map((section, i) => {
				const fields = AT1_SCHEDULE_16_FIELDS.filter(
					(f) => f.section === section.id,
				);
				if (fields.length === 0) return null;
				return (
					<PaperSection
						key={section.id}
						title={section.title}
						description={section.description}
						formId={i === 0 ? "AT1SCH16" : undefined}
					>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={parseAt1LineItemId(f.line)?.field ?? f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								to={f.to}
								onNavigate={onNavigate}
								highlightLine={highlightLine}
								control={s16Control}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
			<PaperFootnotes notes={AT1_SCHEDULE_16_FOOTNOTES} />
		</div>
	);
}
