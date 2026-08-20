/**
 * The working return — the shape persisted on `engagement.returnInput`.
 *
 * This is a STORAGE CONTRACT, so it is written out explicitly rather than
 * derived from the schedule registry: a preparer's saved return has to keep
 * loading after the form schemas change, and a hand-written shape makes a
 * breaking change visible in the diff.
 *
 * One optional key per schedule; the key set is pinned to the registry's
 * `ScheduleKey` union by a compile-time assertion in `_config/registry.ts`.
 */

export type LineItem = { description?: string; amount?: number };

export type CcaClass = {
  ccaClass?: string;
  openingUCC?: number;
  additions?: number;
  dispositions?: number;
  immediateExpensing?: number;
  aiip?: boolean;
  classEmptied?: boolean;
  /** Amount to claim; blank = the maximum. */
  claim?: number;
};

export type Disposition = {
  description?: string;
  proceeds?: number;
  acb?: number;
  outlays?: number;
};

export type Shareholder = {
  name?: string;
  bnOrSin?: string;
  percentCommon?: number;
  percentPreferred?: number;
};

export type IdentificationValues = {
  corpType?: string;
  /** Province/territory of the permanent establishment (Schedule 5 provincial tax). */
  province?: string;
  /**
   * Québec enterprise number (NEQ) / Revenu Québec identification number — the
   * CO-17 filing identifier. Only meaningful for a CO17 engagement.
   */
  quebecId?: string;
  acquisitionOfControl?: boolean;
  deemedYearEnd?: boolean;
  professionalCorp?: boolean;
  inactive?: boolean;
  // T2 jacket status questions
  addressChanged?: boolean;
  firstReturn?: boolean;
  nonResident?: boolean;
  amalgamation?: boolean;
  windUp?: boolean;
  finalReturn?: boolean;
  // Foreign-reporting information-return triggers
  relatedCorporations?: boolean;
  foreignAffiliates?: boolean;
  foreignPropertyOver100k?: boolean;
  nonArmsLengthNonResidentTransactions?: boolean;
};

export type PermanentEstablishmentValues = {
  province?: string;
  grossRevenue?: number;
  salariesWages?: number;
};

export type ProvincialAllocationValues = {
  establishments?: PermanentEstablishmentValues[];
};

export type BalanceSheetValues = {
  cash?: number;
  accountsReceivable?: number;
  inventory?: number;
  capitalAssetsNet?: number;
  otherAssets?: number;
  accountsPayable?: number;
  loansPayable?: number;
  otherLiabilities?: number;
  shareCapital?: number;
  retainedEarnings?: number;
};

export type IncomeStatementValues = {
  revenue?: number;
  costOfSales?: number;
  salariesAndWages?: number;
  amortization?: number;
  otherExpenses?: number;
};

export type GifiNotesValues = {
  financialStatementsIncluded?: boolean;
  preparedByAccountant?: boolean;
  reviewEngagement?: boolean;
  auditEngagement?: boolean;
};

/**
 * Schedule 1, keyed by CRA line number: `{ "104": 50000, "403": 55000 }`.
 *
 * The line number is the transmission key, so storing it as the key means what
 * the preparer typed is already in the shape the return is filed in. The former
 * `{ description, amount }[]` shape reconciled on screen and could not be filed
 * — a transmitted return has no field for a preparer's own wording.
 */
export type NetIncomeValues = {
  lines?: Record<string, number | undefined>;
};

export type DonationsValues = {
  charitable?: number;
  cultural?: number;
  ecological?: number;
  /** Unclaimed donation pool carried forward — auto-filled from last year. */
  openingDonationPool?: number;
};

export type DividendsValues = {
  taxableReceivedConnected?: number;
  taxableReceivedPortfolio?: number;
  eligibleDividendsReceived?: number;
  taxableDividendsPaid?: number;
  eligibleDividendsPaid?: number;
  /** Opening GRIP (Schedule 53) — auto-filled from last year on compute. */
  openingGrip?: number;
};

export type LossesValues = {
  nonCapitalOpening?: number;
  nonCapitalApplied?: number;
  netCapitalOpening?: number;
  netCapitalApplied?: number;
  /** Carry a current-year loss back to prior years (up to 3). */
  carrybacks?: { taxYearEnd?: string; amount?: number }[];

  // Restricted classes — each may only offset a specific income base, so the
  // base is captured alongside the pool.
  /** Farm loss, s.111(1)(d) — offsets any income. */
  farmOpening?: number;
  farmApplied?: number;
  /** Restricted farm loss, s.111(1)(c) — farming income ONLY. */
  restrictedFarmOpening?: number;
  restrictedFarmApplied?: number;
  /** Farming income this year — the ceiling for the restricted farm pool. */
  farmingIncome?: number;
  /** Limited partnership loss, s.111(1)(e) — that partnership's income only. */
  limitedPartnershipOpening?: number;
  limitedPartnershipApplied?: number;
  partnershipIncome?: number;
  /** At-risk amount, s.96(2.2). Absent means nothing can be applied. */
  atRiskAmount?: number;
};

/** Schedule 43 — Part VI.1 on dividends paid on taxable preferred shares. */
export type PreferredSharesValues = {
  shortTermPreferredDividends?: number;
  otherPreferredDividends?: number;
  electedUnder191_2?: boolean;
  priorYearPreferredDividends?: number;
  isAssociated?: boolean;
  allocatedAllowance?: number;
};

/** EIFEL — excluded-entity facts (s.18.2). Most CCPCs clear this automatically. */
export type EifelValues = {
  netInterestAndFinancingExpenses?: number;
  groupTaxableCapital?: number;
  domesticExceptionApplies?: boolean;
};

export type SbdValues = {
  activeBusinessIncome?: number;
  businessLimit?: number;
  taxableCapital?: number;
  aaii?: number;
  /** Zero-emission technology manufacturing income — reduced rate (Schedule 27). */
  zetmIncome?: number;
  /** Other associated CCPCs sharing the $500k limit (Schedule 23). */
  associated?: { name?: string; allocatedLimit?: number }[];
};

export type CcaValues = { classes?: CcaClass[] };

export type CapitalGainsValues = { dispositions?: Disposition[] };

export type CreditsValues = {
  /** Qualified SR&ED expenditures for the year (Schedule 31 ITC base). */
  sredQualifiedExpenditures?: number;
  /** Non-refundable ITC pool carried forward — auto-filled from last year. */
  openingItcPool?: number;
};

export type ForeignValues = {
  foreignNonBusinessIncome?: number;
  foreignNonBusinessTaxPaid?: number;
  foreignBusinessIncome?: number;
  foreignBusinessTaxPaid?: number;
  /** Unused business FTC carried forward — auto-filled from last year. */
  openingBusinessFtcPool?: number;
};

export type PaymentsValues = {
  /** Tax paid by instalments during the year (line 840) — drives balance owing/refund. */
  instalmentsPaid?: number;
};

export type ShareholdersValues = { list?: Shareholder[] };

/** Schedule 88 — internet business activities (information). */
export type InternetBusinessValues = {
  hasInternetBusiness?: boolean;
  webPageCount?: number;
  /** CRA reports the top five by gross revenue; extras are dropped on compute. */
  urls?: { url?: string }[];
  percentOfGrossRevenue?: number;
};

/** Schedule 101 / 24 — first return after incorporation, amalgamation or wind-up. */
export type FirstReturnValues = {
  isFirstReturn?: boolean;
  event?: "incorporation" | "amalgamation" | "windUpOfSubsidiary";
  eventDate?: string;
  /** Comma-separated in the form; split at the engine boundary. */
  predecessorBusinessNumbers?: string;
  openingAssets?: number;
  openingLiabilities?: number;
  openingEquity?: number;
};

export type ReserveRow = {
  type?: string;
  /** Balance at the beginning of the year (reversed into income). */
  opening?: number;
  /** Transfer on an amalgamation / wind-up of a subsidiary. */
  transfer?: number;
  /** Balance at the end of the year (deducted this year). */
  closing?: number;
};

/** Schedule 13 — continuity of reserves (Part 2, other reserves). */
export type ReservesValues = { rows?: ReserveRow[] };

/** Schedule 33 — taxable capital employed in Canada (balance-sheet detail). */
export type CapitalValues = {
  // Capital additions (lines 101–112)
  reservesNotDeducted?: number;
  capitalStock?: number;
  retainedEarnings?: number;
  contributedSurplus?: number;
  otherSurpluses?: number;
  deferredForexGains?: number;
  loansAndAdvances?: number;
  bondsAndDebentures?: number;
  dividendsDeclaredUnpaid?: number;
  otherLongTermDebt?: number;
  partnershipInterest?: number;
  // Capital deductions (lines 121–124)
  deferredTaxDebit?: number;
  deficitInEquity?: number;
  patronageDeducted?: number;
  deferredForexLosses?: number;
  // Investment allowance (lines 401–407)
  sharesOfOtherCorporations?: number;
  loansToOtherCorporations?: number;
  bondsOfOtherCorporations?: number;
  longTermDebtOfFinancialInstitution?: number;
  dividendsReceivable?: number;
  partnershipObligations?: number;
  partnershipInterestAsset?: number;
  // Part 4 allocation (optional)
  taxableIncomeEarnedInCanada?: number;
};

export type QuebecValues = {
  /**
   * The corporation meets Québec's small-business deduction eligibility (the
   * ≥5,500 paid-hours test, or the primary/manufacturing exemption). Fail-closed:
   * the Québec SBD rate applies only when this is explicitly true AND the
   * corporation is a CCPC.
   */
  sbdEligibleQC?: boolean;
  /** Québec business limit — blank = $500,000 (share the limit for an associated group). */
  businessLimit?: number;
};

/**
 * Alberta AT1 jacket — the mandatory fields the federal schedules do not carry.
 *
 * TRA states a requirement per field, and §3.2.3 makes "mandatory" an obligation
 * on the OUTPUT: every mandatory field ID must be filed, defaulting to zero only
 * where the value genuinely cannot be determined. Nothing here can be defaulted —
 * a corporation has gross revenue, and an unanswered question is not "No" (the
 * specification encodes No as `2`, a positive answer the corporation gives).
 *
 * So the filing path REFUSES when any of these is blank rather than filing a
 * guess. Everything else on the AT1 jacket is derived from the federal return or
 * from the client record; only what cannot be derived is collected here.
 */
/**
 * An explicitly answered yes/no.
 *
 * Absent means **unanswered**, which is not "No". TRA encodes No as the value
 * `2` — a positive answer the corporation gives — so a switch, which is off
 * until touched, would answer every question "No" on its behalf. These render as
 * radios with no preselection for exactly that reason.
 */
export type YesNo = "yes" | "no";

export type AlbertaValues = {
  /** 000047 — gross revenue per the financial statements. */
  grossRevenue?: number;
  /** 000048 — total assets. Must equal federal GIFI 2599. */
  totalAssets?: number;

  /** 000001 — associated with one or more CCPCs? */
  associatedWithCcpcs?: YesNo;
  /** 000031 — wind-up of a subsidiary under ITA s.88 during the year? */
  windUpOfSubsidiary?: YesNo;
  /** 000032 — first year of filing after an amalgamation? */
  firstYearAfterAmalgamation?: YesNo;
  /** 000038 — tax year end changed since the last return? */
  taxYearEndChanged?: YesNo;
  /** 000050 — final return? */
  finalReturn?: YesNo;
  /** 000054 — transfer of property under ITA 85(1), 85(2) or 97(2)? */
  transferOfProperty?: YesNo;
  /**
   * 000060 — reporting different taxable income for Alberta than federally?
   * TRA FORBIDS Schedule 13 when this and 000061 are both "No".
   */
  reportsDifferentAlbertaIncome?: YesNo;
  /** 000061 — elected different discretionary amounts, or opening balances differ? */
  electsDifferentDiscretionaryAmounts?: YesNo;
  /** 000095 — was the return prepared by a tax preparer for a fee? */
  preparedByTaxPreparerForFee?: YesNo;
};

export type ReturnInput = {
  identification?: IdentificationValues;
  balanceSheet?: BalanceSheetValues;
  incomeStatement?: IncomeStatementValues;
  gifiNotes?: GifiNotesValues;
  netIncome?: NetIncomeValues;
  donations?: DonationsValues;
  dividends?: DividendsValues;
  capitalGains?: CapitalGainsValues;
  losses?: LossesValues;
  preferredShares?: PreferredSharesValues;
  eifel?: EifelValues;
  sbd?: SbdValues;
  cca?: CcaValues;
  credits?: CreditsValues;
  foreign?: ForeignValues;
  provincialAllocation?: ProvincialAllocationValues;
  payments?: PaymentsValues;
  shareholders?: ShareholdersValues;
  internetBusiness?: InternetBusinessValues;
  firstReturn?: FirstReturnValues;
  reserves?: ReservesValues;
  capital?: CapitalValues;
  quebec?: QuebecValues;
  alberta?: AlbertaValues;
};

/** Numeric coercion shared by the calc + engine-mapping layers: blank ⇒ 0. */
export const n = (v: unknown): number => (v == null || v === "" ? 0 : Number(v));
