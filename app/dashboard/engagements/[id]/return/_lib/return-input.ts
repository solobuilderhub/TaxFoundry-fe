/**
 * The working return — the shape persisted on `engagement.returnInput`.
 *
 * GENERATED — do not hand-edit. Source of truth:
 * `apps/server/src/engine/contracts/return-input.ts` (a Zod schema — also
 * the runtime validator at the HTTP boundary, see that repo's
 * `return-input-validation.ts`). Regenerate with, from `apps/server`:
 *
 *   npx tsx scripts/emit-return-input.ts
 *
 * A checked drift test in `apps/server` (`tests/return-input-drift.test.ts`)
 * fails CI if this file and a fresh emit disagree.
 *
 * One optional key per schedule; the key set is pinned to the registry's
 * `ScheduleKey` union by a compile-time assertion in `_config/registry.ts`.
 */

export type At1DispositionCategory =
	"shares" | "realEstate" | "bonds" | "otherProperties" | "personalUse" | "listedPersonal";
export type ReserveType =
	| "doubtfulDebts"
	| "undeliveredGoodsAndServices"
	| "prepaidRent"
	| "returnableContainers"
	| "unpaidAmounts"
	| "insurancePolicyReserves"
	| "bankReserves"
	| "otherTaxReserves";
export type YesNo = "yes" | "no";

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
	albertaSbd?: AlbertaSbdValues;
	albertaDonations?: AlbertaDonationsValues;
	albertaContinuity?: AlbertaContinuityValues;
	albertaIeg?: AlbertaIegValues;
	albertaOtherCredits3?: AlbertaOtherCredits3Values;
	albertaForeignInvestment4?: AlbertaForeignInvestment4Values;
	albertaRoyaltyDeduction5?: AlbertaRoyaltyDeduction5Values;
	albertaRoyaltyCredit6?: AlbertaRoyaltyCredit6Values;
	albertaRoyaltySupplemental7?: AlbertaRoyaltySupplemental7Values;
	albertaPoliticalContributions8?: AlbertaPoliticalContributions8Values;
	albertaSredCredit9?: AlbertaSredCredit9Values;
	albertaResourceDeductions15?: AlbertaResourceDeductions15Values;
};
export type IdentificationValues = {
	corpType?: string;
	/**
	 * Province/territory of the permanent establishment (Schedule 5 provincial tax).
	 */
	province?: string;
	/**
	 * Québec enterprise number (NEQ) / Revenu Québec identification number — the CO-17 filing identifier. Only meaningful for a CO17 engagement.
	 */
	quebecId?: string;
	acquisitionOfControl?: boolean;
	deemedYearEnd?: boolean;
	professionalCorp?: boolean;
	inactive?: boolean;
	addressChanged?: boolean;
	firstReturn?: boolean;
	nonResident?: boolean;
	amalgamation?: boolean;
	windUp?: boolean;
	finalReturn?: boolean;
	relatedCorporations?: boolean;
	foreignAffiliates?: boolean;
	foreignPropertyOver100k?: boolean;
	nonArmsLengthNonResidentTransactions?: boolean;
};
export type BalanceSheetValues = {
	cash?: number;
	accountsReceivable?: number;
	inventory?: number;
	capitalAssetsNet?: number;
	/**
	 * GIFI 2009 — accumulated amortization on tangible capital assets. Optional: leave blank if unknown, and capitalAssetsNet still files (as a net figure) under GIFI 2008.
	 */
	accumulatedAmortization?: number;
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
export type NetIncomeValues = {
	/**
	 * Schedule 1, keyed by CRA line number: { "104": 50000, "403": 55000 }.
	 *
	 * The line number is the transmission key, so storing it as the key means what the preparer typed is already in the shape the return is filed in. The former { description, amount }[] shape reconciled on screen and could not be filed — a transmitted return has no field for a preparer's own wording.
	 */
	lines?: {
		[k: string]: number;
	};
};
export type DonationsValues = {
	charitable?: number;
	cultural?: number;
	ecological?: number;
	/**
	 * Unclaimed donation pool carried forward — auto-filled from last year.
	 */
	openingDonationPool?: number;
};
export type DividendsValues = {
	taxableReceivedConnected?: number;
	taxableReceivedPortfolio?: number;
	eligibleDividendsReceived?: number;
	taxableDividendsPaid?: number;
	eligibleDividendsPaid?: number;
	/**
	 * Opening GRIP (Schedule 53) — auto-filled from last year on compute.
	 */
	openingGrip?: number;
};
export type CapitalGainsValues = {
	dispositions?: Disposition[];
};
export type Disposition = {
	description?: string;
	proceeds?: number;
	acb?: number;
	outlays?: number;
	/**
	 * Feeds AT1 Schedule 18 only; the federal Schedule 6 computation ignores it.
	 */
	category?: At1DispositionCategory | "";
};
export type LossesValues = {
	nonCapitalOpening?: number;
	nonCapitalApplied?: number;
	netCapitalOpening?: number;
	netCapitalApplied?: number;
	/**
	 * Carry a current-year loss back to prior years (up to 3).
	 */
	carrybacks?: {
		taxYearEnd?: string;
		amount?: number;
	}[];
	/**
	 * Farm loss, s.111(1)(d) — offsets any income.
	 */
	farmOpening?: number;
	farmApplied?: number;
	/**
	 * Restricted farm loss, s.111(1)(c) — farming income ONLY.
	 */
	restrictedFarmOpening?: number;
	restrictedFarmApplied?: number;
	/**
	 * Farming income this year — the ceiling for the restricted farm pool.
	 */
	farmingIncome?: number;
	/**
	 * Limited partnership loss, s.111(1)(e) — that partnership’s income only.
	 */
	limitedPartnershipOpening?: number;
	limitedPartnershipApplied?: number;
	partnershipIncome?: number;
	/**
	 * At-risk amount, s.96(2.2). Absent means nothing can be applied.
	 */
	atRiskAmount?: number;
};
export type PreferredSharesValues = {
	shortTermPreferredDividends?: number;
	otherPreferredDividends?: number;
	electedUnder191_2?: boolean;
	priorYearPreferredDividends?: number;
	isAssociated?: boolean;
	allocatedAllowance?: number;
};
export type EifelValues = {
	netInterestAndFinancingExpenses?: number;
	groupTaxableCapital?: number;
	domesticExceptionApplies?: boolean;
	/**
	 * Schedule 130 Part 2A line 045 — the corporation’s GROSS interest and financing expenses. Distinct from the group NET figure above, which only settles the de-minimis excluded-entity test.
	 */
	interestAndFinancingExpenses?: number;
	/**
	 * Schedule 130 Part 2D line 072 — interest and financing revenues.
	 */
	interestAndFinancingRevenues?: number;
	/**
	 * Schedule 130 Part 2F line 106 — supply only to override the engine’s own derivation, which builds it from taxable income plus IFE, CCA, resource deductions, terminal loss and the 110(1)(k) deduction.
	 */
	adjustedTaxableIncome?: number;
	/**
	 * Whether a group ratio election under subsection 18.21(2) was made.
	 */
	hasGroupRatioElection?: boolean;
	/**
	 * Schedule 130 line 118/132 — the allocated group ratio amount.
	 */
	groupRatioAmount?: number;
	/**
	 * Schedule 130 Part 2J line 128 — RIFE carried forward from previous tax years.
	 */
	rifeFromPreviousYears?: number;
	/**
	 * Schedule 130 Part 1A — capacity received from eligible group entities (line 130).
	 */
	receivedCapacity?: {
		entityName?: string;
		accountNumber?: string;
		taxYearEnd?: string;
		amount?: number;
	}[];
	/**
	 * Schedule 130 Part 2I — the three preceding years’ excess-capacity vintages.
	 */
	priorYearExcessCapacity?: {
		/**
		 * 1, 2 or 3 — the form carries three years only.
		 */
		yearsAgo?: number;
		/**
		 * 122
		 */
		excessCapacity?: number;
		/**
		 * 123 — under subsection 18.2(4)
		 */
		previouslyTransferred?: number;
		/**
		 * 124 — under subsection 18.2(2)
		 */
		previouslyAbsorbed?: number;
	}[];
	/**
	 * Schedule 130 Part 2N line 158 — partnership IFE add-back (Schedule 1 line 252). Derived from `partnershipIfe` below × the denied proportion; supply only to override.
	 */
	partnershipIfeAddBack?: number;
	/**
	 * Part 1B — public-sector agreements whose borrowings produce exempt IFE.
	 */
	exemptIfe?: {
		/**
		 * 007
		 */
		authorityName?: string;
		/**
		 * 008
		 */
		principalAmount?: number;
		/**
		 * 009
		 */
		ifeIncurred?: number;
		/**
		 * 010 — reduces ATI (line 104)
		 */
		incomeFromFundedActivities?: number;
		/**
		 * 011 — adds to ATI (line 092)
		 */
		lossFromFundedActivities?: number;
	}[];
	/**
	 * Part 1C — borrowings and other financings.
	 */
	borrowings?: {
		relationship?:
			"canadian-arm-length" | "canadian-non-arm-length" | "non-resident-arm-length" | "non-resident-non-arm-length";
		/**
		 * 012
		 */
		principalAmount?: number;
		/**
		 * 013
		 */
		derivativeNotional?: number;
		/**
		 * 014 → line 027
		 */
		interestPaidOrPayable?: number;
		/**
		 * 015 → line 033
		 */
		fundingCostAmounts?: number;
		/**
		 * 016 → line 042
		 */
		costReducingAmounts?: number;
	}[];
	/**
	 * Part 1D — loans and other financings.
	 */
	loans?: {
		relationship?:
			"canadian-arm-length" | "canadian-non-arm-length" | "non-resident-arm-length" | "non-resident-non-arm-length";
		/**
		 * 017
		 */
		principalAmount?: number;
		/**
		 * 018
		 */
		derivativeNotional?: number;
		/**
		 * 019 → line 061
		 */
		returnAmounts?: number;
		/**
		 * 020 → line 066
		 */
		returnReducingAmounts?: number;
	}[];
	/**
	 * Part 1E — IFE allocated from a partnership. Feeds lines 039, 142 and 156.
	 */
	partnershipIfe?: {
		/**
		 * 021
		 */
		partnershipName?: string;
		/**
		 * 022
		 */
		accountNumber?: string;
		/**
		 * 023
		 */
		shareOfPartnershipIfe?: number;
		/**
		 * 024
		 */
		portionUnderParagraph12_1_l1?: number;
		/**
		 * 025
		 */
		portionDeniedBySubsection96_2_1?: number;
	}[];
	/**
	 * Part 2B — IFE capitalized into the cost of depreciable property.
	 */
	capitalizedIfe?: {
		/**
		 * 046
		 */
		ccaClass?: string;
		/**
		 * 047
		 */
		ifeInOpeningUcc?: number;
		/**
		 * 048 — signed
		 */
		ifeInAcquisitionsAndDispositions?: number;
		/**
		 * 050 → line 032
		 */
		ifeInTerminalLoss?: number;
		/**
		 * 051 → line 030
		 */
		ifeInCca?: number;
	}[];
	/**
	 * Part 2C — IFE sitting inside resource expense pools.
	 */
	resourceIfe?: {
		pool:
			| "ccee-regular"
			| "ccee-successor"
			| "ccde-regular"
			| "ccde-successor"
			| "ccogpe-regular"
			| "ccogpe-successor"
			| "fede-regular"
			| "fede-successor"
			| "cfre-regular"
			| "cfre-successor";
		/**
		 * 053
		 */
		ifeInOpeningBalance?: number;
		/**
		 * 054 — signed
		 */
		ifeAddedOrDeducted?: number;
		/**
		 * 056 → line 031
		 */
		ifeInCurrentYearClaim?: number;
	}[];
	/**
	 * Part 2E — the IFE-derived portion of a 111(1)(a) loss claim (line 089).
	 */
	lossPortionFromIfe?: {
		/**
		 * 073
		 */
		taxYearOfOrigin?: string;
		/**
		 * 074 — variable J(i)
		 */
		nonCapitalLoss?: number;
		/**
		 * 075 — variable J(ii)
		 */
		variableJSecondAmount?: number;
		/**
		 * 077
		 */
		amountDeducted?: number;
	}[];
	/**
	 * Part 2M, first table — subclause 95(2)(f.11)(ii)(D)(I).
	 */
	clause95Denied?: {
		/**
		 * 144
		 */
		affiliateName?: string;
		/**
		 * 145
		 */
		variableAForAffiliate?: number;
		/**
		 * 148 — as a FRACTION (0.4, not 40)
		 */
		specifiedParticipatingPercentage?: number;
	}[];
	/**
	 * Part 2M, second table — subclause 95(2)(f.11)(ii)(D)(II).
	 */
	clause95Included?: {
		/**
		 * 151
		 */
		affiliateName?: string;
		/**
		 * 152
		 */
		amountInAffiliateFapi?: number;
		/**
		 * 153 — as a FRACTION
		 */
		specifiedParticipatingPercentage?: number;
	}[];
	/**
	 * Part 2A — the IFE lines NOT fed by the tables above. Lines 027/030/031/032/033/039/042 come from Parts 1C, 1E, 2B and 2C and must not be repeated here.
	 */
	ifeDetail?: {
		/**
		 * 028
		 */
		otherInterest?: number;
		/**
		 * 029
		 */
		subsection20_1_eAmounts?: number;
		/**
		 * 034
		 */
		fundingCostLoss?: number;
		/**
		 * 035
		 */
		fundingCostCapitalLoss?: number;
		/**
		 * 036
		 */
		feeGivingRiseToIfe?: number;
		/**
		 * 037
		 */
		feeReducingIfe?: number;
		/**
		 * 038
		 */
		leaseFinancingAmount?: number;
		/**
		 * 040
		 */
		reinstatedPartnershipLoss?: number;
		/**
		 * 041 — also line 143
		 */
		affiliateRaife?: number;
		/**
		 * 043
		 */
		costReducingGain?: number;
		/**
		 * 044
		 */
		costReducingPartnershipShare?: number;
	};
	/**
	 * Part 2D — the IFR lines not fed by Part 1D (lines 061 and 066).
	 */
	ifrDetail?: {
		/**
		 * 058
		 */
		interestReceived?: number;
		/**
		 * 059
		 */
		subsection12_9Amounts?: number;
		/**
		 * 060
		 */
		guaranteeFees?: number;
		/**
		 * 062
		 */
		returnGain?: number;
		/**
		 * 063
		 */
		leaseFinancingAmount?: number;
		/**
		 * 064
		 */
		partnershipShare?: number;
		/**
		 * 065
		 */
		affiliateRaifr?: number;
		/**
		 * 067
		 */
		returnReducingLoss?: number;
		/**
		 * 068
		 */
		returnReducingCapitalLoss?: number;
		/**
		 * 069
		 */
		returnReducingPartnershipShare?: number;
		/**
		 * 070
		 */
		shelteredByForeignTaxRelief?: number;
		/**
		 * 071
		 */
		exemptFromPartITax?: number;
	};
};
export type SbdValues = {
	activeBusinessIncome?: number;
	businessLimit?: number;
	taxableCapital?: number;
	/**
	 * Adjusted aggregate investment income, PRIOR year (Schedule 7 Part 2, line 745) — the SBD passive-income grind only.
	 */
	aaii?: number;
	/**
	 * Aggregate investment income, CURRENT year (Schedule 7 Part 1, line 092 / jacket line 440) — feeds Part IV/RDTOH, not the grind. Defaults to `aaii` when omitted.
	 */
	aggregateInvestmentIncome?: number;
	/**
	 * Schedule 7 Part 1 detail — when entered and `aggregateInvestmentIncome` is left blank, AII is derived from these instead of typed in directly.
	 */
	aiiDetail?: {
		/**
		 * 002
		 */
		taxableCapitalGains?: number;
		/**
		 * 012
		 */
		allowableCapitalLosses?: number;
		/**
		 * 022 — T2 jacket line 332
		 */
		netCapitalLossesClaimed?: number;
		/**
		 * 032
		 */
		incomeFromProperty?: number;
		/**
		 * 042
		 */
		exemptIncome?: number;
		/**
		 * 052
		 */
		agriInvestFundReceived?: number;
		/**
		 * 062
		 */
		taxableDividendsDeductible?: number;
		/**
		 * 072
		 */
		trustPropertyIncome?: number;
		/**
		 * 082
		 */
		lossesFromProperty?: number;
	};
	/**
	 * Schedule 7 Part 2 detail — when entered and `aaii` is left blank, AAII is derived from these instead of typed in directly.
	 */
	aaiiDetail?: {
		/**
		 * 705 — excludes active-asset dispositions
		 */
		taxableCapitalGains?: number;
		/**
		 * 710 — excludes active-asset dispositions
		 */
		allowableCapitalLosses?: number;
		/**
		 * 715
		 */
		incomeFromProperty?: number;
		/**
		 * 720
		 */
		exemptIncome?: number;
		/**
		 * 725
		 */
		agriInvestFundReceived?: number;
		/**
		 * 730
		 */
		dividendsFromConnectedCorporations?: number;
		/**
		 * 735
		 */
		trustPropertyIncome?: number;
		/**
		 * 740
		 */
		lossesFromProperty?: number;
		/**
		 * 741 — FAPI, s.91(4)
		 */
		subsection91_4Deduction?: number;
	};
	/**
	 * Zero-emission technology manufacturing income — reduced rate (Schedule 27).
	 */
	zetmIncome?: number;
	/**
	 * Other associated CCPCs sharing the $500k limit (Schedule 23).
	 */
	associated?: {
		name?: string;
		allocatedLimit?: number;
	}[];
};
export type CcaValues = {
	classes?: CcaClass[];
	/**
	 * NEW class 13 leasehold-interest layers added this tax year (the full Schedule III mechanic).
	 */
	class13Layers?: Class13LeaseholdLayer[];
	/**
	 * Class 13 undepreciated capital cost before this year’s deduction.
	 */
	class13OpeningUCC?: number;
	/**
	 * Class 13 amount to claim; blank = the maximum.
	 */
	class13Claim?: number;
	/**
	 * NEW class 14 limited-life intangible properties added this tax year.
	 */
	class14Properties?: Class14LimitedLifeProperty[];
	/**
	 * Class 14 undepreciated capital cost before this year’s deduction.
	 */
	class14OpeningUCC?: number;
	/**
	 * Class 14 amount to claim; blank = the maximum.
	 */
	class14Claim?: number;
};
export type CcaClass = {
	ccaClass?: string;
	openingUCC?: number;
	additions?: number;
	dispositions?: number;
	immediateExpensing?: number;
	aiip?: boolean;
	classEmptied?: boolean;
	/**
	 * Amount to claim; blank = the maximum. An explicit 0 claims nothing.
	 */
	claim?: number;
	/**
	 * AT1 Schedule 13 — the Alberta figures for this class, when they diverge from federal. Both are OVERRIDES: blank takes the federal figure, so a class that matches federally needs nothing here. An explicit `0` is a real answer (claim nothing for Alberta), not an absent one.
	 *
	 * Alberta permits a different discretionary CCA claim from federal — a corporation may claim a class federally and not provincially, or the reverse. Filing these requires jacket line 000060 or 000061 to be "yes"; TRA forbids Schedule 13 outright when the return declares no divergence.
	 *
	 * 013003 — Alberta opening UCC, when it differs from federal.
	 */
	albertaOpeningUCC?: number;
	/**
	 * 013019 — the Alberta discretionary claim. Blank = the same as federal.
	 */
	albertaClaim?: number;
};
export type Class13LeaseholdLayer = {
	description?: string;
	capitalCost?: number;
	/**
	 * The date the lease is deemed to terminate. The engine derives the Schedule III period count from this and the tax year start — the number of 12-month periods is computed, not typed in.
	 */
	leaseEnd?: string;
	/**
	 * Where the lease grants renewal rights, the end of the term NEXT SUCCEEDING the one this cost was incurred in (Schedule III s.3(b)) — the first renewal only. When entered, this replaces leaseEnd for the period calculation.
	 */
	firstRenewalEnd?: string;
	/**
	 * This is the layer’s first tax year — triggers the Reg 1100(2) UCC-ceiling reduction.
	 */
	isFirstYear?: boolean;
	/**
	 * Accelerated investment incentive property — exempt from the 1100(2) reduction.
	 */
	aiip?: boolean;
	/**
	 * CCA already claimed on this layer in prior years.
	 */
	claimedToDate?: number;
	/**
	 * Disposition proceeds attributed to this layer.
	 */
	proceeds?: number;
};
export type Class14LimitedLifeProperty = {
	description?: string;
	capitalCost?: number;
	/**
	 * Days of life the property had REMAINING when the capital cost was incurred — not its total life, and not the days left today (Reg 1100(1)(c) fixes the denominator at acquisition).
	 */
	lifeDaysAtAcquisition?: number;
};
export type CreditsValues = {
	/**
	 * Qualified SR&ED expenditures for the year (Schedule 31 ITC base).
	 */
	sredQualifiedExpenditures?: number;
	/**
	 * Non-refundable ITC pool carried forward — auto-filled from last year.
	 */
	openingItcPool?: number;
};
export type ForeignValues = {
	foreignNonBusinessIncome?: number;
	foreignNonBusinessTaxPaid?: number;
	foreignBusinessIncome?: number;
	foreignBusinessTaxPaid?: number;
	/**
	 * Unused business FTC carried forward — auto-filled from last year.
	 */
	openingBusinessFtcPool?: number;
};
export type ProvincialAllocationValues = {
	establishments?: PermanentEstablishmentValues[];
};
export type PermanentEstablishmentValues = {
	province?: string;
	grossRevenue?: number;
	salariesWages?: number;
};
export type PaymentsValues = {
	/**
	 * Tax paid by instalments during the year (line 840) — drives balance owing/refund.
	 */
	instalmentsPaid?: number;
};
export type ShareholdersValues = {
	list?: Shareholder[];
};
export type Shareholder = {
	name?: string;
	bnOrSin?: string;
	percentCommon?: number;
	percentPreferred?: number;
};
export type InternetBusinessValues = {
	hasInternetBusiness?: boolean;
	webPageCount?: number;
	/**
	 * CRA reports the top five by gross revenue; extras are dropped on compute.
	 */
	urls?: {
		url?: string;
	}[];
	percentOfGrossRevenue?: number;
};
export type FirstReturnValues = {
	isFirstReturn?: boolean;
	event?: "incorporation" | "amalgamation" | "windUpOfSubsidiary";
	eventDate?: string;
	/**
	 * Comma-separated in the form; split at the engine boundary.
	 */
	predecessorBusinessNumbers?: string;
	openingAssets?: number;
	openingLiabilities?: number;
	openingEquity?: number;
};
export type ReservesValues = {
	rows?: ReserveRow[];
};
export type ReserveRow = {
	type?: ReserveType;
	/**
	 * Balance at the beginning of the year (reversed into income).
	 */
	opening?: number;
	/**
	 * Transfer on an amalgamation / wind-up of a subsidiary.
	 */
	transfer?: number;
	/**
	 * Balance at the end of the year (deducted this year).
	 */
	closing?: number;
	/**
	 * AT1 Schedule 17 — the Alberta figures for this reserve, when they diverge from federal. All three are OVERRIDES: blank takes the federal figure, so a reserve that matches federally needs nothing here. An explicit `0` is a real answer, not an absent one. For `insurancePolicyReserves` / `bankReserves` — Alberta-only kinds with no federal Part 2 equivalent — federal always reads as 0, so these three fields are effectively the only source of the figure.
	 */
	albertaOpening?: number;
	albertaTransfer?: number;
	albertaClosing?: number;
};
export type CapitalValues = {
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
	deferredTaxDebit?: number;
	deficitInEquity?: number;
	patronageDeducted?: number;
	deferredForexLosses?: number;
	sharesOfOtherCorporations?: number;
	loansToOtherCorporations?: number;
	bondsOfOtherCorporations?: number;
	longTermDebtOfFinancialInstitution?: number;
	dividendsReceivable?: number;
	partnershipObligations?: number;
	partnershipInterestAsset?: number;
	taxableIncomeEarnedInCanada?: number;
};
export type QuebecValues = {
	/**
	 * The corporation meets Québec's small-business deduction eligibility (the ≥5,500 paid-hours test, or the primary/manufacturing exemption). Fail-closed: the Québec SBD rate applies only when this is explicitly true AND the corporation is a CCPC.
	 */
	sbdEligibleQC?: boolean;
	/**
	 * Québec business limit — blank = $500,000 (share the limit for an associated group).
	 */
	businessLimit?: number;
};
export type AlbertaValues = {
	/**
	 * 000047 — gross revenue per the financial statements.
	 */
	grossRevenue?: number;
	/**
	 * 000048 — total assets. Must equal federal GIFI 2599.
	 */
	totalAssets?: number;
	/**
	 * 000001 — associated with one or more Canadian-controlled private corporations? Not derived from Schedule 1's own association test: that derivation is undefined whenever the corporation is not claiming the Alberta SBD, but this jacket line is unconditionally mandatory.
	 */
	associatedWithCcpcs?: YesNo;
	/**
	 * 000031 — wind-up of a subsidiary under ITA s.88 during the year?
	 */
	windUpOfSubsidiary?: YesNo;
	/**
	 * 000032 — first year of filing after an amalgamation?
	 */
	firstYearAfterAmalgamation?: YesNo;
	/**
	 * 000038 — tax year end changed since the last return?
	 */
	taxYearEndChanged?: YesNo;
	/**
	 * 000050 — final return?
	 */
	finalReturn?: YesNo;
	/**
	 * 000054 — transfer of property under ITA 85(1), 85(2) or 97(2)?
	 */
	transferOfProperty?: YesNo;
	/**
	 * 000060 — reporting different taxable income for Alberta than federally? TRA FORBIDS Schedule 13 when this and 000061 are both "No".
	 */
	reportsDifferentAlbertaIncome?: YesNo;
	/**
	 * 000061 — elected different discretionary amounts, or opening balances differ?
	 */
	electsDifferentDiscretionaryAmounts?: YesNo;
	/**
	 * 000095 — was the return prepared by a tax preparer for a fee?
	 */
	preparedByTaxPreparerForFee?: YesNo;
};
export type AlbertaSbdValues = {
	/**
	 * Eligibility gate — only a CCPC, or an Alberta co-op/credit union, may claim the SBD.
	 */
	corporationStatus?: "ccpc" | "albertaCoopOrCreditUnion" | "section149Exempt" | "other";
	/**
	 * CCPC status must hold THROUGHOUT the year; a mid-year change bars the claim.
	 */
	wasCcpcThroughoutYear?: YesNo;
	/**
	 * 001005 / 001011 — Alberta Royalty Tax Deduction (Schedule 5), oil & gas only.
	 */
	royaltyTaxDeduction?: number;
	/**
	 * Area A (041/043/045) — filed only when associated with one or more CCPCs (line 001).
	 */
	associatedCorpAgreement?: AlbertaAssociatedCorpMember[];
};
export type AlbertaAssociatedCorpMember = {
	/**
	 * 041 — put the corporation filing this return FIRST.
	 */
	name?: string;
	/**
	 * 043 — Alberta CAN. Must match the same corp’s fed 023100 (federal Schedule 23).
	 */
	albertaCan?: string;
	/**
	 * 045 — this member’s allocated share of the base amount, same percentage split as federal.
	 */
	allocatedAmount?: number;
};
export type AlbertaDonationsValues = {
	/**
	 * 020004 — charitable gifts expired this year. No federal equivalent.
	 */
	charitableExpired?: number;
	/**
	 * 020008 — charitable gifts transferred in on amalgamation or wind-up.
	 */
	charitableTransferredIn?: number;
	/**
	 * 020013 — adjustment for an acquisition of control.
	 */
	charitableAcquisitionOfControlAdjustment?: number;
	/**
	 * 020016 — amount applied against Alberta taxable income. Blank = claim the maximum.
	 */
	charitableApplied?: number;
	/**
	 * 020062 — gifts pool opening balance. Cannot be derived — this is the first AT1 filing with real schedules for many corporations.
	 */
	giftsOpening?: number;
	/**
	 * 020064 — gifts expired this year.
	 */
	giftsExpired?: number;
	/**
	 * 020068 — gifts transferred in on amalgamation or wind-up.
	 */
	giftsTransferredIn?: number;
	/**
	 * 020070 — total current-year gifts. Blank = federal cultural + ecological gifts, this year’s total.
	 */
	giftsCurrentYear?: number;
	/**
	 * 020073 — adjustment for an acquisition of control.
	 */
	giftsAcquisitionOfControlAdjustment?: number;
	/**
	 * 020076 — amount applied against Alberta taxable income. Blank = claim the maximum.
	 */
	giftsApplied?: number;
	/**
	 * 020032 — taxable capital gains arising on gifts of capital property.
	 */
	taxableCapitalGainsOnGifts?: number;
	/**
	 * 020034 — taxable capital gain on deemed gifts of non-qualifying securities.
	 */
	deemedGiftGains?: number;
	/**
	 * 020036 — recapture of capital cost allowance on charitable gifts.
	 */
	recaptureOnGifts?: number;
	/**
	 * 020038 — proceeds of disposition less outlays and expenses, on the gifted property.
	 */
	proceedsNetOfOutlays?: number;
	/**
	 * 020040 — the capital cost of the gifted property.
	 */
	capitalCost?: number;
	/**
	 * 020090-100 — carryforward available, broken out by category. Charitable (092) and the gifts pool (062-078) are each ONE combined continuity on this schedule; these four report how much of the gifts pool’s closing balance belongs to each of the three federal source categories, plus the medicine-gift deduction (ITA s.110.1(1)(a.1)), which nothing else models. Filed only when 090 (year of origin) is present — leave all five blank to omit the whole block. Charitable (092) defaults to the charitable pool’s own closing balance when 090 is present but 092 is left blank; the other four have no default at all, since the engine tracks them as one combined figure.
	 */
	carryforwardYearOfOrigin?: string;
	/**
	 * 020092 — blank = the charitable pool’s own closing balance.
	 */
	carryforwardCharitable?: number;
	/**
	 * 020094 — gifts to Canada, a province or territory. No default.
	 */
	carryforwardToCanadaOrProvince?: number;
	/**
	 * 020096 — certified cultural property. No default.
	 */
	carryforwardCulturalProperty?: number;
	/**
	 * 020098 — ecologically sensitive land. No default.
	 */
	carryforwardEcologicalLand?: number;
	/**
	 * 020100 — additional deduction for gifts of medicine. No default.
	 */
	carryforwardMedicine?: number;
};
export type AlbertaContinuityValues = {
	nonCapitalOpening?: number;
	capitalOpening?: number;
	farmOpening?: number;
	/**
	 * Blank = same as federal. Unlike non-capital (whose current-year loss is derived automatically from Schedule 12’s Alberta reconciliation), no federal input in this engine breaks losses down by farm/non-farm activity, so a genuine Alberta-federal divergence here can only be stated directly.
	 */
	farmCurrentYearLoss?: number;
	restrictedFarmOpening?: number;
	/**
	 * Blank = same as federal — see `farmCurrentYearLoss`.
	 */
	restrictedFarmCurrentYearLoss?: number;
	/**
	 * Listed personal property — no federal equivalent; the whole pool is Alberta-only.
	 */
	lppOpening?: number;
	lppCurrentYearLoss?: number;
	lppApplied?: number;
	lppExpired?: number;
	lppOtherAdjustments?: number;
	/**
	 * The sixth section of the live form — one row per partnership, not per jurisdiction.
	 */
	limitedPartnerships?: LimitedPartnershipLossRow[];
	/**
	 * The NINTH section (page 5) — Continuity of Restricted Interest and Financing Expenses.
	 */
	rife?: RifeContinuityValues;
	/**
	 * The SEVENTH section — non-capital losses by year of origin. Row 0 (the current year) is fully derived server-side (must equal the schedule’s own current-year loss and total carried-back) — only PRIOR vintages (1-20 years ago) are entered here; that history cannot be derived.
	 */
	nonCapitalVintages?: NonCapitalLossVintageRow[];
	/**
	 * The EIGHTH section — farm/restricted-farm/LPP by year of origin, one row per vintage (0-20).
	 */
	otherLossVintages?: OtherLossVintageRow[];
	/**
	 * Net-capital loss carry-back request (AT1 Schedule 10’s capital column, lines 042-048) — Alberta-only. Federal has no equivalent request (the engine has no federal net-capital-carryback input at all), so unlike the non-capital carry-back this cannot default from federal and must be entered here even when the amounts happen to match federal’s own current-year net-capital loss.
	 */
	capitalCarrybacks?: {
		taxYearEnd?: string;
		amount?: number;
	}[];
	/**
	 * Farm loss carry-back request (AT1 Schedule 10’s farm column, lines 012-020) — Alberta-only, same reasoning as `capitalCarrybacks`: federal has no farm loss carry-back input of its own to default from.
	 */
	farmCarrybacks?: {
		taxYearEnd?: string;
		amount?: number;
	}[];
	/**
	 * The printed Schedule 10 has ONE shared "Other Losses" column for restricted farm and listed personal property loss — but, per TRA’s own Chapter 3 spec (not just the printed PDF), the two checkboxes are NOT mutually exclusive: check either or both. When both are checked, the shared column’s current-year-loss is the SUM of both pools’.
	 */
	otherLossIncludesRestrictedFarm?: YesNo;
	/**
	 * An explicitly answered yes/no. Absent means UNANSWERED, which is not "No" — TRA encodes No as the value `2`, a positive answer the corporation gives, so a switch (off until touched) would answer every question "No" on its behalf. These render as radios with no preselection for exactly that reason.
	 */
	otherLossIncludesListedPersonal?: YesNo;
	/**
	 * The carry-back request for whichever of the two loss types above is checked (combined, if both).
	 */
	otherLossCarrybacks?: {
		taxYearEnd?: string;
		amount?: number;
	}[];
	nonCapitalApplied?: number;
	nonCapitalExpired?: number;
	nonCapitalWindUpTransfer?: number;
	nonCapitalSection80Adjustment?: number;
	nonCapitalOtherAdjustments?: number;
	capitalApplied?: number;
	capitalExpired?: number;
	capitalWindUpTransfer?: number;
	capitalSection80Adjustment?: number;
	capitalOtherAdjustments?: number;
	farmApplied?: number;
	farmExpired?: number;
	farmWindUpTransfer?: number;
	farmSection80Adjustment?: number;
	farmOtherAdjustments?: number;
	restrictedFarmApplied?: number;
	restrictedFarmExpired?: number;
	restrictedFarmWindUpTransfer?: number;
	restrictedFarmSection80Adjustment?: number;
	restrictedFarmOtherAdjustments?: number;
};
export type LimitedPartnershipLossRow = {
	identifier?: string;
	precedingYearBalance?: number;
	transferredOnWindUp?: number;
	currentYearLoss?: number;
	/**
	 * Capped at precedingYearBalance + transferredOnWindUp; blank = nothing applied.
	 */
	applied?: number;
};
export type RifeContinuityValues = {
	/**
	 * 200 — RIFE at the end of the previous tax year.
	 */
	openingBalance?: number;
	/**
	 * 210 — transferred on an amalgamation or wind-up.
	 */
	transferredOnWindUp?: number;
	/**
	 * 220 — deduct: adjustment for an acquisition of control.
	 */
	acquisitionOfControlAdjustment?: number;
	/**
	 * 230 — current-year RIFE under ITA s.111(8) (T2 Schedule 4 line 710).
	 */
	currentYearRife?: number;
	/**
	 * 320 — corporation's excess capacity for the year (T2 Schedule 130 line 129).
	 */
	excessCapacity?: number;
	/**
	 * 330 — total received capacity for the year (T2 Schedule 130 line 130).
	 */
	receivedCapacity?: number;
	/**
	 * 240 — RIFE deducted for the tax year. Must not exceed line 350; blank = claim the maximum available.
	 */
	deductedClaim?: number;
};
export type NonCapitalLossVintageRow = {
	/**
	 * 1 = the immediately preceding taxation year, up to 20 (the expiry limit).
	 */
	yearsAgo?: number;
	taxYearEnd?: string;
	balanceAtBeginning?: number;
	/**
	 * Signed — an addition or a reduction to this vintage.
	 */
	adjustments?: number;
	/**
	 * Applied to reduce taxable income this year, from THIS vintage specifically.
	 */
	applied?: number;
};
export type OtherLossVintageRow = {
	yearIndex?: number;
	farmLosses?: number;
	restrictedFarmLosses?: number;
	/**
	 * Refused (zeroed) beyond yearIndex 7 — listed personal property expires after 7 years, not 20.
	 */
	listedPersonalPropertyLosses?: number;
};
export type AlbertaIegValues = {
	/**
	 * Line 003 — federal amount of qualified/current SR&ED expenditures. Federal T661 line 559 for a taxation year ending on or before 2024-12-15; T661 line 557 (a DIFFERENT federal figure) for a taxation year ending on or after 2024-12-16.
	 */
	federalAmount?: number;
	/**
	 * Line 005 — portion of the federal amount carried out in Alberta. Leave blank when `projects` below has at least one row — it defaults to the AT4970 attachment’s own total. Set it here only to override that default, or when there are no projects to list individually.
	 */
	albertaPortion?: number;
	/**
	 * Line 007 — deduct: federal prescribed proxy amount. Defaults from `projects`’ total when omitted.
	 */
	federalProxyAmount?: number;
	/**
	 * Line 009 — add: Alberta proxy amount. Defaults from `projects`’ total when omitted.
	 */
	albertaProxyAmount?: number;
	/**
	 * Line 011 — add: IEG that reduced the federal expenditure IN THE TAXATION YEAR. Leave blank for a first-time current-year claim reported on the pre-deduction federal figures — the ordinary case.
	 */
	iegReducingFederalExpenditure?: number;
	/**
	 * Line 025 — add: the Alberta portion of a repayment of government assistance (other than an IEG) or a contract payment, relating to amounts in `albertaPortion` from the current year or any preceding taxation year.
	 */
	repaymentOrContractPayment?: number;
	/**
	 * Line 040 — primary field of science or technology.
	 */
	primaryFieldCode?: "1" | "2" | "3" | "4";
	/**
	 * AT4970 — one row per Alberta SR&ED project. The TOTAL row across every project feeds `albertaPortion` / `federalProxyAmount` / `albertaProxyAmount` above automatically.
	 */
	projects?: IegProjectRow[];
	/**
	 * AT4970’s jurisdiction-breakdown table — informational, entered directly.
	 */
	jurisdictions?: IegJurisdictionAmount[];
	/**
	 * Every member of the associated group, INCLUDING this corporation. Pass a single-member list even when there is no association — an empty list fails closed (no grant claimed) rather than assuming no grind and no base, which would overstate the grant on absent data.
	 */
	group?: IegGroupMember[];
	/**
	 * This corporation’s agreed share of the group’s expenditure limit. Omit to take the whole limit.
	 */
	allocatedLimit?: number;
	/**
	 * Recapture where IEG-funded property was sold or converted to commercial use in the year.
	 */
	recapture?: number;
	/**
	 * Formal Agreement Among Associated Corporations (Schedule 29 page 3) — CAN of the member with the longest taxation year (line 200). Leave `agreementMembers` empty when the group has not filed one: the grant then uses the non-associated formula (line 112).
	 */
	agreementLongestYearCan?: string;
	/**
	 * That member’s own tax year begin, ISO YYYY-MM-DD (line 202).
	 */
	agreementLongestYearBegin?: string;
	/**
	 * That member’s own tax year end, ISO YYYY-MM-DD (line 204).
	 */
	agreementLongestYearEnd?: string;
	/**
	 * Days in that longest year — up to 366 (line 206). Leave blank for a full (365-day) year.
	 */
	agreementDaysInLongestYear?: number;
	/**
	 * The Agreement’s member table. Put the claiming corporation FIRST — its own allocated allowed amount (line 268) becomes line 325, which is what actually switches the grant to the associated formula.
	 */
	agreementMembers?: IegAgreementMember[];
};
export type IegProjectRow = {
	/**
	 * Line 101 — same information as line 200 from Part 2 of federal T661.
	 */
	title?: string;
	/**
	 * Line 103 — project code (federal T661 line 206).
	 */
	projectCode?: string;
	/**
	 * Line 105 — portion of the federal figure incurred in Alberta, this project, before IEG.
	 */
	albertaPortion?: number;
	/**
	 * Line 107 — portion NOT carried out in Alberta, this project.
	 */
	otherPortion?: number;
	/**
	 * Line 109 — salaries and wages re SR&ED carried out in Alberta, this project.
	 */
	salariesAndWages?: number;
	/**
	 * Line 111 — federal prescribed proxy amount included in the Alberta portion, if claimed federally.
	 */
	federalProxyAmount?: number;
	/**
	 * Line 113 — Alberta proxy amount for this project, if line 111 applies.
	 */
	albertaProxyAmount?: number;
};
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
export type IegGroupMember = {
	name?: string;
	/**
	 * Taxable capital employed in Canada, this member’s last taxation year ending in the prior calendar year.
	 */
	taxableCapital?: number;
	/**
	 * Eligible Alberta SR&ED expenditures, first preceding taxation year.
	 */
	priorYear1?: number;
	/**
	 * Eligible Alberta SR&ED expenditures, second preceding taxation year.
	 */
	priorYear2?: number;
};
export type IegAgreementMember = {
	name?: string;
	/**
	 * Alberta Corporate Account Number.
	 */
	albertaCan?: string;
	/**
	 * This member’s own current taxation year end, ISO YYYY-MM-DD.
	 */
	currentTaxationYearEnd?: string;
	/**
	 * This member’s own agreed share of the expenditure limit (line 240).
	 */
	allocatedExpenditureLimit?: number;
	/**
	 * This member’s own current-year eligible Alberta expenditures (line 245).
	 */
	currentYearExpenditures?: number;
	/**
	 * This member’s own first-preceding-year Alberta expenditures (line 250).
	 */
	priorYear1?: number;
	/**
	 * This member’s own second-preceding-year Alberta expenditures (line 260).
	 */
	priorYear2?: number;
	/**
	 * This member’s own taxable capital for the first preceding year (line 265).
	 */
	taxableCapitalPriorYear?: number;
	/**
	 * Days in THIS member’s own current taxation year. Leave blank for a full (365-day) year.
	 */
	daysInTaxYear?: number;
	/**
	 * Whether this member has a permanent establishment in Alberta. A member without one is not eligible for the IEG at all — line 268 is nil even when this member’s own figures would otherwise allow an amount — though its figures still count toward the group’s totals. Leave blank for a member other than yourself only when genuinely unknown; the return treats a blank answer as "no PE" (the direction that understates the grant, not overstates it) and flags it rather than assuming.
	 */
	hasAlbertaPermanentEstablishment?: YesNo;
};
export type AlbertaOtherCredits3Values = {
	/**
	 * AT1 page 2, line 068 — Alberta tax payable before this deduction.
	 */
	taxPayableBeforeDeduction?: number;
	/**
	 * AT1 page 2, line 070.
	 */
	line070?: number;
	/**
	 * AT1 page 2, line 071.
	 */
	line071?: number;
	/**
	 * AT1 page 2, line 072.
	 */
	line072?: number;
	/**
	 * AT1 page 2, line 074.
	 */
	line074?: number;
	/**
	 * 003100 — total shown on all Investor Tax Credit certificates issued during the year.
	 */
	itcCertificatesIssued?: number;
	/**
	 * 003102 — total Investor Tax Credit carried forward from prior year(s).
	 */
	itcCarryforwardFromPriorYear?: number;
	/**
	 * 003106 — total Investor Tax Credit expired during the year.
	 */
	itcExpired?: number;
	/**
	 * 003104 — amount applied to the current taxation year. Blank = claim the maximum both the pool and the shared room allow.
	 */
	itcAmountApplied?: number;
	/**
	 * 003200 — total shown on all Capital Investment Tax Credit certificates issued during the year.
	 */
	citcCertificatesIssued?: number;
	/**
	 * 003202 — total Capital Investment Tax Credit carried forward from prior year(s).
	 */
	citcCarryforwardFromPriorYear?: number;
	/**
	 * 003206 — total Capital Investment Tax Credit expired during the year.
	 */
	citcExpired?: number;
	/**
	 * 003204 — amount applied to the current taxation year. Forced to nil while the Investor Tax Credit above still carries an unused carryforward balance — CITC cannot be claimed until ITC is fully drawn down.
	 */
	citcAmountApplied?: number;
	/**
	 * 003334 occurrence 0 / 003300 — total on Agri-Processing Investment Tax Credit certificates issued this year.
	 */
	apitcCurrentReceived?: number;
	/**
	 * 003336 occurrence 0 / 003304 — applied from the current year’s receipt. Capped at 20%.
	 */
	apitcCurrentApplied?: number;
	/**
	 * 003335 occurrence 1 — 1st preceding year’s balance available at the start of this year.
	 */
	apitcFirstAvailable?: number;
	/**
	 * 003336 occurrence 1 / 003306 — applied from the 1st preceding year. Capped at 30%.
	 */
	apitcFirstApplied?: number;
	/**
	 * 003335 occurrence 2 — 2nd preceding year’s balance available at the start of this year.
	 */
	apitcSecondAvailable?: number;
	/**
	 * 003336 occurrence 2 / 003308 — applied from the 2nd preceding year. Capped at 50%.
	 */
	apitcSecondApplied?: number;
	/**
	 * Sum of 003335 across occurrences 3-10 — the 3rd-10th preceding years, combined.
	 */
	apitcThirdToTenthAvailable?: number;
	/**
	 * 003310 — applied from the 3rd-10th preceding years, combined. No percentage cap.
	 */
	apitcThirdToTenthApplied?: number;
	/**
	 * 003314 — total Agri-Processing Investment Tax Credit expired during the year (= 003338 occurrence 10).
	 */
	apitcExpired?: number;
};
export type AlbertaForeignInvestment4Values = {
	/**
	 * One FIC occurrence per country, in the same order as the federal form.
	 */
	countries?: ForeignInvestmentCountry4Row[];
};
export type ForeignInvestmentCountry4Row = {
	/**
	 * 004002 — two-character country code. Must equal the matching occurrence of federal Schedule 21.
	 */
	country?: string;
	/**
	 * 004004 — net foreign investment income. Must equal federal Schedule 21’s matching occurrence.
	 */
	netForeignInvestmentIncome?: number;
	/**
	 * Federal Schedule 21, line 120 — foreign investment income tax paid, gross (before any 20(12)/8(2.2) deduction). NOT itself an AT1 line: the engine nets this against the deduction below to compute AT1 line 006.
	 */
	fedForeignTaxPaid?: number;
	/**
	 * Federal Schedule 21, line 130 — the ITA subsection 20(12) deduction claimed federally for this occurrence. NOT itself an AT1 line — see `fedForeignTaxPaid`.
	 */
	fedIta2012Deduction?: number;
	/**
	 * The Alberta ACTA 8(2.2) deduction, ONLY where it was computed differently than the federal ITA 20(12) figure above. Leave blank when the two agree. NOT itself an AT1 line.
	 */
	albertaActa82Deduction?: number;
	/**
	 * 004008 — federal non-business foreign tax credit. Must equal federal Schedule 21’s matching occurrence.
	 */
	fedNonBusinessForeignTaxCredit?: number;
};
export type AlbertaRoyaltyDeduction5Values = {
	/**
	 * 005001 — Crown charges under s.20(6)(a)-(e). AT1 Schedule 7, line 061 — a separate schedule wired under its own key; enter its finished figure here. Floored at zero by the engine if entered negative.
	 */
	crownChargesFromSchedule7?: number;
	/**
	 * 005005 — resource allowance claimed under s.20(6)(g). AT1 Schedule 12, line 024, or federal Schedule 1, line 346 when Schedule 12 does not apply.
	 */
	resourceAllowanceFromSchedule12OrFederal?: number;
	/**
	 * 005007 — reimbursements received under a contract in respect of Crown charges, under s.20(6)(f). Excludes ARTC and other government rebates or credits.
	 */
	reimbursementsForCrownCharges?: number;
	/**
	 * 005043 — corporation’s own unsuccessored pool carried forward from the preceding year (normally last year’s line 017).
	 */
	openingUnsuccessoredPoolBalance?: number;
	/**
	 * 005031-005037 — predecessor transfers into the unsuccessored pool (amalgamation under s.20(10), or wind-up of a wholly-owned subsidiary under s.20(11)).
	 */
	predecessorTransfers?: PredecessorTransferRow[];
	/**
	 * 005016 — the CRTD claim actually made against the unsuccessored pool. Blank = claim the maximum the pool and Alberta taxable income both allow.
	 */
	crtdAmountClaimed?: number;
	/**
	 * 005023 — Attributed Royalty Income transferred to another corporation during the year on disposal of substantially all Canadian resource properties.
	 */
	transferredOnDisposal?: number;
	/**
	 * 005200 — does the corporation have any successored pools to report?
	 */
	hasSuccessoredPools?: "yes" | "no";
	/**
	 * SSPI, 005101-005115 — second successored pool occurrences, oldest date of event first. Only used when `hasSuccessoredPools` is "yes".
	 */
	secondSuccessoredPools?: SuccessoredPoolRow[];
	/**
	 * FSPI, 005121-005135 — first successored pool occurrences, oldest date of event first. Only used when `hasSuccessoredPools` is "yes".
	 */
	firstSuccessoredPools?: SuccessoredPoolRow[];
	/**
	 * 005026/005027 — whether the resource pools were transferred during the year.
	 */
	poolTransfer?: {
		/**
		 * 005026 — 1: disposition of all/substantially all CRP (s.20(8)); 2: change in control / ceasing s.20(14) exemption; 3: no transfer.
		 */
		type?: "1" | "2" | "3";
		/**
		 * 005027 — legal name of the acquiring corporation. Required when type is 1 or 2; leave blank when 3.
		 */
		acquirerName?: string;
	};
	/**
	 * 005100 — was there a change in control that created the immediately preceding taxation year end?
	 */
	changeInControlEndedPrecedingYear?: "yes" | "no";
	/**
	 * AT1 core line 062 — Alberta Taxable Income (Loss) before this deduction. Caps both line 016 and the combined line 064 total.
	 */
	albertaTaxableIncomeBeforeDeduction?: number;
};
export type PredecessorTransferRow = {
	predecessorName?: string;
	albertaCorporateAccountNumber?: string;
	dateOfEvent?: string;
	amountTransferred?: number;
};
export type SuccessoredPoolRow = {
	vendorName?: string;
	dateOfEvent?: string;
	/**
	 * Mutually exclusive with `acquisitionAmount` for the same occurrence.
	 */
	poolBroughtForward?: number;
	/**
	 * Mutually exclusive with `poolBroughtForward` for the same occurrence.
	 */
	acquisitionAmount?: number;
	propertyIncome?: number;
};
export type AlbertaRoyaltyCredit6Values = {
	/**
	 * 006002 — "yes" | "no", matching the AT1 jacket’s own YES_NO radio convention (default reads as No).
	 */
	associatedWithCrownRoyaltyCorporations?: "yes" | "no";
	/**
	 * 006004 — per the spec, `007003 + Σ007077 − Σ007087 + Σ007089` (every term lives on Schedule 7). True cross-schedule wiring is a follow-up; enter the figure here directly for now, matching what Schedule 7 computes.
	 */
	albertaCrownRoyaltyIncurred?: number;
	/**
	 * Days in THIS corporation’s own taxation year — used only when NOT associated. Blank = a full 365-day year.
	 */
	taxationYearDays?: number;
	/**
	 * ACRS (006022-006028) — required only when associated.
	 */
	longestAssociatedYearCan?: string;
	longestAssociatedYearBeginning?: string;
	longestAssociatedYearEnding?: string;
	/**
	 * Blank = a full 365-day year.
	 */
	longestAssociatedYearDays?: number;
	/**
	 * AACRS (006030-006034) — required only when associated. Sort so the FIRST row is this filing corporation.
	 */
	allocations?: RoyaltyCredit6ShelterAllocationRow[];
	/**
	 * 006008 — one row per calendar quarter the taxation year spans.
	 */
	quarters?: RoyaltyCredit6QuarterRow[];
};
export type RoyaltyCredit6ShelterAllocationRow = {
	name?: string;
	albertaCan?: string;
	allocatedAmount?: number;
};
export type RoyaltyCredit6QuarterRow = {
	days?: number;
	rate?: number;
};
export type AlbertaRoyaltySupplemental7Values = {
	/**
	 * 007003 — from the income statement (fed form 125).
	 */
	eligibleCrownRoyalty?: number;
	/**
	 * 007005.
	 */
	otherRoyaltiesNotEligible?: number;
	/**
	 * 007007.
	 */
	royaltyPaidToOtherJurisdictions?: number;
	/**
	 * 007009.
	 */
	nonDeductibleCrownLeaseRentals?: number;
	/**
	 * 007011.
	 */
	mineralTaxes?: number;
	/**
	 * 007013.
	 */
	saskatchewanResourcesSurcharge?: number;
	/**
	 * 007014 / 007015 / 007016 — up to three named "other" crown-charge types.
	 */
	otherNonDeductibleCrownChargeType1?: string;
	otherNonDeductibleCrownChargeType2?: string;
	otherNonDeductibleCrownChargeType3?: string;
	/**
	 * 007017 — total for the named type(s) above. Blank/zero when none are named.
	 */
	otherNonDeductibleCrownCharges?: number;
	/**
	 * 007025 — from the balance sheet (fed form 100).
	 */
	crownLeaseRentalsCapitalized?: number;
	/**
	 * 007027.
	 */
	otherBalanceSheetDeductionName?: string;
	/**
	 * 007029 — amount for the deduction named above. Blank/zero when no name is given.
	 */
	otherBalanceSheetDeduction?: number;
	partnerships?: RoyaltySupplemental7PartnershipRow[];
	priorYearAdjustments?: RoyaltySupplemental7PriorYearAdjustmentRow[];
};
export type RoyaltySupplemental7PartnershipRow = {
	name?: string;
	/**
	 * 007073 — decimal, e.g. .7500 for 75%, to 4 places.
	 */
	interestPercent?: number;
	fiscalPeriodEnd?: string;
	shareEligibleForCredit?: number;
	shareOtherRoyaltiesNotEligible?: number;
	/**
	 * 007081 — feeds Schedule 5’s own 005001 formula; collected here as disclosure, not consumed by this schedule.
	 */
	shareOtherCrownChargesEligibleForDeduction?: number;
};
export type RoyaltySupplemental7PriorYearAdjustmentRow = {
	priorProductionPeriodEnd?: string;
	/**
	 * 007085 — "1" | "2", matching SOURCE_OF_ADJUSTMENT_OPTIONS.
	 */
	sourceOfAdjustment?: "1" | "2";
	/**
	 * 007087 — positive magnitude of the increase.
	 */
	increase?: number;
	/**
	 * 007089 — positive magnitude of the decrease.
	 */
	decrease?: number;
	/**
	 * 007091 — signed.
	 */
	adjustmentNotEligibleForCredit?: number;
};
export type AlbertaPoliticalContributions8Values = {
	/**
	 * One PCD occurrence per receipted contribution.
	 */
	contributions?: PoliticalContribution8Row[];
	/**
	 * 008012 — Alberta political contributions from a partnership made in 2003 or earlier (federal T5013 box 37).
	 */
	partnershipContributionsTo2003?: number;
	/**
	 * 008013 — Alberta political contributions from a partnership made in 2004 or later (federal T5013).
	 */
	partnershipContributionsFrom2004?: number;
	/**
	 * This corporation’s OWN tax year begin/end dates. NOT an AT1 line — needed only to confirm the rare 2003/2004 straddling-tax-year credit formula applies. Leave both blank unless contributions were made in BOTH 2003-or-earlier and 2004-or-later AND this corporation’s own tax year began in 2003 and ended in 2004.
	 */
	taxYearBegin?: string;
	taxYearEnd?: string;
};
export type PoliticalContribution8Row = {
	/**
	 * 008002 — name of the party, constituency association or candidate.
	 */
	name?: string;
	/**
	 * 008004 — official receipt number.
	 */
	receiptNumber?: string;
	/**
	 * 008006 — date of the official receipt. The spec requires one for every receipted contribution.
	 */
	dateOfDonation?: string;
	/**
	 * 008008 — donation amount.
	 */
	amount?: number;
};
export type AlbertaSredCredit9Values = {
	/**
	 * Line 009003 — federal total qualified SR&ED expenditures. Must equal fed T661 line 559.
	 */
	federalQualifiedExpenditures?: number;
	/**
	 * Line 009005 — the portion of 003 incurred in Alberta, BEFORE 2020-01-01. Must not exceed 003.
	 */
	albertaPortionOfExpenditures?: number;
	/**
	 * Line 009007 — deduct: federal prescribed proxy amount included in the Alberta portion.
	 */
	federalProxyAmountInAlbertaPortion?: number;
	/**
	 * Line 009009 — add: Alberta proxy amount.
	 */
	albertaProxyAmount?: number;
	/**
	 * Line 009011 — add: Alberta SR&ED credit that reduced the federal expense on fed T661 line 559 in the taxation year. The spec defers this calculation to the Guide to Claiming the Alberta SR&ED Tax Credit.
	 */
	albertaCreditReducingFederalExpense?: number;
	/**
	 * Line 009015 — federal ITC received in the immediately preceding year (fed T661 line 435).
	 */
	priorYearFederalItcReceived?: number;
	/**
	 * Line 009017 — total Alberta-eligible expenditures for years in which incurred, all relevant years.
	 */
	totalAlbertaExpendituresAllYears?: number;
	/**
	 * Line 009019 — total federal expenditures for those same years (fed T661 line 570, all years).
	 */
	totalFederalExpendituresAllYears?: number;
	/**
	 * Line 009025 — add: Alberta portion of any repayment of assistance relating to line 005.
	 */
	albertaPortionOfRepayments?: number;
	/**
	 * Lines 009031 / 009106 — "Eligible expenditures for Alberta purposes." Leave blank to use the engine’s derived figure; set directly to override it with the authoritative amount.
	 */
	eligibleExpenditures?: number;
	/**
	 * Line 009040 — primary field of science or technology. Mandatory on the live form.
	 */
	fieldOfScience?: "1" | "2" | "3" | "4";
	/**
	 * Line 009100 — associated with one or more corporations for SR&ED purposes?
	 */
	isAssociated?: "yes" | "no";
	/**
	 * Line 009102 — this corporation’s allocated share of the maximum expenditure limit, used ONLY when `group` below is empty. When `group` has at least one row, the filing corporation’s (row 1) capped share is used instead and this field is ignored.
	 */
	allocatedExpenditureLimit?: number;
	/**
	 * Days in the corporation’s own taxation year, for the NON-associated line 009104 proration. Leave blank for a full, 365-day year. Days before 2009-01-01 (when the Alberta SR&ED program began) must already be excluded.
	 */
	daysInTaxYear?: number;
	/**
	 * Line 009112 — recapture on disposal (or deemed disposal) of Alberta SR&ED property.
	 */
	disposalRecapture?: number;
	/**
	 * Line 009116 — legacy adjustment from the Schedule 9 Supplemental line 428, applicable ONLY when the taxation year end is on or before 2012-03-31. Expected nil for a current return.
	 */
	priorYearFederalItcAdjustment?: number;
	/**
	 * The return’s taxation year end, ISO YYYY-MM-DD — used only to flag a reminder when it falls after the 2019-12-31 wind-down date. NOT itself an AT1 Schedule 9 line item.
	 */
	taxationYearEnd?: string;
	/**
	 * 200 — the Alberta CAN of the associated corporation with the longest taxation year. Used only when `group` has at least one row.
	 */
	longestYearCan?: string;
	/**
	 * 202 — that corporation’s own tax year begin.
	 */
	longestYearBegin?: string;
	/**
	 * 204 — that corporation’s own tax year end.
	 */
	longestYearEnd?: string;
	/**
	 * Days in the LONGEST associated taxation year (line 206), for the page-3 allocation’s shared $4,000,000 ceiling. Leave blank for a full, 365-day year. Used only when `group` has at least one row.
	 */
	daysInLongestYear?: number;
	/**
	 * The associated-group allocation table (page 3, lines 220/230/240). Include this corporation as the FIRST row — its own allocated amount becomes line 009102. Leave empty for a non-associated claim.
	 */
	group?: AlbertaSredCredit9GroupMember[];
};
export type AlbertaSredCredit9GroupMember = {
	/**
	 * Line 009220 — name of the associated corporation.
	 */
	name?: string;
	/**
	 * Line 009230 — Alberta Corporate Account Number.
	 */
	albertaCan?: string;
	/**
	 * Line 009240 — this member’s agreed share of the expenditure limit.
	 */
	allocated?: number;
};
export type AlbertaResourceDeductions15Values = {
	/**
	 * Days in the tax year — feeds every claim cap the spec prorates for a short year (CDE/CCOGPE/FEDE regular/SFEDE regular/CFRE). Blank = 365. The 000060/000061 divergence-gate flags are NOT collected here — they are jacket-level fields shared by every reconciliation-gated schedule (13/17/18/15), collected once on the AT1 jacket form and read from `ri.alberta` by the composer.
	 */
	daysInTaxYear?: number;
	/**
	 * EDA — Continuity of Earned Depletion Base (line 001-021, grandfathered).
	 */
	edaRegular?: EdaRegularRow;
	edaSuccessor?: EdaSuccessorRow;
	/**
	 * CMEDB — Continuity of Mining Exploration Depletion Base (line 023-033). No successor side.
	 */
	cmedb?: CmedbRow;
	/**
	 * CEE — Cumulative Canadian Exploration Expenses (line 041-083).
	 */
	ceeRegular?: CeeRegularRow;
	ceeSuccessor?: CeeSuccessorRow;
	/**
	 * CDE — Cumulative Canadian Development Expenses (line 091-143).
	 */
	cdeRegular?: CdeRegularRow;
	cdeSuccessor?: CdeSuccessorRow;
	/**
	 * CCOGPE — Cumulative Canadian Oil and Gas Property Expenses (line 151-191).
	 */
	ccogpeRegular?: CcogpeRegularRow;
	ccogpeSuccessor?: CcogpeSuccessorRow;
	/**
	 * FEDE — Foreign Exploration and Development Expenses (line 201-233).
	 */
	fedeRegular?: FedeRegularRow;
	fedeSuccessor?: FedeSuccessorRow;
	/**
	 * SFEDE — Specified Foreign Exploration and Development Expenses, PER COUNTRY (line 241-277).
	 */
	sfedeRegular?: SfedeCountryRegularRow[];
	sfedeSuccessor?: SfedeCountrySuccessorRow[];
	/**
	 * CFRE — Cumulative Foreign Resource Expenses, PER COUNTRY (line 281-317).
	 */
	cfreRegular?: CfreCountryRegularRow[];
	cfreSuccessor?: CfreCountrySuccessorRow[];
};
export type EdaRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalSaleTransfer?: number;
	albertaSaleTransfer?: number;
	/**
	 * 015007 — the claim itself, reconciled the same way as every other EDA figure.
	 */
	federalRegulation1201Claim?: number;
	albertaRegulation1201Claim?: number;
};
export type EdaSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalSaleTransfer?: number;
	albertaSaleTransfer?: number;
	/**
	 * 015019
	 */
	federalRegulation1202Claim?: number;
	albertaRegulation1202Claim?: number;
};
export type CmedbRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalDisposalTransfer?: number;
	albertaDisposalTransfer?: number;
	/**
	 * 015031 — no federal default line exists for this one; blank = claim the maximum pool balance.
	 */
	claimed?: number;
};
export type CeeRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalCurrentYearExpenses?: number;
	federalLookBackExpenses?: number;
	federalReclassifiedFromCde?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalRenewableConservationExpenses?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalGovernmentAssistance?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalRenouncedFlowThrough?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	federalRenouncedLookBack?: number;
	/**
	 * 015061 — 100% claimable to the pool, no percentage rate.
	 */
	claimed?: number;
};
export type CeeSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalReclassifiedFromCde?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	/**
	 * 015081
	 */
	claimed?: number;
};
export type CdeRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalCurrentYearExpenses?: number;
	federalLookBackExpenses?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalReclassifiedFromCee?: number;
	federalGovernmentAssistance?: number;
	federalReceivableOnDisposition?: number;
	albertaReceivableOnDisposition?: number;
	/**
	 * 015105 — auto-derives from a negative CCOGPE-regular pool; see field description.
	 */
	federalCreditBalanceInCogpePool?: number;
	albertaCreditBalanceInCogpePool?: number;
	/**
	 * 015107 — the spec’s own text references an undefined "015139"; see field description.
	 */
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalRenouncedFlowThrough?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	federalRenouncedLookBack?: number;
	/**
	 * 015115 — capped at 30% of the pool (prorated for a short tax year).
	 */
	claimed?: number;
};
export type CdeSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalReclassifiedFromCee?: number;
	/**
	 * 015133 — no federal default line; ambiguous "may not exceed" wording, see field description.
	 */
	federalCreditBalanceInCogpePool?: number;
	albertaCreditBalanceInCogpePool?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	/**
	 * 015141
	 */
	claimed?: number;
};
export type CcogpeRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalCurrentYearExpenses?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalReceivableOnDisposition?: number;
	albertaReceivableOnDisposition?: number;
	federalGovernmentAssistance?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	/**
	 * 015167 — a negative pool total here may need to be routed to CDE per the 66.7(4)(a)(iii) designation; see field description.
	 */
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	/**
	 * 015169 — capped at 10% of the pool (prorated for a short tax year).
	 */
	claimed?: number;
};
export type CcogpeSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalReceivableOnDisposition?: number;
	albertaReceivableOnDisposition?: number;
	federalTransferredToSuccessor?: number;
	albertaTransferredToSuccessor?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	/**
	 * 015189
	 */
	claimed?: number;
};
export type FedeRegularRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/**
	 * 015209 — lesser of the pool and the greater of a 10% floor or foreign resource income.
	 */
	claimed?: number;
};
export type FedeSuccessorRow = {
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/**
	 * 015221 — no percentage rate; capped only by the pool and foreign resource income.
	 */
	claimed?: number;
};
export type SfedeCountryRegularRow = {
	/**
	 * 015241 — 2-letter country code (Chapter 1, Appendix 1-5).
	 */
	countryCode?: string;
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/**
	 * 015253
	 */
	claimed?: number;
};
export type SfedeCountrySuccessorRow = {
	countryCode?: string;
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/**
	 * 015273 — no percentage rate.
	 */
	claimed?: number;
};
export type CfreCountryRegularRow = {
	countryCode?: string;
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalCurrentYearExpenses?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherAdditions?: number;
	albertaOtherAdditions?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/**
	 * 015293 = A + B; B needs `globalForeignResourceLimit` below or it is treated as nil.
	 */
	claimed?: number;
	/**
	 * No line number — undefined anywhere in the spec text this engine was built from; see field description.
	 */
	globalForeignResourceLimit?: number;
};
export type CfreCountrySuccessorRow = {
	countryCode?: string;
	federalOpeningBalance?: number;
	albertaOpeningBalance?: number;
	federalAmalgamationTransfer?: number;
	albertaAmalgamationTransfer?: number;
	federalOtherTransfer?: number;
	albertaOtherTransfer?: number;
	federalOtherDeductions?: number;
	albertaOtherDeductions?: number;
	federalForeignResourceIncome?: number;
	/**
	 * 015313 — capped at 30%-prorated pool OR the sum of every country’s foreign resource income.
	 */
	claimed?: number;
};

/** AT1 Schedule 17's reserve kinds — see `ReserveType`'s own field for the derivation. */
export const RESERVE_TYPES = ["doubtfulDebts","undeliveredGoodsAndServices","prepaidRent","returnableContainers","unpaidAmounts","insurancePolicyReserves","bankReserves","otherTaxReserves"] as const;

/** AT1 Schedule 18's six category buckets — see `At1DispositionCategory`'s own field for the derivation. */
export const AT1_DISPOSITION_CATEGORIES = ["shares","realEstate","bonds","otherProperties","personalUse","listedPersonal"] as const;

/** Numeric coercion shared by the calc + engine-mapping layers: blank ⇒ 0. */
export const n = (v: unknown): number =>
	v == null || v === "" ? 0 : Number(v);
