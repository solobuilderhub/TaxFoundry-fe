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
	/** Amount to claim; blank = the maximum. An explicit 0 claims nothing. */
	claim?: number;

	/**
	 * AT1 Schedule 13 — the Alberta figures for this class, when they diverge
	 * from federal. Both are OVERRIDES: blank takes the federal figure, so a
	 * class that matches federally needs nothing here. An explicit `0` is a real
	 * answer (claim nothing for Alberta), not an absent one.
	 *
	 * Alberta permits a different discretionary CCA claim from federal — a
	 * corporation may claim a class federally and not provincially, or the
	 * reverse. Filing these requires jacket line 000060 or 000061 to be "yes";
	 * TRA forbids Schedule 13 outright when the return declares no divergence.
	 */
	/** 013003 — Alberta opening UCC, when it differs from federal. */
	albertaOpeningUCC?: number;
	/** 013019 — the Alberta discretionary claim. Blank = the same as federal. */
	albertaClaim?: number;
};

/**
 * AT1 Schedule 18's six category buckets. Federal Schedule 6 does not
 * categorize dispositions — this exists so ONE list of dispositions can feed
 * both the federal computation (which ignores it) and the Alberta one (which
 * needs the category to bucket proceeds/ACB/outlays into its six totals).
 */
export const AT1_DISPOSITION_CATEGORIES = [
	"shares",
	"realEstate",
	"bonds",
	"otherProperties",
	"personalUse",
	"listedPersonal",
] as const;
export type At1DispositionCategory =
	(typeof AT1_DISPOSITION_CATEGORIES)[number];

export type Disposition = {
	description?: string;
	proceeds?: number;
	acb?: number;
	outlays?: number;
	/** Feeds AT1 Schedule 18 only; the federal Schedule 6 computation ignores it. */
	category?: At1DispositionCategory;
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

/**
 * AT1 Schedule 17's reserve kinds. A controlled list rather than free text so
 * the Alberta reconciliation can map each row exactly — a free-text "type"
 * cannot be matched reliably against AT1's own kind enum. The federal
 * computation only reads opening/transfer/closing, so this is a safe,
 * additive change for existing federal-only data too.
 */
export const RESERVE_TYPES = [
	"doubtfulDebts",
	"undeliveredGoodsAndServices",
	"prepaidRent",
	"returnableContainers",
	"unpaidAmounts",
	"insurancePolicyReserves",
	"bankReserves",
	"otherTaxReserves",
] as const;
export type ReserveType = (typeof RESERVE_TYPES)[number];

export type ReserveRow = {
	type?: ReserveType;
	/** Balance at the beginning of the year (reversed into income). */
	opening?: number;
	/** Transfer on an amalgamation / wind-up of a subsidiary. */
	transfer?: number;
	/** Balance at the end of the year (deducted this year). */
	closing?: number;

	/**
	 * AT1 Schedule 17 — the Alberta figures for this reserve, when they diverge
	 * from federal. All three are OVERRIDES: blank takes the federal figure, so
	 * a reserve that matches federally needs nothing here. An explicit `0` is a
	 * real answer, not an absent one. For `insurancePolicyReserves` /
	 * `bankReserves` — Alberta-only kinds with no federal Part 2 equivalent —
	 * federal always reads as 0, so these three fields are effectively the only
	 * source of the figure.
	 */
	albertaOpening?: number;
	albertaTransfer?: number;
	albertaClosing?: number;
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

	/**
	 * AT1 Schedule 1 (Alberta Small Business Deduction) eligibility. Everything
	 * else the schedule needs (active business income, Alberta taxable income)
	 * is already derived from the federal return; these three cannot be.
	 */
	/** Eligibility gate — only a CCPC, or an Alberta co-op/credit union, may claim the SBD. */
	corporationStatus?:
		| "ccpc"
		| "albertaCoopOrCreditUnion"
		| "section149Exempt"
		| "other";
	/** CCPC status must hold THROUGHOUT the year; a mid-year change bars the claim. */
	wasCcpcThroughoutYear?: YesNo;
	/** 001005 / 001011 — Alberta Royalty Tax Deduction (Schedule 5), oil & gas only. */
	royaltyTaxDeduction?: number;
};

/**
 * AT1 Schedule 21 — Alberta's own loss-pool CONTINUITY. Unlike the pools
 * Schedule 12 reconciles against federal figures, the OPENING balance here can
 * never be derived: it is Alberta's own carried-forward balance from a PRIOR
 * AT1 filing, and federal has no equivalent concept to default it from. Blank
 * is not the same as zero — a corporation's first AT1 filing with real
 * schedules genuinely has no history yet, and that has to be stated, not
 * assumed.
 *
 * Four of the five pools (non-capital, capital, farm, restricted farm) reuse
 * the federal return's CURRENT YEAR activity (loss created, applied,
 * expired) — only the opening balance is Alberta-only. Listed personal
 * property has no federal equivalent at all, so its full continuity is
 * collected here.
 */
/**
 * The four pools with a federal equivalent (non-capital, capital, farm,
 * restricted farm) each get the SAME five override/entry fields — applied
 * and expired default to federal's own figure when left blank (AT1 spec:
 * "if the Alberta amount differs from federal, enter it; otherwise the value
 * equals the federal amount"); wind-up transfer, the s.80 adjustment and
 * other adjustments have no federal equivalent to default from at all, so
 * they are plain entries (blank = nil, not "same as federal").
 */
type AlbertaLossPoolOverrides<Prefix extends string> = {
	[K in
		| `${Prefix}Applied`
		| `${Prefix}Expired`
		| `${Prefix}WindUpTransfer`
		| `${Prefix}Section80Adjustment`
		| `${Prefix}OtherAdjustments`]?: number;
};

export type AlbertaContinuityValues = {
	nonCapitalOpening?: number;
	capitalOpening?: number;
	farmOpening?: number;
	restrictedFarmOpening?: number;
	/** Listed personal property — no federal equivalent; the whole pool is Alberta-only. */
	lppOpening?: number;
	lppCurrentYearLoss?: number;
	lppApplied?: number;
	lppExpired?: number;
	lppOtherAdjustments?: number;
	/** The sixth section of the live form — one row per partnership, not per jurisdiction. */
	limitedPartnerships?: LimitedPartnershipLossRow[];
	/**
	 * The SEVENTH section — non-capital losses by year of origin. Row 0 (the
	 * current year) is fully derived server-side (must equal the schedule's
	 * own current-year loss and total carried-back) — only PRIOR vintages
	 * (1-20 years ago) are entered here; that history cannot be derived.
	 */
	nonCapitalVintages?: NonCapitalLossVintageRow[];
	/** The EIGHTH section — farm/restricted-farm/LPP by year of origin, one row per vintage (0-20). */
	otherLossVintages?: OtherLossVintageRow[];
} & AlbertaLossPoolOverrides<"nonCapital"> &
	AlbertaLossPoolOverrides<"capital"> &
	AlbertaLossPoolOverrides<"farm"> &
	AlbertaLossPoolOverrides<"restrictedFarm">;

/** AT1 Schedule 21, lines 151-169 — ONE prior vintage (1-20 years ago) of the non-capital loss pool. */
export type NonCapitalLossVintageRow = {
	/** 1 = the immediately preceding taxation year, up to 20 (the expiry limit). */
	yearsAgo?: number;
	taxYearEnd?: string;
	balanceAtBeginning?: number;
	/** Signed — an addition or a reduction to this vintage. */
	adjustments?: number;
	/** Applied to reduce taxable income this year, from THIS vintage specifically. */
	applied?: number;
};

/** AT1 Schedule 21, lines 181-187 — one row per vintage year (0 = current, 1-20 = preceding). */
export type OtherLossVintageRow = {
	yearIndex?: number;
	farmLosses?: number;
	restrictedFarmLosses?: number;
	/** Refused (zeroed) beyond yearIndex 7 — listed personal property expires after 7 years, not 20. */
	listedPersonalPropertyLosses?: number;
};

/** AT1 Schedule 21, lines 131-141 — one row per limited partnership. */
export type LimitedPartnershipLossRow = {
	identifier?: string;
	precedingYearBalance?: number;
	transferredOnWindUp?: number;
	currentYearLoss?: number;
	/** Capped at precedingYearBalance + transferredOnWindUp; blank = nothing applied. */
	applied?: number;
};

/** One member of the group claiming the Innovation Employment Grant together. */
export type IegGroupMember = {
	name?: string;
	/** Taxable capital employed in Canada, this member's last taxation year ending in the prior calendar year. */
	taxableCapital?: number;
	/** Eligible Alberta SR&ED expenditures, first preceding taxation year. */
	priorYear1?: number;
	/** Eligible Alberta SR&ED expenditures, second preceding taxation year. */
	priorYear2?: number;
};

/**
 * One row of the formal Agreement Among Associated Corporations (Schedule 29
 * page 3). Separate from `IegGroupMember` above: the group figures set the
 * BASE level of spending and the taxable-capital grind (informal, every
 * associated claim needs them); the Agreement is a filed document that gates
 * the ASSOCIATED enhanced-rate formula (line 125) instead of the
 * non-associated one (line 112) — a genuinely different credit calculation,
 * not a variant of the group figures.
 */
export type IegAgreementMember = {
	name?: string;
	/** Alberta Corporate Account Number. */
	albertaCan?: string;
	/** This member's own current taxation year end, ISO `YYYY-MM-DD`. */
	currentTaxationYearEnd?: string;
	/** This member's own agreed share of the expenditure limit (line 240). */
	allocatedExpenditureLimit?: number;
	/** This member's own current-year eligible Alberta expenditures (line 245). */
	currentYearExpenditures?: number;
	/** This member's own first-preceding-year Alberta expenditures (line 250). */
	priorYear1?: number;
	/** This member's own second-preceding-year Alberta expenditures (line 260). */
	priorYear2?: number;
	/** This member's own taxable capital for the first preceding year (line 265). */
	taxableCapitalPriorYear?: number;
	/** Days in THIS member's own current taxation year. Leave blank for a full (365-day) year. */
	daysInTaxYear?: number;
	/**
	 * Whether this member has a permanent establishment in Alberta. A member
	 * without one is not eligible for the IEG at all — line 268 is nil even
	 * when this member's own figures would otherwise allow an amount — though
	 * its figures still count toward the group's totals. Leave blank for a
	 * member other than yourself only when genuinely unknown; the return
	 * treats a blank answer as "no PE" (the direction that understates the
	 * grant, not overstates it) and flags it rather than assuming.
	 */
	hasAlbertaPermanentEstablishment?: YesNo;
};

/**
 * One project's Alberta SR&ED spending, for the AT4970 attachment (Listing
 * of Innovation Employment Grant Projects Carried Out in Alberta) — a
 * separate NetFile schedule from Schedule 29 itself, required whenever the
 * IEG is claimed. The TOTAL row across every project transcribes onto
 * Schedule 29 page 1's own eligible-expenditure lines automatically.
 */
export type IegProjectRow = {
	/** Line 101 — same information as line 200 from Part 2 of federal T661. */
	title?: string;
	/** Line 103 — project code (federal T661 line 206). */
	projectCode?: string;
	/** Line 105 — portion of the federal figure incurred in Alberta, this project, before IEG. */
	albertaPortion?: number;
	/** Line 107 — portion NOT carried out in Alberta, this project. */
	otherPortion?: number;
	/** Line 109 — salaries and wages re SR&ED carried out in Alberta, this project. */
	salariesAndWages?: number;
	/** Line 111 — federal prescribed proxy amount included in the Alberta portion, if claimed federally. */
	federalProxyAmount?: number;
	/** Line 113 — Alberta proxy amount for this project, if line 111 applies. */
	albertaProxyAmount?: number;
};

/** One row of AT4970's jurisdiction-breakdown table (135–161) — informational, entered directly. */
export type IegJurisdictionAmount = {
	jurisdiction?:
		| "alberta"
		| "britishColumbia"
		| "manitoba"
		| "newBrunswick"
		| "newfoundlandAndLabrador"
		| "northwestTerritories"
		| "novaScotia"
		| "nunavut"
		| "ontario"
		| "princeEdwardIsland"
		| "quebec"
		| "saskatchewan"
		| "yukon"
		| "other";
	amountIncurred?: number;
};

/**
 * AT1 Schedule 29 — the Innovation Employment Grant. Entirely Alberta-only:
 * federal tracks SR&ED spending Canada-wide, with no Alberta-specific split,
 * and the associated-group figures (taxable capital, prior-year Alberta
 * spending) have no federal source at all.
 *
 * "Eligible expenditures" (line 031) is DERIVED, not a number a preparer
 * types in directly — Schedule 29 page 1 builds it from the federal T661
 * figure below, adjusted by the AT4970 attachment's own totals (or by the
 * override fields here, when there is no project to list). This mirrors the
 * live form exactly; an earlier version of this return collected only a
 * bare `eligibleExpenditures` number with nothing to derive it from.
 */
export type AlbertaIegValues = {
	/**
	 * Line 003 — federal amount of qualified/current SR&ED expenditures.
	 * Federal T661 line 559 for a taxation year ending on or before
	 * 2024-12-15; T661 line 557 (a DIFFERENT federal figure) for a taxation
	 * year ending on or after 2024-12-16.
	 */
	federalAmount?: number;
	/**
	 * Line 005 — portion of the federal amount carried out in Alberta. Leave
	 * blank when `projects` below has at least one row — it defaults to the
	 * AT4970 attachment's own total. Set it here only to override that
	 * default, or when there are no projects to list individually.
	 */
	albertaPortion?: number;
	/** Line 007 — deduct: federal prescribed proxy amount. Defaults from `projects`' total when omitted. */
	federalProxyAmount?: number;
	/** Line 009 — add: Alberta proxy amount. Defaults from `projects`' total when omitted. */
	albertaProxyAmount?: number;
	/**
	 * Line 011 — add: IEG that reduced the federal expenditure IN THE
	 * TAXATION YEAR. Leave blank for a first-time current-year claim reported
	 * on the pre-deduction federal figures — the ordinary case.
	 */
	iegReducingFederalExpenditure?: number;
	/**
	 * Line 025 — add: the Alberta portion of a repayment of government
	 * assistance (other than an IEG) or a contract payment, relating to
	 * amounts in `albertaPortion` from the current year or any preceding
	 * taxation year.
	 */
	repaymentOrContractPayment?: number;
	/** Line 040 — primary field of science or technology. */
	primaryFieldCode?: "1" | "2" | "3" | "4";
	/**
	 * AT4970 — one row per Alberta SR&ED project. The TOTAL row across every
	 * project feeds `albertaPortion` / `federalProxyAmount` /
	 * `albertaProxyAmount` above automatically.
	 */
	projects?: IegProjectRow[];
	/** AT4970's jurisdiction-breakdown table — informational, entered directly. */
	jurisdictions?: IegJurisdictionAmount[];
	/**
	 * Every member of the associated group, INCLUDING this corporation. Pass a
	 * single-member list even when there is no association — an empty list
	 * fails closed (no grant claimed) rather than assuming no grind and no
	 * base, which would overstate the grant on absent data.
	 */
	group?: IegGroupMember[];
	/** This corporation's agreed share of the group's expenditure limit. Omit to take the whole limit. */
	allocatedLimit?: number;
	/** Recapture where IEG-funded property was sold or converted to commercial use in the year. */
	recapture?: number;
	/**
	 * Formal Agreement Among Associated Corporations (Schedule 29 page 3) —
	 * CAN of the member with the longest taxation year (line 200).
	 * Leave `agreementMembers` empty when the group has not filed one: the
	 * grant then uses the non-associated formula (line 112).
	 */
	agreementLongestYearCan?: string;
	/** That member's own tax year begin, ISO `YYYY-MM-DD` (line 202). */
	agreementLongestYearBegin?: string;
	/** That member's own tax year end, ISO `YYYY-MM-DD` (line 204). */
	agreementLongestYearEnd?: string;
	/** Days in that longest year — up to 366 (line 206). Leave blank for a full (365-day) year. */
	agreementDaysInLongestYear?: number;
	/**
	 * The Agreement's member table. Put the claiming corporation FIRST — its
	 * own allocated allowed amount (line 268) becomes line 325, which is what
	 * actually switches the grant to the associated formula.
	 */
	agreementMembers?: IegAgreementMember[];
};

/**
 * The 9 AT1 schedules below (3/4/5/6/7/8/9/11/15) deviate from this file's own
 * "written out explicitly, zero imports" discipline stated at the top: their
 * `Values` types (and every row/member sub-type they need) are IMPORTED from
 * each schedule's own `_config/schedules/alberta-scheduleN.ts` file instead of
 * being retyped here by hand. Those types were authored in lockstep with each
 * schedule's own `apps/server` composer during a large parallel build — hand-
 * retyping ~15 nested row shapes (Schedule 15 alone has 13) back into this
 * file risks a silent drift between the two copies that the compiler cannot
 * catch, which is a worse failure mode than this file importing for once. Not
 * a precedent for future schedules — a normal new schedule should still define
 * its `Values` type here first, per this file's own header comment.
 */
import type { AlbertaOtherCredits3Values } from "../_config/schedules/alberta-schedule3";
import type { AlbertaForeignInvestment4Values } from "../_config/schedules/alberta-schedule4";
import type { AlbertaRoyaltyDeduction5Values } from "../_config/schedules/alberta-schedule5";
import type { AlbertaRoyaltyCredit6Values } from "../_config/schedules/alberta-schedule6";
import type { AlbertaRoyaltySupplemental7Values } from "../_config/schedules/alberta-schedule7";
import type { AlbertaPoliticalContributions8Values } from "../_config/schedules/alberta-schedule8";
import type { AlbertaSredCredit9Values } from "../_config/schedules/alberta-schedule9";
import type { AlbertaManufacturing11Values } from "../_config/schedules/alberta-schedule11";
import type { AlbertaResourceDeductions15Values } from "../_config/schedules/alberta-schedule15";

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
	albertaContinuity?: AlbertaContinuityValues;
	albertaIeg?: AlbertaIegValues;
	albertaOtherCredits3?: AlbertaOtherCredits3Values;
	albertaForeignInvestment4?: AlbertaForeignInvestment4Values;
	albertaRoyaltyDeduction5?: AlbertaRoyaltyDeduction5Values;
	albertaRoyaltyCredit6?: AlbertaRoyaltyCredit6Values;
	albertaRoyaltySupplemental7?: AlbertaRoyaltySupplemental7Values;
	albertaPoliticalContributions8?: AlbertaPoliticalContributions8Values;
	albertaSredCredit9?: AlbertaSredCredit9Values;
	albertaManufacturing11?: AlbertaManufacturing11Values;
	albertaResourceDeductions15?: AlbertaResourceDeductions15Values;
};

/** Numeric coercion shared by the calc + engine-mapping layers: blank ⇒ 0. */
export const n = (v: unknown): number =>
	v == null || v === "" ? 0 : Number(v);
