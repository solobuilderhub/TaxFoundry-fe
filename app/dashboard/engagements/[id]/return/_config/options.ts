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
 * AT1 Schedule 17's reserve kinds with a federal Schedule 13 Part 2
 * equivalent. (Two Alberta-only kinds — insurance policy reserves and bank
 * reserves — are not offered here; neither applies outside those industries,
 * and adding them without a real use is how a form field goes untested.)
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
	{ value: "otherTaxReserves", label: "Other tax reserves" },
];
