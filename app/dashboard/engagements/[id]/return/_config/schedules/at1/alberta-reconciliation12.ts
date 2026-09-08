import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaReconciliation12Values } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { YES_NO } from "../../options";
import { defineSchedule } from "../shared/define";
import { Schedule12FormView } from "./paper/schedule12-form-view";

const f = fieldsFor<AlbertaReconciliation12Values>();

/**
 * AT1 Schedule 12 — Alberta Income/Loss Reconciliation.
 *
 * `ri.albertaReconciliation12`. Until now this schedule had no `ScheduleDef` at
 * all: it was special-cased into `return-editor.tsx` as a read-only view, on the
 * reasoning that the engine derives it from the other schedules' Alberta
 * overrides.
 *
 * That reasoning covers the ALBERTA column of a reconciling pair and nothing
 * else. Of the form's 74 lines, 20 are carried in from another AT1 schedule
 * (still resolved, still read-only) and 8 are computed — but the remaining 46
 * are the preparer's: the whole federal column, which the form's own captions
 * tell them to transcribe off the federal return, plus the Alberta boxes with
 * no schedule behind them and the entire ABI reconciliation.
 *
 * ── Guided vs Form View ─────────────────────────────────────────────────────
 *
 * This schedule is far easier to fill against the paper, where the federal and
 * Alberta columns sit side by side under one row caption. The guided schema
 * below groups by column instead, because a flat card list cannot show a pair —
 * useful for finding one figure, not for reconciling. Reach for the Form View.
 */
export const albertaReconciliation12 = defineSchedule({
	key: "albertaReconciliation12",
	num: "012",
	label: "Income/Loss Reconciliation (S12)",
	hint: "Where Alberta diverges from the federal return",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule12FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"areaAFederal",
				"Area A — federal amounts",
				[
					f.money("netIncomeFederal", "Net Income (Loss) for federal purposes (line 002)", {
						description: "T2 line 300.",
					}),
					f.money("ccaFederal", "Capital Cost Allowance (line 005)", {
						description: "Federal Schedule 1 line 403. Deducted.",
					}),
					f.money("ccaRecaptureFederal", "Recapture of CCA (line 007)", {
						description: "Federal Schedule 1 line 107. Added.",
					}),
					f.money("terminalLossFederal", "Terminal Loss (line 009)", {
						description: "Federal Schedule 1 line 404. Deducted.",
					}),
					f.money(
						"farmingMandatoryCurrentFederal",
						"Farming inventory — mandatory adjustment, current year (line 015)",
						{ description: "Federal Schedule 1 line 224. Added." },
					),
					f.money(
						"farmingMandatoryPriorFederal",
						"Farming inventory — mandatory adjustment, prior year (line 017)",
						{ description: "Federal Schedule 1 line 309. Deducted." },
					),
					f.money(
						"farmingOptionalCurrentFederal",
						"Farming inventory — optional value, current year (line 019)",
						{ description: "Federal Schedule 1 line 229. Added." },
					),
					f.money(
						"farmingOptionalPriorFederal",
						"Farming inventory — optional value, prior year (line 021)",
						{ description: "Federal Schedule 1 line 313. Deducted." },
					),
					f.money("depletionFederal", "Depletion (line 023)", {
						description: "Federal Schedule 1 line 344.",
					}),
					f.money("ceeFederal", "Canadian Exploration Expenses (line 027)", {
						description: "Federal Schedule 1 line 341.",
					}),
					f.money("cdeFederal", "Canadian Development Expenses (line 029)", {
						description: "Federal Schedule 1 line 340.",
					}),
					f.money(
						"foreignExplorationFederal",
						"Foreign Exploration and Development Expenses (line 031)",
						{ description: "Federal Schedule 1 line 345." },
					),
					f.money("cogpeFederal", "Canadian Oil and gas Property Expenses (line 033)", {
						description: "Federal Schedule 1 line 342.",
					}),
					f.money("sredFederal", "Scientific Research Expenses claimed in year (line 035)", {
						description: "Minus Federal Schedule 1 line 411, plus line 231.",
					}),
					f.money("taxReservesPriorFederal", "Tax reserves deducted in prior year (line 037)", {
						description: "Federal Schedule 1 line 125. Added.",
					}),
					f.money(
						"taxReservesCurrentFederal",
						"Tax reserves claimed in current year (line 039)",
						{ description: "Federal Schedule 1 line 413. Deducted." },
					),
					f.money("otherFederal", "Other — attach supporting schedule (line 041)", {
						description:
							"Fed Schedule 1 line 113 minus 406, plus other Additions, minus Fed Schedule 21 Part 1 column D, minus Fed Schedule 1 line 218.",
					}),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Transcribed off the federal return, as the form's own captions instruct. Report only the items calculated differently for Alberta — where the two sides agree, the form says to leave BOTH boxes empty.",
				},
			),
			section(
				"areaAAlberta",
				"Area A — Alberta amounts",
				[
					f.money(
						"farmingMandatoryCurrentAlberta",
						"Farming inventory — mandatory adjustment, current year (line 014)",
					),
					f.money(
						"farmingMandatoryPriorAlberta",
						"Farming inventory — mandatory adjustment, prior year (line 016)",
					),
					f.money(
						"farmingOptionalCurrentAlberta",
						"Farming inventory — optional value, current year (line 018)",
					),
					f.money(
						"farmingOptionalPriorAlberta",
						"Farming inventory — optional value, prior year (line 020)",
					),
					f.money("capitalTaxOtherProvinces", "Capital Tax Liability in other provinces (line 042)", {
						description: "Alberta only — the form shades the federal side of this row.",
					}),
					f.money("otherAlberta", "Other — attach supporting schedule (line 040)", {
						description:
							"Schedule 18 line 076 + 094, plus Schedule 15 AREAs C/D/F/G/H, minus the ACTA s.8(2.2) deduction, plus foreign affiliate property income after ITA s.152(6.1).",
					}),
					f.text("otherExplanation", "Explanation for line 040 (line 048)", {
						description: "Required whenever line 040 carries an amount.",
					}),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Only the Alberta boxes with no schedule behind them. CCA comes from Schedule 13, the resource pools from Schedule 15, SR&ED from Schedule 16 and reserves from Schedule 17 — those are resolved, not entered.",
				},
			),
			section(
				"areaBFederal",
				"Area B — federal deductions",
				[
					f.money("charitableDonationsFederal", "Charitable Donations (line 057)", {
						description: "T2 line 311.",
					}),
					f.money("giftsFederal", "Gifts to Canada or a province, cultural and ecological gifts (line 059)", {
						description: "T2 lines 312 + 313 + 314.",
					}),
					f.money("taxableDividendsFederal", "Taxable dividends deductible (line 061)", {
						description: "T2 line 320. ITA section 112, 113 or 138(6).",
					}),
					f.money("partVI1Federal", "Part VI.1 tax deduction (line 063)", {
						description: "T2 line 325.",
					}),
					f.money("nonCapitalLossesFederal", "Non-capital losses of preceding years (line 065)", {
						description: "T2 line 331.",
					}),
					f.money("netCapitalLossesFederal", "Net-capital losses of preceding years (line 067)", {
						description: "T2 line 332.",
					}),
					f.money(
						"restrictedFarmLossesFederal",
						"Restricted farm losses of preceding years (line 069)",
						{ description: "T2 line 333." },
					),
					f.money("farmLossesFederal", "Farm losses of preceding years (line 071)", {
						description: "T2 line 334.",
					}),
					f.money(
						"limitedPartnershipLossesFederal",
						"Limited partnership losses of preceding years (line 073)",
						{ description: "T2 line 335." },
					),
					f.money("rifeFederal", "Restricted interest and financing expenses (line 131)", {
						description: "T2 line 336.",
					}),
					f.money(
						"centralCreditUnionFederal",
						"Taxable capital gains / dividends from a central credit union (line 075)",
						{ description: "T2 line 340." },
					),
					f.money("prospectorSharesFederal", "Prospector's and grubstaker's shares (line 079)", {
						description: "T2 line 350.",
					}),
					f.money(
						"nonQualifiedSecuritiesFederal",
						"Employer deduction for non-qualified securities (line 141)",
						{ description: "T2 line 352." },
					),
					f.money(
						"section110AdditionsFederal",
						"Add: ITA section 110.5 / 115(1)(a)(vii) additions (line 083)",
						{ description: "The form prints T2 line 335 here, the same line it gives at 073." },
					),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Unlike Area A, every item must be specified — enter the federal T2 figure even where Alberta does not diverge.",
				},
			),
			section(
				"areaBAlberta",
				"Area B — Alberta deductions taken from the T2",
				[
					f.money("taxableDividendsAlberta", "Taxable dividends deductible (line 060)", {
						description: "T2 line 320.",
					}),
					f.money("partVI1Alberta", "Part VI.1 tax deduction (line 062)", {
						description: "T2 line 325.",
					}),
					f.money(
						"centralCreditUnionAlberta",
						"Taxable capital gains / dividends from a central credit union (line 074)",
						{ description: "T2 line 340." },
					),
					f.money("prospectorSharesAlberta", "Prospector's and grubstaker's shares (line 078)", {
						description: "T2 line 350.",
					}),
					f.money(
						"nonQualifiedSecuritiesAlberta",
						"Employer deduction for non-qualified securities (line 140)",
						{ description: "T2 line 352." },
					),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"The five Alberta deductions the form itself sources from the T2 rather than from an Alberta schedule. The other seven come from Schedules 20 and 21 and are resolved.",
				},
			),
			section(
				"abi",
				"Reconciliation of Active Business Income",
				[
					f.radio(
						"abiDiffers",
						"Does the corporation's calculation of ABI for Alberta purposes differ from its federal ABI? (line 100)",
						YES_NO,
					),
					f.money("abiFederal", "Active Business Income, federal (line 102)", {
						description:
							'Federal Schedule 7 amount "Q", or federal Schedule 16 line 124. A negative amount is shown in brackets.',
					}),
					f.money("abiAdjustment", "Adjustment to ABI for Alberta purposes (line 104)", {
						description: "Due to discretionary items. May be negative.",
					}),
				],
				{
					variant: "card",
					cols: 1,
					description:
						'Completed only when the answer at line 100 is "Yes". Line 106 (line 102 + 104, floored at zero) is what Schedule 1 line 003 uses for the Alberta small business deduction.',
				},
			),
		],
	}),
});
