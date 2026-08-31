"use client";

import { useWatch, type Control } from "react-hook-form";
import type { ComputedReturn } from "@/api/computed-returns";
import type { AlbertaManufacturing11Values } from "../../../../_lib/return-input";
import { parseAt1LineItemId } from "./at1-lines";
import { PaperLeaderRow, PaperSection } from "./components/paper-primitives";
import { AT1_SCHEDULE_11_FIELDS, AT1_SCHEDULE_11_SECTIONS } from "./generated/schedule11.layout";
import type { LineValue, ResolveLine } from "./resolve-line";

const SCHEDULE_ID = "011";

/** 031/033/037/039 are genuine editable inputs — see `schedule11.ts`'s doc comment. */
const OWN_FIELD: Partial<Record<string, keyof AlbertaManufacturing11Values>> = {
	"031": "costOfCapital",
	"033": "albertaCostOfCapital",
	"037": "costOfLabour",
	"039": "albertaCostOfLabour",
};

/**
 * AT1 Schedule 11 paper Form View. Line 042 is the one field whose
 * editability is genuinely conditional on another answer: computed from
 * lines 001/031-039 in the general case, but a direct entry
 * (`smallManufacturerAmpp`) for a small manufacturing corp — the spec gives
 * no proration formula for that case at all. `isSmallManufacturingCorp` is
 * watched live so switching that radio immediately flips 042 between the two
 * modes, the same way any other guided-editor field would react.
 */
export function Schedule11FormView({
	control,
	disabled,
	computed,
}: {
	control: Control<Record<string, unknown>>;
	disabled?: boolean;
	computed?: ComputedReturn;
}) {
	const s11Control = control as unknown as Control<AlbertaManufacturing11Values>;
	const isSmallManufacturingCorp = useWatch({ control: s11Control, name: "isSmallManufacturingCorp" });

	const filed = computed?.schedulePayloads?.find((p) => p.scheduleId === SCHEDULE_ID);
	const filedByField = new Map(
		(filed?.values ?? []).flatMap((v) => {
			const parsed = parseAt1LineItemId(v.lineItemId);
			return parsed ? [[parsed.field, v.value] as const] : [];
		}),
	);

	const resolveLine: ResolveLine = (line: string): LineValue => {
		const field = parseAt1LineItemId(line)?.field ?? line;
		if (field === "042" && isSmallManufacturingCorp === "yes") {
			return { editable: true, name: "smallManufacturerAmpp" };
		}
		const ownName = OWN_FIELD[field];
		if (ownName) return { editable: true, name: ownName };
		return { editable: false, value: filedByField.get(field) as string | number | undefined };
	};

	return (
		<div className="space-y-4">
			<p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
				Historical — applies only to a tax year beginning before 2001-04-01. Essentially no current
				engagement needs this schedule.
			</p>
			{AT1_SCHEDULE_11_SECTIONS.map((section) => {
				const fields = AT1_SCHEDULE_11_FIELDS.filter((f) => f.section === section.id);
				if (fields.length === 0) return null;
				return (
					<PaperSection key={section.id} title={section.title} description={section.description}>
						{fields.map((f) => (
							<PaperLeaderRow
								key={f.line}
								line={parseAt1LineItemId(f.line)?.field ?? f.line}
								caption={f.caption}
								kind={f.kind}
								role={f.role}
								note={f.note}
								from={f.from}
								control={s11Control}
								resolveLine={resolveLine}
								disabled={disabled}
							/>
						))}
					</PaperSection>
				);
			})}
		</div>
	);
}
