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

/** Schedule 8 class picker — label/value only; the rate lives in `_lib/cca-rates`. */
export const CCA_CLASS_OPTIONS = CCA_CLASSES.map((c) => ({ value: c.value, label: c.label }));
