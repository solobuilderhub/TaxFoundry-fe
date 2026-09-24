"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import type { Control } from "react-hook-form";
import type { Client } from "@/api/clients";
import type { ComputedReturn } from "@/api/computed-returns";
import type { EngagementYear } from "@/api/engagements";
import type { AlbertaValues, ReturnInput } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import {
	PaperFootnotes,
	PaperLeaderRow,
	PaperSection,
	readFootnotePlacement,
} from "./components/paper-primitives";
import {
	AT1_JACKET_BLOCK_HEADINGS,
	AT1_JACKET_CODE_OPTIONS,
	AT1_JACKET_DAY_BANDS,
	AT1_JACKET_DEPARTMENT_USE,
	AT1_JACKET_FIELDS,
	AT1_JACKET_FOOTNOTE_PLACEMENT,
	AT1_JACKET_FOOTNOTES,
	AT1_JACKET_LINES_NOT_PRINTED,
	AT1_JACKET_RATE_ROWS,
	AT1_JACKET_SECTIONS,
	type PaperField,
} from "./generated/jacket.layout";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";
import { filedByFieldFor } from "./resolve-line";

/**
 * The AT1 jacket's own 3-digit line → this schedule's editable field: the
 * identification block (typed here, client profile as fallback), the yes/no
 * questions and the figures only the preparer knows. The tax year (036/037) is
 * the engagement's; 005 and 082 write their own slices (`DIRECT_PATH`);
 * everything else is computed or carried in. Line 001 (associated with
 * one or more CCPCs) IS asked here, genuinely, despite not appearing in the
 * generated `jacket.captions.ts` (it's hand-authored onto the jacket's own
 * `FormDefinition` — see `jacket.ts`'s `LINE_001` and its doc comment for why
 * the extractor can't discover it, and 4 real accepted TRA NetFile samples
 * proving it belongs here, not on AT1 Schedule 1). See `resolveLine` below
 * for where each remaining tier is actually sourced from.
 *
 * ── Lines 071 and 074 are deliberately NOT here ─────────────────────────────
 *
 * They were, briefly, and it was the Schedule 3 mistake repeated on the very
 * page that should have prevented it. Neither is printed on TRA11722 Rev.
 * 2025-07; both belong to closed programmes (M&P profits, pre-2001-04-01 only;
 * political contributions, prohibited in Alberta since 2015-06-15) and are
 * always nil. ca-tax types both `role: 'computed'` now, so they cannot be
 * offered as input from the layout alone.
 *
 * The reason this mattered rather than merely looked odd: 071 and 074 are
 * subtracted from AT1 Schedule 3's shared ceiling, so a figure typed into a
 * box for a programme that ended in 2001 would silently reduce a live ITC,
 * CITC or APITC claim — the exact failure mode that got the five MAD rows
 * removed from Schedule 3 two sessions ago.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaValues>> = {
	// Identification — typed here, as on every tax package's jacket. Blank
	// files the client profile's value (shown as the placeholder).
	"010": "legalName",
	"011": "operatingName",
	"012": "addressStreet",
	"013": "addressLine2",
	"014": "addressCity",
	"015": "addressProvince",
	// "Only if other than Canada" — blank is Canada, and a typed CA is not filed.
	"016": "addressCountry",
	"017": "addressPostalCode",
	"025": "contactPerson",
	"026": "contactTelephone",
	"028": "natureOfBusiness",
	"029": "typeOfCorporation",
	"034": "corporateAccountNumber",
	"035": "businessNumber",
	"105": "authorizedEmail",
	"001": "associatedWithCcpcs",
	"030": "specialCorporationStatus",
	"031": "windUpOfSubsidiary",
	"032": "firstYearAfterAmalgamation",
	"038": "taxYearEndChanged",
	"039": "taxYearEndChangeReason",
	"041": "functionalCurrency",
	"047": "grossRevenue",
	"048": "totalAssets",
	"050": "finalReturn",
	"051": "finalReturnReason",
	"052": "dateOfAmalgamation",
	"053": "dateOperationsCeased",
	"054": "transferOfProperty",
	"060": "reportsDifferentAlbertaIncome",
	"061": "electsDifferentDiscretionaryAmounts",
	"095": "preparedByTaxPreparerForFee",
};

/**
 * The client profile's value for an identification line — what files when the
 * jacket box is left blank (the server applies the same fallback, in
 * `at1-identity.ts`), so it is shown as the box's placeholder.
 */
function clientFallback(
	field: string,
	client: Client | undefined,
): string | undefined {
	const v = (() => {
		switch (field) {
			case "010":
				return client?.name;
			case "012":
				return client?.address?.street;
			case "014":
				return client?.address?.city;
			case "015":
				return client?.address?.province;
			case "017":
				return client?.address?.postalCode;
			case "025":
				return client?.contactPerson;
			case "026":
				return client?.contactTelephone;
			case "028":
				return client?.natureOfBusiness;
			case "029":
				return client?.typeOfCorporation;
			case "034":
				return client?.corporateAccountNumber;
			case "035":
				return client?.businessNumber;
			case "105":
				return client?.authorizedEmail;
			default:
				return undefined;
		}
	})();
	return v == null || String(v).trim() === "" ? undefined : String(v);
}

/**
 * The tax year (036/037) IS the engagement — which return this is — so it is
 * set when the engagement is opened, not retyped per jacket.
 */
function fromEngagement(
	field: string,
	engagement: EngagementYear | undefined,
): LineValue | undefined {
	const e = (v: string | number | undefined) =>
		({ editable: false, value: v, sourceLabel: "engagement" }) as const;
	if (field === "036") return e(engagement?.taxYearStart);
	if (field === "037") return e(engagement?.taxYearEnd);
	return undefined;
}

/**
 * Jacket lines printed as ordinary entries whose value lives in another slice:
 * 005 is the EDI schedule's certification code (the two must name the same
 * software — `resolveTransmitter`), 082 is the Payments schedule's instalments.
 */
const DIRECT_PATH: Partial<Record<string, string>> = {
	"005": "edi.softwareCertCode",
	"082": "payments.instalmentsPaid",
};

function storedAt(ri: ReturnInput | undefined, path: string) {
	let cur: unknown = ri;
	for (const key of path.split(".")) {
		cur = (cur as Record<string, unknown> | undefined)?.[key];
	}
	return typeof cur === "string" || typeof cur === "number" ? cur : undefined;
}

/** The jacket's real TRA schedule id ('000') — NOT the nav chip ("AT1"), which `schedulePayloads` never uses. */
const JACKET_SCHEDULE_ID = "000";

/**
 * Printed jacket line → the computed field holding its value.
 *
 * ── Why this is needed ──────────────────────────────────────────────────────
 *
 * `buildResolveLine` looked the jacket up in `computed.schedulePayloads`, and
 * that array NEVER contains it. The AT1 payload builders emit 001, 002, 010,
 * 012, 013, 016, 017, 018, 020, 021, 029 and 4970 — supporting schedules only.
 * The jacket ("000") and the EDI block are applied at RENDER time, by
 * `renderAt1NetFile` and the RSI adapter, out of `At1FilingData`.
 *
 * So the lookup always missed, `filedByField` was always empty, and every
 * computed money line fell through to "—" even after a successful compute — on
 * the one page whose purpose is line-by-line verification against the numbered
 * AT1. The figures existed all along; they were only reachable on the Tax
 * Summary, under slugs instead of line numbers.
 *
 * (Same root cause as the pre-transmit review, which now reads the generated
 * payload XML. This view runs BEFORE any payload exists, so it reads the
 * engine's own named fields instead.)
 *
 * ── Why only these six ──────────────────────────────────────────────────────
 *
 * Each is a 1:1 match with what `at1-line-items.ts` emits for that line,
 * checked getter by getter. Lines the engine does not publish as a named field
 * stay blank rather than being guessed at.
 *
 * Line 090 is deliberately absent FROM THIS MAP, and is derived instead — see
 * `derivedJacketLines`. The trap it avoids: `totalOwing` looks like the balance
 * and is not. `at1-engine.ts` sets `totalOwing = albertaTaxPayable * 100`, i.e.
 * line 080 in cents, while 090 is the balance after instalments and credits.
 * Mapping it here would have printed a confident wrong number on a tax form.
 */
const COMPUTED_FIELD: Partial<Record<string, string>> = {
	"062": "albertaTaxableIncome",
	"065": "allocationFactor",
	"068": "basicAlbertaTax",
	"070": "albertaSmallBusinessDeduction",
	"080": "albertaTaxPayable",
	"129": "innovationEmploymentGrant",
};

const printed = (line: string) => parseAt1LineItemId(line)?.field ?? line;

/**
 * The lines ca-tax says are on the RSI and not on the page — read from the
 * package rather than restated here, so a line transcribed onto the printed
 * form upstream moves out of `NotPrintedBlock` on the next emit without
 * anyone remembering this file.
 */
const NOT_PRINTED = new Set(AT1_JACKET_LINES_NOT_PRINTED);

/**
 * The printed page's own totals, struck exactly as it strikes them.
 *
 * These four are not engine fields — the engine publishes the components, and
 * the FORM combines them — so they rendered "—" even on a fully computed
 * return, on the page whose job is checking the arithmetic line by line.
 *
 *   079  Total (lines 070 + 072 + 076)
 *   082  Instalments and other payments        ← entered, on the payments slice
 *   088  Total (lines 129 + 082 + 085 + 086 + 115 + 087)
 *   090  Balance Unpaid (Overpayment) (080 − 088)
 *
 * 082 is an INPUT, not a computed line: the preparer enters it, just not on
 * this schedule — the editor collects it once per engagement under `payments`.
 * It is shown read-only here rather than as a second box, so the two cannot
 * drift.
 *
 * 088 is printed but NOT FILED: ca-tax transmits only 090, because 088 has no
 * line item of its own on the wire. Showing it is still right — it is on the
 * page, and it is the subtotal a preparer checks 090 against.
 *
 * The credits at 085, 086, 087, 115 and the deductions at 072, 076 have no
 * computed field in this engine and are nil on every return it produces, so
 * they contribute zero. When one is wired, it belongs in these sums — the
 * printed captions above are the specification for what each must contain.
 */
export function derivedJacketLines(
	computed: ComputedReturn | undefined,
	returnInput: ReturnInput | undefined,
): Partial<Record<string, number>> {
	const fields = computed?.fields;
	if (!fields || fields.length === 0) return {};
	const f = (slug: string): number => {
		const hit = fields.find((x) => x.line === slug);
		return hit?.value == null ? 0 : Number(hit.value) || 0;
	};
	const taxPayable = f("albertaTaxPayable");
	const sbd = f("albertaSmallBusinessDeduction");
	const ieg = f("innovationEmploymentGrant");
	const instalments = Number(returnInput?.payments?.instalmentsPaid ?? 0) || 0;

	/*
	 * 066 — Amount Taxable in Alberta, `062 × 065`, "if negative, enter 0".
	 *
	 * Printed on the form and never transmitted (the specification has no row
	 * for it), which is why no engine field carries it — but it is the base
	 * every rate below it applies to, so a preparer checking 068 needs it. It
	 * rendered "—" on every return until now.
	 */
	const amountTaxableInAlberta = Math.max(
		0,
		Math.round(f("albertaTaxableIncome") * (f("allocationFactor") || 0)),
	);
	const total079 = sbd; // + 072 + 076, both nil in this engine
	const total088 = ieg + instalments; // + 085 + 086 + 115 + 087, all nil
	return {
		"066": amountTaxableInAlberta,
		"079": total079,
		"082": instalments,
		"088": total088,
		"090": taxPayable - total088,
	};
}

function buildResolveLine(
	computed: ComputedReturn | undefined,
	engagement: EngagementYear | undefined,
	client: Client | undefined,
	returnInput: ReturnInput | undefined,
	writeInput:
		| ((path: string, value: string | number | undefined) => Promise<void>)
		| undefined,
): ResolveLine {
	const derived = derivedJacketLines(computed, returnInput);
	const filedByField = filedByFieldFor(
		computed,
		JACKET_SCHEDULE_ID,
		(l) => parseAt1LineItemId(l)?.field,
	);

	return (line: string): LineValue => {
		const field = printed(line);

		const ownName = OWN_FIELD[field];
		if (ownName) {
			const fallback = clientFallback(field, client);
			return {
				editable: true,
				name: ownName,
				// Present only for the coded lines; a money or date box gets none
				// and renders as an ordinary input.
				options: AT1_JACKET_CODE_OPTIONS[field],
				...(fallback ? { placeholder: fallback } : {}),
			};
		}

		const directPath = DIRECT_PATH[field];
		if (directPath && writeInput) {
			return {
				editable: false,
				value: undefined,
				direct: {
					stored: storedAt(returnInput, directPath),
					write: (v) => writeInput(directPath, v),
				},
			};
		}

		const fromEng = fromEngagement(field, engagement);
		if (fromEng) return fromEng;

		// The engine's own figure for this line, where it publishes one.
		const slug = COMPUTED_FIELD[field];
		if (slug) {
			const f = computed?.fields?.find((x) => x.line === slug);
			const value = f?.value == null ? undefined : (f.value as string | number);
			/*
			 * 062 shows the computed figure AND can be overridden.
			 *
			 * A plain box whose placeholder is the derived figure: on the normal
			 * path it is derived (federal taxable income × the allocation factor)
			 * and the preparer still SEES it, greyed, until they type over it.
			 *
			 * Typing is what makes an AT1 preparable when the T2 was done in
			 * another package: there is nothing to derive from, every line under
			 * 062 reads $0, and this is the box TRA's own jacket provides for
			 * saying so. Overriding writes the same slice the engine reads, so
			 * the figure has one home.
			 */
			if (field === "062") {
				return {
					editable: false,
					value,
					linked: {
						backing: "own",
						name: "albertaTaxableIncome",
						label:
							"Alberta taxable income — enter it when the T2 was prepared elsewhere",
					},
				};
			}
			if (value !== undefined) return { editable: false, value };
		}

		// A total the PAGE strikes from figures the engine published separately.
		const derivedValue = derived[field];
		if (derivedValue !== undefined) {
			return {
				editable: false,
				value: derivedValue,
				...(field === "082" ? { sourceLabel: "payments" } : {}),
			};
		}

		const filedValue = filedByField.get(field);
		return {
			editable: false,
			value: filedValue as string | number | undefined,
		};
	};
}

/**
 * AT1 jacket paper Form View — the printed form's own boxes and line order.
 *
 * ── What changed on 2026-09-14 ──────────────────────────────────────────────
 *
 * This view rendered the specification's field table, not the form. Reading
 * the PDF (TRA11722 Rev. 2025-07) beside it found five things missing, and the
 * first of them was already written down:
 *
 *   - **Three printed boxes.** 066 (Amount Taxable in Alberta), 079 (the
 *     deductions subtotal 080 subtracts) and 088 (the credits subtotal 090
 *     subtracts). The generated layout carried a comment ADMITTING 066 was
 *     absent and calling it "a known gap in the captions generator, not fixed
 *     here" — so page 2's arithmetic visibly did not close and the reason was
 *     in the file.
 *   - **The day-band table behind line 068.** Six lettered day counts and five
 *     prorated amounts. Line 068's caption is "Total (line G + line H + line I
 *     + line J + line K)"; without the table those five letters are defined
 *     nowhere on screen.
 *   - **Every tick-box option.** Six fields are codes — type of corporation,
 *     special status, both "specify the reason" lists, the functional currency
 *     and the refund disposition — and each rendered as a bare box. A filed "3"
 *     at 051 means bankruptcy; nothing said so.
 *   - **Nine in-box headings.** Three do real routing: the two stacked over 062
 *     decide whether Schedule 12 is required at all, and the paragraph over 101
 *     is the certification the signature attests to.
 *   - **The order.** Numeric, not printed, so the Innovation Employment Grant
 *     fell last among the credits instead of first, and the IDMTC tax
 *     certificate number (110) sat inside the certification block rather than
 *     directly under the IDMTC it identifies.
 *
 * Registered as `alberta.ts`'s `formView`.
 */
export function JacketFormView({
	control,
	disabled,
	computed,
	engagement,
	client,
	onNavigate,
	highlightLine,
	returnInput,
	writeInput,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	engagement?: EngagementYear;
	client?: Client;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
	returnInput?: ReturnInput;
	writeInput?: (
		path: string,
		value: string | number | undefined,
	) => Promise<void>;
}) {
	const resolveLine = buildResolveLine(
		computed,
		engagement,
		client,
		returnInput,
		writeInput,
	);
	const albertaControl = control as unknown as Control<AlbertaValues>;
	const footnotes = readFootnotePlacement(
		AT1_JACKET_FOOTNOTES,
		AT1_JACKET_FOOTNOTE_PLACEMENT,
	);

	const row = (f: PaperField) => (
		<PaperLeaderRow
			key={f.line}
			line={printed(f.line)}
			caption={f.caption}
			kind={f.kind}
			role={f.role}
			note={f.note}
			sourceText={f.sourceText}
			from={f.from}
			to={f.to}
			footnoteMarks={f.footnoteMarks}
			footnotes={AT1_JACKET_FOOTNOTES}
			footnoteSymbol={(mark) => footnotes.marks[mark]}
			onNavigate={onNavigate}
			highlightLine={highlightLine}
			control={albertaControl}
			resolveLine={resolveLine}
			disabled={disabled}
		/>
	);

	/**
	 * A row, preceded by whatever the page prints immediately above it and
	 * followed by its tick-box options where the page prints a list.
	 *
	 * Line 068 gets the day-band table between the two, because that is where
	 * the page sets it: under the "Basic Alberta Tax Payable" heading and above
	 * the total the five rate rows add up to.
	 */
	const rowWithPrintedText = (f: PaperField) => {
		const line = printed(f.line);
		const headings = AT1_JACKET_BLOCK_HEADINGS.filter(
			(h) => h.aboveLine === line,
		);
		const options = AT1_JACKET_CODE_OPTIONS[line];
		if (headings.length === 0 && !options && line !== "068") return row(f);
		return (
			<div key={f.line}>
				{headings.map((h) => (
					<p
						key={h.text}
						className="px-4 pb-1 pt-3 text-sm font-semibold leading-snug"
					>
						{h.text}
					</p>
				))}
				{line === "068" && <DayBandTable />}
				{row(f)}
				{options && <CodeOptions line={line} />}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<DepartmentUseBox />

			{AT1_JACKET_SECTIONS.map((section, i) => {
				const fields = AT1_JACKET_FIELDS.filter(
					(f) => f.section === section.id && !NOT_PRINTED.has(printed(f.line)),
				);
				if (fields.length === 0) return null;
				return (
					<div key={section.id} className="space-y-2">
						{/*
						 * The page's own words above the heading — page 2 opens with
						 * "Report all monetary amounts in dollars; Do Not include
						 * cents", which governs everything below it and is not our
						 * guidance about the box it precedes.
						 */}
						{section.printedBefore && (
							<p className="px-1 text-sm font-medium text-muted-foreground">
								{section.printedBefore}
							</p>
						)}
						<PaperSection
							title={section.title}
							description={section.description}
							formId={i === 0 ? "AT1" : undefined}
						>
							{fields.map(rowWithPrintedText)}
							{/* Printed inside the box below its last line — the authorized-email restriction. */}
							{section.printedAfter && (
								<p className="px-4 py-2 text-sm font-medium leading-snug">
									{section.printedAfter}
								</p>
							)}
							<PaperFootnotes
								notes={AT1_JACKET_FOOTNOTES}
								only={footnotes.forSection(section.id)}
								marks={footnotes.marks}
							/>
						</PaperSection>
					</div>
				);
			})}

			<NotPrintedBlock
				control={albertaControl}
				resolveLine={resolveLine}
				disabled={disabled}
				onNavigate={onNavigate}
				highlightLine={highlightLine}
			/>

			{/* Anything belonging to no box. Empty on this form — kept so a note added upstream cannot vanish. */}
			<PaperFootnotes
				notes={AT1_JACKET_FOOTNOTES}
				only={footnotes.unplaced}
				marks={footnotes.marks}
			/>
		</div>
	);
}

/**
 * The nine lines the RSI still carries and this form no longer prints.
 *
 * **This block exists because these rows were indistinguishable from printed
 * ones.** They rendered as ordinary leader rows inside the tax and
 * identification boxes — same line chip, same caption, same value box — on a
 * view whose entire purpose is to be the printed page. Asked where 064, 071
 * and 074 were on the form, the honest answer was "they are not", and nothing
 * on screen said so.
 *
 * They cannot simply be dropped either. §3.2.3 makes "mandatory" an obligation
 * on the OUTPUT: four of these nine are mandatory Field IDs that must be
 * emitted even when nil, and a payload missing one is rejected rather than
 * assessed. So the return really does carry them, and a preparer reconciling
 * a transmitted payload against this screen needs to find them somewhere.
 *
 * Below the form, then, and labelled — with each line's own note giving the
 * reason it left the page. Every one is read-only: four are closed programmes
 * that file a constant zero (ca-tax types them `computed`), and the other five
 * are contact details this product collects once, in the client profile.
 */
function NotPrintedBlock({
	control,
	resolveLine,
	disabled,
	onNavigate,
	highlightLine,
}: {
	control: Control<AlbertaValues>;
	resolveLine: ResolveLine;
	disabled?: boolean;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const fields = AT1_JACKET_FIELDS.filter((f) =>
		NOT_PRINTED.has(printed(f.line)),
	);
	if (fields.length === 0) return null;
	const mandatory = fields.filter((f) => f.requirement === "mandatory").length;
	return (
		<div className="rounded-lg border border-dashed bg-muted/10">
			<div className="border-b border-dashed bg-muted/30 px-4 py-2">
				<h3 className="text-sm font-semibold">
					Filed, but not printed on this form
				</h3>
				<p className="mt-0.5 text-xs text-muted-foreground">
					{fields.length} lines the AT1 Net File specification still tabulates
					and TRA11722 Rev. 2025-07 does not show anywhere — {mandatory} of them
					mandatory, so they must be transmitted even when nil. Four are closed
					programmes that file a constant zero; the rest are contact details
					this product holds once, on the client profile. None is a box to fill
					in, which is why none of them appears above.
				</p>
			</div>
			<div className="divide-y divide-dashed">
				{fields.map((f) => (
					<PaperLeaderRow
						key={f.line}
						line={printed(f.line)}
						caption={f.caption}
						kind={f.kind}
						role={f.role}
						note={f.note}
						onNavigate={onNavigate}
						highlightLine={highlightLine}
						control={control}
						resolveLine={resolveLine}
						disabled={disabled}
					/>
				))}
			</div>
		</div>
	);
}

/**
 * Page 1's "For Department Use" box — and the one printed number this product
 * will not guess at.
 *
 * It holds three numbered fields. 005 is the Software Approval Code the
 * specification tabulates and 001 is the association answer four accepted TRA
 * certification samples file first under Schedule 000; both are rendered as
 * ordinary rows in the sections below, where their sections put them. **004 is
 * printed with no caption, appears in no spec table and in no sample**, so
 * ca-tax deliberately has no field for it.
 *
 * Shown rather than omitted for the same reason Schedule 1's column 044 is
 * shown read-only: a box on the form that this product cannot fill is exactly
 * the kind of gap that should be visible to whoever is reconciling against the
 * paper, not silently absent from the screen.
 */
function DepartmentUseBox() {
	const unmodelled = new Set(AT1_JACKET_DEPARTMENT_USE.unmodelled);
	return (
		<div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3">
			<div className="flex items-baseline justify-between gap-3">
				<h3 className="text-sm font-semibold">
					{AT1_JACKET_DEPARTMENT_USE.heading}
				</h3>
				<span className="font-mono text-xs text-muted-foreground">
					{AT1_JACKET_DEPARTMENT_USE.preprinted}
				</span>
			</div>
			<div className="mt-2 flex flex-wrap items-center gap-2">
				{AT1_JACKET_DEPARTMENT_USE.lines.map((line) => (
					<span
						key={line}
						className={`rounded px-1.5 font-mono text-[10px] ${
							unmodelled.has(line)
								? "bg-transparent text-muted-foreground ring-1 ring-dashed ring-border"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{line}
					</span>
				))}
				<TooltipWrapper
					content="Line 004 is printed inside this box with no caption. It appears in no cross-reference table in the Net File specification and in none of the accepted TRA certification samples, so there is nothing to transcribe — a guessed caption would file a real figure against the wrong box and nothing would look broken."
					side="top"
				>
					<span className="cursor-help text-xs text-muted-foreground underline decoration-dotted underline-offset-2">
						004 is not modelled — why?
					</span>
				</TooltipWrapper>
			</div>
		</div>
	);
}

/**
 * "Basic Alberta Tax Payable" — six day counts and five prorated amounts, read
 * only.
 *
 * The page does not apply one rate to the year: it asks how many days the tax
 * year spent in each band Alberta cut the general rate on, then prorates. This
 * engine computes line 068 the same way (`computeDayWeightedGeneralTax`) but
 * files only the total, so every cell here is blank — as it is on the paper
 * form, which pre-prints the formulas and leaves the boxes empty.
 *
 * Blank and present beats absent. Line 068's caption names lines G through K
 * and this is the only thing on screen that says what they are.
 */
function DayBandTable() {
	return (
		<div className="space-y-3 px-4 py-3">
			<div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
				{AT1_JACKET_DAY_BANDS.map((band) => (
					<div key={band.letter} className="space-y-1">
						<p className="text-[11px] leading-tight text-muted-foreground">
							{band.label}
						</p>
						<div className="flex items-center gap-1.5">
							<span className="h-7 flex-1 rounded-md border border-dashed bg-muted/40" />
							<span className="font-mono text-[11px] text-muted-foreground">
								{band.letter}
							</span>
						</div>
					</div>
				))}
			</div>
			<div className="space-y-1">
				{AT1_JACKET_RATE_ROWS.map((r) => (
					<div
						key={r.letter}
						className="flex items-center gap-3 text-sm tabular-nums"
					>
						<span className="min-w-0 flex-1 font-mono text-xs text-muted-foreground">
							{r.formula}
						</span>
						<span className="h-7 w-28 shrink-0 rounded-md border border-dashed bg-muted/40" />
						<span className="w-8 shrink-0 text-right font-mono text-xs text-muted-foreground">
							{r.letter}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * The tick-box options the page prints beside a code field.
 *
 * The number is the value TRANSMITTED, not a display order — a filed "3" means
 * bankruptcy at line 051 and a final return at line 039 — so each option shows
 * its code.
 *
 * This is the printed page's own list, kept beneath the row as the form prints
 * it. The row ITSELF is now a select over the same options (see
 * `OWN_FIELD`/`resolveLine` above): 030, 039, 041 and 051 were uncollectable
 * until this session, when nothing anywhere wrote them, and the list was all a
 * preparer had. 029 remains read-only, from the client profile.
 */
function CodeOptions({ line }: { line: string }) {
	const options = AT1_JACKET_CODE_OPTIONS[line];
	if (!options) return null;
	return (
		<ul className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-3 pt-1 text-xs text-muted-foreground">
			{options.map((o) => (
				<li key={o.code} className="flex items-baseline gap-1.5">
					<span className="font-mono text-[11px]">{o.code}</span>
					<span>{o.label}</span>
				</li>
			))}
		</ul>
	);
}
