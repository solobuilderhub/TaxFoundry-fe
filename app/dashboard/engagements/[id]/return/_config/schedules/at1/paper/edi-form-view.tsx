"use client";

import { TooltipWrapper } from "@classytic/fluid/client/tooltip-wrapper";
import { type Control, useWatch } from "react-hook-form";
import type { EdiValues } from "../../../../_lib/return-input";
import { PaperSelect, PaperText } from "./components/paper-inputs";
import { PaperSection } from "./components/paper-primitives";

/**
 * One row of the EDI block, as the transmission carries it.
 *
 * `line` is the real Net File Line-Item ID minus its trailing occurrence —
 * `EDI001001` is rendered as `001`, the same way every other paper view shows
 * `parseAt1LineItemId(...)?.field`. These are not invented: every one comes
 * from `AT1_EDI_LINE_ITEMS` in `@classytic/ca-tax`, which was transcribed from
 * spec §3.3.6.1.
 *
 * `label` is this codebase's own wording, and this is the one paper view in the
 * editor where that is true. §3.3.6.1 is not in this checkout, so there is no
 * `FormDefinition` and no generated layout to read captions from — and the only
 * other rendering of this schedule available is another vendor's, which is a
 * lead and never a source for the words. When the section is to hand this file
 * becomes a normal generated-layout view.
 */
interface EdiRow {
	line: string;
	label: string;
	name: keyof EdiValues;
	/** Free text unless stated — these two are fixed lists per §3.3.6.1. */
	options?: readonly { value: string; label: string }[];
	/** Why the value matters, where getting it wrong has a named consequence. */
	note?: string;
}

const SOFTWARE: readonly EdiRow[] = [
	{
		line: "001",
		label: "Software Certification Code (SCC)",
		name: "softwareCertCode",
		note: "Issued by TRA at certification and validated against TRA's own registry. A wrong or placeholder code is error 20010 — the return is rejected before anything else is read.",
	},
	{ line: "011", label: "Web service version", name: "webServiceVersion" },
	{ line: "013", label: "Software version", name: "softwareVersion" },
	{
		line: "015",
		label: "Software serial number",
		name: "serialNumber",
		note: "TRA checks that this is present (error 20013), not what it says.",
	},
];

const THIRD_PARTY_OPTIONS = [
	{ value: "1", label: "Yes" },
	{ value: "2", label: "No" },
] as const;

const ORGANIZATION: readonly EdiRow[] = [
	{
		line: "017",
		label: "Third Party Service Provider Indicator",
		name: "thirdPartyIndicator",
		options: THIRD_PARTY_OPTIONS,
		note: 'Spec §3.3.6.1: "Must be 1 (yes) or 2 (no)." There is no "0" and no unanswered state — a filer who is not a third party answers No. Yes makes 023 and the whole of 051-061 mandatory, and TRA rejects an incomplete set with error 10025.',
	},
	{ line: "019", label: "Organization legal name", name: "legalName" },
	{
		line: "023",
		label: "Type of organization",
		name: "organizationType",
		options: [
			{ value: "CORPORATION", label: "Corporation" },
			{ value: "PARTNERSHIP", label: "Partnership" },
			{ value: "INDIVIDUAL", label: "Individual" },
		],
		note: "Mandatory when line 017 is Yes.",
	},
];

const CONTACT: readonly EdiRow[] = [
	{ line: "031", label: "Contact name (First name)", name: "contactFirstName" },
	{ line: "033", label: "Contact name (Last name)", name: "contactLastName" },
	{ line: "035", label: "Position", name: "contactPosition" },
	{
		line: "037",
		label: "Telephone number",
		name: "contactPhone",
		note: "10 to 15 digits, numeric only. Punctuation and placeholders are rejected with error 20100 — confirmed live against TRA's certification endpoint.",
	},
	{ line: "041", label: "E-mail address", name: "contactEmail" },
];

const ADDRESS: readonly EdiRow[] = [
	{ line: "051", label: "Address (Line 1)", name: "addressStreet" },
	{
		line: "053",
		label: "Address (Line 2)",
		name: "addressLine2",
		note: "Always optional, whatever line 017 says.",
	},
	{ line: "055", label: "City/Town", name: "addressCity" },
	{
		line: "057",
		label: "Province/State",
		name: "addressProvince",
		note: "Checked against TRA's province table when the country is CA or US.",
	},
	{
		line: "059",
		label: "Postal or Zip Code",
		name: "addressPostalCode",
		note: "A9A 9A9 for Canada; five or nine digits for the US.",
	},
	{ line: "061", label: "Country", name: "addressCountry" },
];

/*
 * ── Two lines this schedule does not have: EDI021 and EDI039 ───────────────
 *
 * Another vendor's rendering of the same schedule shows an "Organization
 * operating name" at 021 and a "Fax number" at 039, and both are plausible
 * pairs — 019/021 legal and operating name, 037/039 telephone and fax. That is
 * a LEAD, not a source: §3.3.6.1 as this codebase has it carries neither, and
 * a line number transcribed from a competitor's screen would file a real
 * figure against a box nobody has verified exists.
 *
 * This was briefly rendered as a panel in the interface. Wrong audience — a
 * preparer cannot act on it, and "two lines are not implemented" in the middle
 * of a form reads as a defect rather than as a note to whoever next has the
 * spec open. It belongs here, where the person who can fix it will be.
 *
 * Neither is in TRA's mandatory set, so nothing is currently refused for their
 * absence.
 */

/**
 * The EDI schedule — Net File transmitter / software identity.
 *
 * ── This screen is the only source for these values ────────────────────────
 *
 * They used to come from the server's own configuration
 * (`src/config/at1-transmitter.ts`, read from environment variables at boot)
 * with no way to see or set them. An unconfigured deployment therefore carried
 * `AB0000` and `0000000000` — precisely the two placeholders
 * `validateAt1Transmitter` exists to refuse — and nothing in the interface said
 * so until a transmission came back rejected with a bare numeric code and no
 * message text.
 *
 * That file is deleted. A first attempt kept it as a FALLBACK behind these
 * boxes, which was worse than either option alone: the payload would state the
 * filer's identity from two sources at once, and a blank box could mean either
 * "nil" or "whatever the server happens to be configured with". Filing is the
 * one place a value must have exactly one origin.
 *
 * So a blank box is transmitted blank, and `validateAt1Transmitter` refuses the
 * transmission naming each empty mandatory field — ten of them on an untouched
 * return. That is the fail-closed rule the rest of the engine follows, and it
 * is why the banner says what it says.
 *
 * Two consequences worth knowing. The AT1 jacket states the certification code
 * a second time at 000005001, and it reads line 001 here, so the two halves of
 * a transmission cannot name different software. And computing or reviewing a
 * return with this schedule incomplete still works — refusing to render is not
 * how a preparer discovers which box is empty; only transmitting is blocked.
 *
 * Laid out as four blocks in the transmission's own line order (001-015,
 * 017-023, 031-041, 051-061) rather than as a paper facsimile, because there is
 * no paper: the EDI schedule exists only in the Net File XML.
 */
export function EdiFormView({
	control,
	disabled,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
}) {
	const c = control as unknown as Control<EdiValues>;
	const entered = useWatch({ control: c }) ?? {};
	const filled = (Object.keys(entered) as (keyof EdiValues)[]).filter((k) => {
		const v = entered[k];
		return typeof v === "string" && v.trim() !== "";
	}).length;

	const rows = (block: readonly EdiRow[]) =>
		block.map((row) => (
			<div key={row.line} className="flex items-center gap-3 px-4 py-2 text-sm">
				<span className="w-12 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-[11px] text-muted-foreground">
					{row.line}
				</span>
				<span className="min-w-0 flex-1 truncate" title={row.label}>
					{row.label}
					{row.note && (
						<TooltipWrapper content={row.note} side="top">
							<span className="ml-1.5 cursor-help rounded-full border px-1.5 text-[10px] leading-4 text-muted-foreground">
								?
							</span>
						</TooltipWrapper>
					)}
				</span>
				<div className="w-72 shrink-0">
					{row.options ? (
						<PaperSelect
							control={c}
							name={row.name}
							label={row.label}
							options={row.options}
							blankLabel="— not answered —"
							disabled={disabled}
						/>
					) : (
						<PaperText
							control={c}
							name={row.name}
							label={row.label}
							disabled={disabled}
						/>
					)}
				</div>
			</div>
		));

	return (
		<div className="space-y-4">
			{/*
			 * Said once, at the top, rather than on nineteen rows. The empty-box
			 * behaviour is the single most important thing to understand about
			 * this screen: blank does not mean nil, it means "whatever the server
			 * is configured with", which is the opposite of every other schedule
			 * in this editor.
			 */}
			<div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm">
				<p className="font-medium">
					This return cannot be transmitted until these are filled in.
				</p>
				<p className="mt-1 text-muted-foreground">
					They identify the filer and the software to TRA, and they are taken
					from this schedule and nowhere else — a blank box is transmitted
					blank, and TRA rejects the return naming the field. Nineteen boxes;
					only line 053 is optional.
					{filled > 0 && (
						<>
							{" "}
							<span className="font-medium text-foreground">
								{filled} of 19 filled in
							</span>
							.
						</>
					)}
				</p>
			</div>

			<PaperSection
				title="Software identification"
				description="Properties of the software rather than of this return. The Software Certification Code is issued by TRA at certification."
			>
				{rows(SOFTWARE)}
			</PaperSection>

			<PaperSection
				title="Third party service provider"
				description="Answering Yes at line 017 makes line 023 and the whole address below mandatory — TRA rejects an incomplete set with error 10025."
			>
				{rows(ORGANIZATION)}
			</PaperSection>

			<PaperSection
				title="Contact"
				description="The person TRA contacts about a transmission problem — the filer's own staff, not the corporation's."
			>
				{rows(CONTACT)}
			</PaperSection>

			<PaperSection
				title="Address"
				description="The transmitting organization's own mailing address."
			>
				{rows(ADDRESS)}
			</PaperSection>

			{/*
			 * The amended-return pair, stated and NOT collected. 071 and 073 are
			 * genuinely per-return and already come off the engagement record; a
			 * second set of boxes here would give one figure two sources, which is
			 * how they end up disagreeing.
			 */}
			<div className="rounded-lg border bg-card">
				<div className="border-b bg-muted/40 px-4 py-2">
					<h3 className="text-sm font-semibold">Amended return</h3>
				</div>
				<div className="space-y-1 px-4 py-3 text-sm text-muted-foreground">
					<p>
						<span className="mr-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
							071
						</span>
						Amended return indicator
						<span className="mx-2">·</span>
						<span className="mr-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
							073
						</span>
						Description of changes
					</p>
					<p>
						Both are set when this engagement is created as an amendment of a
						previously filed one, not here — they belong to the return rather
						than to the transmitter.
					</p>
				</div>
			</div>
		</div>
	);
}
