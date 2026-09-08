/**
 * Live preview of the lines AT1 Schedule 12 derives.
 *
 * MIRRORS the engine, never replaces it — the same rule `_lib/calc.ts` follows
 * for every other schedule. Only the server's computed return is ever filed.
 *
 * Every formula is the form's own, from TRA11732 Rev. 2026-03, and is recorded
 * as `formula` on the matching field in `forms/definitions/at1sch12.ts`:
 *
 *   050  Total Federal Amount     · sum of the federal column
 *   052  Total Alberta Amount     · sum of the Alberta column
 *   054  Line 002 - line 050 + line 052
 *   081  Subtotal (federal)       · sum of Area B's federal deductions
 *   080  Subtotal (Alberta)       · sum of Area B's Alberta deductions
 *   091  Lines 002 - 081 + 083
 *   090  Lines 054 - 080 + 082
 *   106  Line 102 + 104 (if negative, enter "0")
 *
 * ── Signs ───────────────────────────────────────────────────────────────────
 *
 * Area A is not a plain sum. The form prints a sign against each row — CCA,
 * terminal loss, depletion and the resource pools are DEDUCTED; recapture and
 * the tax-reserve/inventory add-backs are ADDED — and line 054 then subtracts
 * the federal total and adds the Alberta one. The signs below are the form's,
 * read off the printed +/- beside each box.
 */
import type { AlbertaReconciliation12Values } from "../../../../_lib/return-input";

const n = (v: unknown): number => (v == null || v === "" ? 0 : Number(v) || 0);

/** Area A federal rows, with the sign the form prints beside each. */
const AREA_A_FEDERAL: readonly [keyof AlbertaReconciliation12Values, 1 | -1][] = [
	["ccaFederal", -1],
	["ccaRecaptureFederal", 1],
	["terminalLossFederal", -1],
	["farmingMandatoryCurrentFederal", 1],
	["farmingMandatoryPriorFederal", -1],
	["farmingOptionalCurrentFederal", 1],
	["farmingOptionalPriorFederal", -1],
	["depletionFederal", -1],
	["ceeFederal", -1],
	["cdeFederal", -1],
	["foreignExplorationFederal", -1],
	["cogpeFederal", -1],
	["sredFederal", -1],
	["taxReservesPriorFederal", 1],
	["taxReservesCurrentFederal", -1],
	["otherFederal", 1],
];

/**
 * Area A Alberta rows. Most are resolved from another AT1 schedule rather than
 * entered, so each names either a form-state field or the 3-digit line to read
 * through `resolved`.
 */
const AREA_A_ALBERTA: readonly [keyof AlbertaReconciliation12Values | null, string, 1 | -1][] = [
	[null, "004", -1], // CCA — Schedule 13
	[null, "006", 1], // Recapture — Schedule 13
	[null, "008", -1], // Terminal loss — Schedule 13
	["farmingMandatoryCurrentAlberta", "014", 1],
	["farmingMandatoryPriorAlberta", "016", -1],
	["farmingOptionalCurrentAlberta", "018", 1],
	["farmingOptionalPriorAlberta", "020", -1],
	[null, "022", -1], // Depletion — Schedule 15
	[null, "026", -1], // CEE — Schedule 15
	[null, "028", -1], // CDE — Schedule 15
	[null, "030", -1], // FEDE — Schedule 15
	[null, "032", -1], // COGPE — Schedule 15
	[null, "034", -1], // SR&ED — Schedule 16
	[null, "036", 1], // Tax reserves prior — Schedule 17
	[null, "038", -1], // Tax reserves current — Schedule 17
	["capitalTaxOtherProvinces", "042", 1],
	["otherAlberta", "040", 1],
];

/** Area B federal deductions, all subtracted from line 002 at line 091. */
const AREA_B_FEDERAL: readonly (keyof AlbertaReconciliation12Values)[] = [
	"charitableDonationsFederal",
	"giftsFederal",
	"taxableDividendsFederal",
	"partVI1Federal",
	"nonCapitalLossesFederal",
	"netCapitalLossesFederal",
	"restrictedFarmLossesFederal",
	"farmLossesFederal",
	"limitedPartnershipLossesFederal",
	"rifeFederal",
	"centralCreditUnionFederal",
	"prospectorSharesFederal",
	"nonQualifiedSecuritiesFederal",
];

/**
 * Area B Alberta deductions. Seven come from Schedule 20 or Schedule 21 and are
 * read through `resolved`; five the form sources from the T2 directly.
 */
const AREA_B_ALBERTA: readonly [keyof AlbertaReconciliation12Values | null, string][] = [
	[null, "056"], // Charitable donations — Schedule 20
	[null, "058"], // Gifts — Schedule 20
	["taxableDividendsAlberta", "060"],
	["partVI1Alberta", "062"],
	[null, "064"], // Non-capital losses — Schedule 21
	[null, "066"], // Net-capital losses — Schedule 21
	[null, "068"], // Restricted farm losses — Schedule 21
	[null, "070"], // Farm losses — Schedule 21
	[null, "072"], // Limited partnership losses — Schedule 21
	[null, "130"], // RIFE — Schedule 21
	["centralCreditUnionAlberta", "074"],
	["prospectorSharesAlberta", "078"],
	["nonQualifiedSecuritiesAlberta", "140"],
];

/**
 * @param values the live `albertaReconciliation12` slice, from form state
 * @param resolved reads a line carried in from another AT1 schedule, by this
 *   schedule's own 3-digit line. Returns `undefined` before a compute, which
 *   counts as nil in a total — a pair whose Alberta side is not yet computed
 *   contributes nothing, exactly as an empty box would.
 */
export function previewSchedule12(
	values: AlbertaReconciliation12Values | undefined,
	resolved: (line: string) => number | undefined,
): Record<string, number | undefined> {
	const v = values ?? {};
	const own = (k: keyof AlbertaReconciliation12Values) => n(v[k]);

	const line050 = AREA_A_FEDERAL.reduce((sum, [key, sign]) => sum + sign * own(key), 0);
	const line052 = AREA_A_ALBERTA.reduce(
		(sum, [key, line, sign]) => sum + sign * (key ? own(key) : n(resolved(line))),
		0,
	);
	const line054 = own("netIncomeFederal") - line050 + line052;

	const line081 = AREA_B_FEDERAL.reduce((sum, key) => sum + own(key), 0);
	const line080 = AREA_B_ALBERTA.reduce(
		(sum, [key, line]) => sum + (key ? own(key) : n(resolved(line))),
		0,
	);

	const line091 = own("netIncomeFederal") - line081 + own("section110AdditionsFederal");
	const line090 = line054 - line080 + n(resolved("082"));

	const line106 = Math.max(0, own("abiFederal") + own("abiAdjustment"));

	return {
		"050": line050,
		"052": line052,
		"054": line054,
		"081": line081,
		"080": line080,
		"091": line091,
		"090": line090,
		"106": line106,
	};
}
