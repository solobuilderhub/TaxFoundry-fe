/** Shared select-option tables for the schedule forms. */
import { CCA_CLASSES } from "../_lib/cca-rates";

/**
 * An explicit yes/no, for questions where an unanswered box must NOT read as
 * "No". Alberta encodes No as `2` — an answer the corporation gives — so these
 * render as radios with nothing preselected rather than as switches, which are
 * off until touched and would answer on the filer's behalf.
 */
export const YES_NO = [
	{ value: "yes", label: "Yes" },
	{ value: "no", label: "No" },
];

/** AT1 Schedule 29 page 1, line 040 — primary field of science or technology. */
export const IEG_PRIMARY_FIELD_OPTIONS = [
	{ value: "1", label: "1 — Natural and formal sciences" },
	{ value: "2", label: "2 — Engineering and technology" },
	{ value: "3", label: "3 — Medical and health sciences" },
	{ value: "4", label: "4 — Agricultural sciences" },
];

/** AT4970's jurisdiction-breakdown table (lines 135–161), in the form's own order. */
export const IEG_JURISDICTION_OPTIONS = [
	{ value: "alberta", label: "Alberta (135)" },
	{ value: "britishColumbia", label: "British Columbia (137)" },
	{ value: "manitoba", label: "Manitoba (139)" },
	{ value: "newBrunswick", label: "New Brunswick (141)" },
	{
		value: "newfoundlandAndLabrador",
		label: "Newfoundland and Labrador (143)",
	},
	{ value: "northwestTerritories", label: "Northwest Territories (145)" },
	{ value: "novaScotia", label: "Nova Scotia (147)" },
	{ value: "nunavut", label: "Nunavut (149)" },
	{ value: "ontario", label: "Ontario (151)" },
	{ value: "princeEdwardIsland", label: "Prince Edward Island (153)" },
	{ value: "quebec", label: "Quebec (155)" },
	{ value: "saskatchewan", label: "Saskatchewan (157)" },
	{ value: "yukon", label: "Yukon (159)" },
	{ value: "other", label: "Other (161)" },
];

export const CORP_TYPES = [
	{ value: "CCPC", label: "CCPC: Canadian-controlled private corporation" },
	{ value: "Other private", label: "Other private corporation" },
	{ value: "Public", label: "Public corporation" },
	{ value: "Other", label: "Other" },
];

/** Province/territory of the PE — drives Schedule 5 provincial tax. AB/QC self-administer. */
export const PROVINCE_OPTIONS = [
	{ value: "AB", label: "Alberta (files AT1 separately)" },
	{ value: "BC", label: "British Columbia" },
	{ value: "MB", label: "Manitoba" },
	{ value: "NB", label: "New Brunswick" },
	{ value: "NL", label: "Newfoundland and Labrador" },
	{ value: "NS", label: "Nova Scotia" },
	{ value: "NT", label: "Northwest Territories" },
	{ value: "NU", label: "Nunavut" },
	{ value: "ON", label: "Ontario" },
	{ value: "PE", label: "Prince Edward Island" },
	{ value: "QC", label: "Quebec (files CO-17 separately)" },
	{ value: "SK", label: "Saskatchewan" },
	{ value: "YT", label: "Yukon" },
];

/** AT1 Schedule 1 eligibility — only the first two may claim the small business deduction. */
export const CORPORATION_STATUS_OPTIONS = [
	{ value: "ccpc", label: "Canadian-controlled private corporation" },
	{
		value: "albertaCoopOrCreditUnion",
		label: "Alberta co-operative or credit union",
	},
	{ value: "section149Exempt", label: "Section 149 exempt" },
	{ value: "other", label: "Other" },
];

/** Schedule 8 class picker — label/value only; the rate lives in `_lib/cca-rates`. */
export const CCA_CLASS_OPTIONS = CCA_CLASSES.map((c) => ({
	value: c.value,
	label: c.label,
}));

/**
 * AT1 Schedule 18's six disposition categories. Federal Schedule 6 ignores
 * this — it exists so a disposition entered once can also feed the Alberta
 * reconciliation, which reports category totals rather than itemised rows.
 */
export const DISPOSITION_CATEGORY_OPTIONS = [
	{ value: "shares", label: "Shares" },
	{ value: "realEstate", label: "Real estate" },
	{ value: "bonds", label: "Bonds, debentures, mortgages, notes" },
	{ value: "otherProperties", label: "Other properties" },
	{ value: "personalUse", label: "Personal-use property" },
	{ value: "listedPersonal", label: "Listed personal property" },
];

/**
 * AT1 Schedule 17's reserve kinds. The first six have a federal Schedule 13
 * Part 2 equivalent — the row's federal opening/transfer/closing default the
 * Alberta figure unless overridden below. `insurancePolicyReserves` and
 * `bankReserves` are Alberta-only (no federal Part 2 line at all), so for
 * those the federal side always reads as 0 and the Alberta override fields
 * are effectively the only source of the figure — narrow (insurance/bank
 * corporations only), but a real reserve balance dropped silently is a wrong
 * return, not a missing feature.
 */
export const RESERVE_TYPE_OPTIONS = [
	{ value: "doubtfulDebts", label: "Doubtful debts (s.20(1)(l))" },
	{
		value: "undeliveredGoodsAndServices",
		label: "Undelivered goods & services (s.20(1)(m))",
	},
	{ value: "prepaidRent", label: "Prepaid rent" },
	{ value: "returnableContainers", label: "Returnable containers" },
	{ value: "unpaidAmounts", label: "Unpaid amounts" },
	{
		value: "insurancePolicyReserves",
		label: "Insurance policy reserves (AT1-only)",
	},
	{ value: "bankReserves", label: "Bank reserves (AT1-only)" },
	{ value: "otherTaxReserves", label: "Other tax reserves" },
];
