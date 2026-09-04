"use client";

import type { Control } from "react-hook-form";
import type { Client } from "@/api/clients";
import type { ComputedReturn } from "@/api/computed-returns";
import type { EngagementYear } from "@/api/engagements";
import type { AlbertaValues } from "../../../../_lib/return-input";
import { PaperFootnotes, PaperLeaderRow, PaperSection } from "./components/paper-primitives";
import { AT1_JACKET_FIELDS, AT1_JACKET_FOOTNOTES, AT1_JACKET_SECTIONS } from "./generated/jacket.layout";
import { parseAt1LineItemId } from "./at1-lines";
import type { LineValue, NavigateToLine, ResolveLine } from "./resolve-line";

/**
 * The AT1 jacket's own 3-digit line → this schedule's editable field. Only
 * 11 of the jacket's 72 lines are collected here at all — the identification
 * block (010-037) is entered at client/engagement creation, everything else
 * is computed or carried in from another schedule. Line 001 (associated with
 * one or more CCPCs) IS asked here, genuinely, despite not appearing in the
 * generated `jacket.captions.ts` (it's hand-authored onto the jacket's own
 * `FormDefinition` — see `jacket.ts`'s `LINE_001` and its doc comment for why
 * the extractor can't discover it, and 4 real accepted TRA NetFile samples
 * proving it belongs here, not on AT1 Schedule 1). See `resolveLine` below
 * for where each remaining tier is actually sourced from.
 */
const OWN_FIELD: Partial<Record<string, keyof AlbertaValues>> = {
	"001": "associatedWithCcpcs",
	"031": "windUpOfSubsidiary",
	"032": "firstYearAfterAmalgamation",
	"038": "taxYearEndChanged",
	"047": "grossRevenue",
	"048": "totalAssets",
	"050": "finalReturn",
	"054": "transferOfProperty",
	"060": "reportsDifferentAlbertaIncome",
	"061": "electsDifferentDiscretionaryAmounts",
	"095": "preparedByTaxPreparerForFee",
};

/**
 * The identification/certification lines this product collects at
 * client/engagement creation, not in this schedule — read-only here with a
 * tag pointing at where they're actually edited, never a second editable
 * copy of the same fact (that would let the two silently drift).
 */
function fromClientOrEngagement(
	field: string,
	engagement: EngagementYear | undefined,
	client: Client | undefined,
): LineValue | undefined {
	const c = (v: string | number | undefined) =>
		({ editable: false, value: v, sourceLabel: "client profile" }) as const;
	const e = (v: string | number | undefined) =>
		({ editable: false, value: v, sourceLabel: "engagement" }) as const;
	switch (field) {
		case "010":
			return c(client?.name);
		case "012":
			return c(client?.address?.street);
		case "014":
			return c(client?.address?.city);
		case "015":
			return c(client?.address?.province);
		case "017":
			return c(client?.address?.postalCode);
		case "025":
			return c(client?.contactPerson);
		case "026":
			return c(client?.contactTelephone);
		case "028":
			return c(client?.natureOfBusiness);
		case "029":
			return c(client?.typeOfCorporation);
		case "034":
			return c(client?.corporateAccountNumber);
		case "035":
			return c(client?.businessNumber);
		case "105":
			return c(client?.authorizedEmail);
		case "036":
			return e(engagement?.taxYearStart);
		case "037":
			return e(engagement?.taxYearEnd);
		default:
			return undefined;
	}
}

/** The jacket's real TRA schedule id ('000') — NOT the nav chip ("AT1"), which `schedulePayloads` never uses. */
const JACKET_SCHEDULE_ID = "000";

function buildResolveLine(
	computed: ComputedReturn | undefined,
	engagement: EngagementYear | undefined,
	client: Client | undefined,
): ResolveLine {
	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === JACKET_SCHEDULE_ID);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	return (line: string): LineValue => {
		const parsed = parseAt1LineItemId(line);
		const field = parsed?.field ?? line;

		const ownName = OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };

		const fromClient = fromClientOrEngagement(field, engagement, client);
		if (fromClient) return fromClient;

		const filedValue = filedByField.get(field);
		return { editable: false, value: filedValue as string | number | undefined };
	};
}

/**
 * AT1 jacket paper Form View — the printed form's own section grouping and
 * line order (identification → status → income → tax → credits →
 * certification), with editable boxes only where `alberta.ts` genuinely
 * collects the value. Registered as `alberta.ts`'s `formView`.
 */
export function JacketFormView({
	control,
	disabled,
	computed,
	engagement,
	client,
	onNavigate,
	highlightLine,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
	engagement?: EngagementYear;
	client?: Client;
	onNavigate?: NavigateToLine;
	highlightLine?: string;
}) {
	const resolveLine = buildResolveLine(computed, engagement, client);
	const albertaControl = control as unknown as Control<AlbertaValues>;

	return (
		<div className="space-y-4">
			{AT1_JACKET_SECTIONS.map((section, i) => {
				const fields = AT1_JACKET_FIELDS.filter((f) => f.section === section.id);
				if (fields.length === 0) return null;
				return (
					<PaperSection
						key={section.id}
						title={section.title}
						description={section.description}
						formId={i === 0 ? "AT1" : undefined}
					>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={parseAt1LineItemId(f.line)?.field ?? f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								to={f.to}
								onNavigate={onNavigate}
								highlightLine={highlightLine}
								control={albertaControl}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
			<PaperFootnotes notes={AT1_JACKET_FOOTNOTES} />
		</div>
	);
}
