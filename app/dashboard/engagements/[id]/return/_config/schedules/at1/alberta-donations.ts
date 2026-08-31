import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { AlbertaDonationsValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";
import { Schedule20FormView } from "./paper/schedule20-form-view";

const f = fieldsFor<AlbertaDonationsValues>();

/**
 * AT1 Schedule 20 — Alberta's own two donation continuities.
 *
 * The charitable pool (line 002-018) reuses the federal Schedule 2 opening
 * balance and current-year gifts (`donations.ts`) — only the parts with no
 * federal equivalent live here: expired, transferred on wind-up, an
 * acquisition-of-control adjustment, and the amount actually applied.
 *
 * The gifts pool (line 062-078 — gifts to Canada/a province, certified
 * cultural property, ecologically sensitive land) has no federal source at
 * all. Its current-year figure defaults to federal's cultural + ecological
 * total; its opening balance can never be derived, same as every other
 * AT1-only opening balance in this engine.
 *
 * Alberta applies the SAME 75%-of-net-income ceiling federal does (Area B
 * below) — this schedule does not change what may be claimed, only what has
 * to be disclosed to file it.
 */
export const albertaDonations = defineSchedule({
	key: "albertaDonations",
	num: "020",
	label: "Alberta Donations & Gifts (S20)",
	hint: "Two continuities — charitable, and gifts to Canada/cultural/ecological",
	programs: ["AT1"],
	formView: (props) => createElement(Schedule20FormView, props),
	schema: defineSchema({
		sections: [
			section(
				"charitable",
				"Charitable donations — advanced adjustments (line 004-016)",
				[
					f.money("charitableExpired", "Expired this year", {
						description: "No federal equivalent — blank = nil",
					}),
					f.money("charitableTransferredIn", "Transfer on wind-up or amalgamation", {
						description: "No federal equivalent — blank = nil",
					}),
					f.money(
						"charitableAcquisitionOfControlAdjustment",
						"Adjustment for an acquisition of control",
						{ description: "No federal equivalent — blank = nil" },
					),
					f.money("charitableApplied", "Amount applied against Alberta taxable income", {
						description: "Blank = claim the maximum both ceilings (the pool, and 75% of Alberta net income) allow.",
					}),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Opening balance and current-year gifts come from the federal Donations & Gifts schedule — leave these blank unless Alberta genuinely diverges from federal.",
				},
			),
			section(
				"gifts",
				"Gifts to Canada/province, cultural & ecological property (line 062-076)",
				[
					f.money("giftsOpening", "Opening balance"),
					f.money("giftsCurrentYear", "Current year gifts", {
						description: "Blank = federal cultural + ecological gifts for the year.",
					}),
					f.money("giftsExpired", "Expired this year"),
					f.money("giftsTransferredIn", "Transfer on wind-up or amalgamation"),
					f.money("giftsAcquisitionOfControlAdjustment", "Adjustment for an acquisition of control"),
					f.money("giftsApplied", "Amount applied against Alberta taxable income", {
						description: "Blank = claim the maximum both ceilings allow.",
					}),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"A separate pool from charitable donations — no federal equivalent at all. Leave the opening balance blank only for a corporation's genuinely first AT1 filing with real schedules.",
				},
			),
			section(
				"maximum",
				"Maximum deduction — gains on gifted capital property (line 032-040)",
				[
					f.money("taxableCapitalGainsOnGifts", "Taxable capital gains arising on gifts of capital property"),
					f.money("deemedGiftGains", "Taxable capital gain on deemed gifts of non-qualifying securities"),
					f.money("recaptureOnGifts", "Recapture of capital cost allowance on charitable gifts"),
					f.money("proceedsNetOfOutlays", "Proceeds of disposition, less outlays and expenses"),
					f.money("capitalCost", "Capital cost of the gifted property"),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"Adds 25% of the lesser-of-bounded gains/recapture to the 75%-of-income ceiling. Leave blank if the corporation made no gifts of capital property this year.",
				},
			),
			section(
				"carryforward",
				"Carryforward available, by category (line 090-100)",
				[
					field.date("carryforwardYearOfOrigin", "Year of origin (line 090)", {
						description: "Mandatory whenever any category below is entered. Leave the whole section blank to omit it.",
					}),
					f.money("carryforwardCharitable", "Charitable donations available for carryforward (line 092)", {
						description: "Blank = the charitable pool's own closing balance, above.",
					}),
					f.money(
						"carryforwardToCanadaOrProvince",
						"Gifts to Canada, a province or territory available for carryforward (line 094)",
					),
					f.money(
						"carryforwardCulturalProperty",
						"Gifts of certified cultural property available for carryforward (line 096)",
					),
					f.money(
						"carryforwardEcologicalLand",
						"Gifts of certified ecologically sensitive land available for carryforward (line 098)",
					),
					f.money(
						"carryforwardMedicine",
						"Additional deduction for gifts of medicine available for carryforward (line 100)",
						{ description: "ITA s.110.1(1)(a.1) — not modelled anywhere else in this engine." },
					),
				],
				{
					variant: "card",
					cols: 2,
					description:
						"The gifts pool above (062-078) is ONE combined continuity; this block reports how much of its closing balance belongs to each of the three federal source categories, plus the medicine-gift deduction. Optional — most filings leave this blank.",
				},
			),
		],
	}),
});
