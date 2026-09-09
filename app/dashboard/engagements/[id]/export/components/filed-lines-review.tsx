"use client";

import type { ComputedReturn } from "@/api/computed-returns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AT1_JACKET_FIELDS } from "../../return/_config/schedules/at1/paper/generated/jacket.layout";
import { AT1_SCHEDULE_1_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule1.layout";
import { AT1_SCHEDULE_2_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule2.layout";
import { AT1_SCHEDULE_3_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule3.layout";
import { AT1_SCHEDULE_4_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule4.layout";
import { AT1_SCHEDULE_10_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule10.layout";
import { AT1_SCHEDULE_12_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule12.layout";
import { AT1_SCHEDULE_13_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule13.layout";
import { AT1_SCHEDULE_15_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule15.layout";
import { AT1_SCHEDULE_17_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule17.layout";
import { AT1_SCHEDULE_20_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule20.layout";
import { AT1_SCHEDULE_21_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule21.layout";
import { AT1_SCHEDULE_29_FIELDS } from "../../return/_config/schedules/at1/paper/generated/schedule29.layout";

/**
 * What is actually going to TRA, in the form's own words.
 *
 * The payload card beside this one shows the real XML, and should — it is the
 * exact bytes on the wire. But a preparer cannot review
 * `<Value LineItemID="012090001">500000</Value>`: the nine-digit id says
 * nothing about which box on which page it is, and a wrong figure against a
 * right-looking id is exactly the error that survives every check up to
 * assessment.
 *
 * So this renders the same values captioned — schedule, printed line number,
 * the caption off the form definition, and the amount. It is the last chance
 * to notice that a figure is wrong before it is transmitted, and it is
 * deliberately placed BEFORE the raw XML rather than after it.
 *
 * Nothing here is a second computation. Every value comes from the computed
 * return's own `schedulePayloads`, which is what the renderer serialises; the
 * captions come from the generated paper layouts, which come from the same
 * `FormDefinition`s the engine files against. If a line shows up here with no
 * caption, that is a real finding, not a display bug: the payload carries a
 * line the form model does not describe, and it is labelled in amber rather
 * than hidden.
 */
const SCHEDULE_FIELDS: Record<
	string,
	{
		title: string;
		fields: readonly { line: string; caption: string; kind: string }[];
	}
> = {
	"000": {
		title: "AT1 — Alberta Corporate Income Tax Return",
		fields: AT1_JACKET_FIELDS,
	},
	"001": {
		title: "Schedule 1 — Small Business Deduction",
		fields: AT1_SCHEDULE_1_FIELDS,
	},
	"002": {
		title: "Schedule 2 — Income Allocation Factor",
		fields: AT1_SCHEDULE_2_FIELDS,
	},
	"003": {
		title: "Schedule 3 — Other Tax Deductions and Credits",
		fields: AT1_SCHEDULE_3_FIELDS,
	},
	"004": {
		title: "Schedule 4 — Foreign Investment Income Tax Credit",
		fields: AT1_SCHEDULE_4_FIELDS,
	},
	"010": {
		title: "Schedule 10 — Loss Carry-Back Application",
		fields: AT1_SCHEDULE_10_FIELDS,
	},
	"012": {
		title: "Schedule 12 — Income/Loss Reconciliation",
		fields: AT1_SCHEDULE_12_FIELDS,
	},
	"013": {
		title: "Schedule 13 — Capital Cost Allowance",
		fields: AT1_SCHEDULE_13_FIELDS,
	},
	"015": {
		title: "Schedule 15 — Resource Related Deductions",
		fields: AT1_SCHEDULE_15_FIELDS,
	},
	"017": {
		title: "Schedule 17 — Alberta Reserves",
		fields: AT1_SCHEDULE_17_FIELDS,
	},
	"020": {
		title: "Schedule 20 — Charitable Donations & Gifts",
		fields: AT1_SCHEDULE_20_FIELDS,
	},
	"021": {
		title: "Schedule 21 — Current-Year Loss and Continuity of Losses",
		fields: AT1_SCHEDULE_21_FIELDS,
	},
	"029": {
		title: "Schedule 29 — Innovation Employment Grant",
		fields: AT1_SCHEDULE_29_FIELDS,
	},
};

const MONEY = new Intl.NumberFormat("en-CA", {
	style: "currency",
	currency: "CAD",
	maximumFractionDigits: 0,
});

/**
 * A figure that reads the way the form prints it — negatives in brackets, per
 * "Show negative amounts in brackets ( )".
 *
 * Only MONEY is money. A `code` is a selector printed as a bare digit (AT1
 * Schedule 18 line 084, "Specify: 1 = shares or 2 = debt"), and a `rate` is a
 * decimal (Schedule 10 files its inclusion rate to six places) — formatting
 * either as currency turns a code into "$1" and a rate into "$1".
 */
function formatValue(value: unknown, kind: string | undefined): string {
	if (value === null || value === undefined || value === "") return "—";
	if (typeof value === "number") {
		if (kind !== "money") return String(value);
		return value < 0
			? `(${MONEY.format(Math.abs(value))})`
			: MONEY.format(value);
	}
	return String(value);
}

/** `SSSFFFOOO` → the schedule, the printed 3-digit line, and the occurrence. */
function parseLineItemId(
	id: string,
): { schedule: string; field: string; occurrence: number } | undefined {
	if (!/^\d{9}$/.test(id)) return undefined;
	return {
		schedule: id.slice(0, 3),
		field: id.slice(3, 6),
		occurrence: Number(id.slice(6, 9)),
	};
}

export function FiledLinesReview({ computed }: { computed?: ComputedReturn }) {
	const payloads = computed?.schedulePayloads ?? [];

	if (payloads.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">What will be filed</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Compute the return to see, line by line, exactly what goes to TRA.
					</p>
				</CardContent>
			</Card>
		);
	}

	// Sorted numerically so the jacket leads and the schedules follow in form
	// order, the way a preparer holding the paper return would page through them.
	const ordered = [...payloads].sort((a, b) =>
		a.scheduleId.localeCompare(b.scheduleId),
	);
	const totalLines = ordered.reduce((n, p) => n + p.values.length, 0);

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">What will be filed</CardTitle>
				<p className="text-sm text-muted-foreground">
					Every figure in the payload, against the line it is filed as.{" "}
					{totalLines} {totalLines === 1 ? "line" : "lines"} across{" "}
					{ordered.length === 1
						? "one schedule"
						: `${ordered.length} schedules`}
					. Check this before transmitting — once it is on the wire it is a
					filed return.
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{ordered.map((payload) => {
					const meta = SCHEDULE_FIELDS[payload.scheduleId];
					const byField = new Map(
						(meta?.fields ?? []).map((f) => [f.line.slice(3, 6), f]),
					);
					return (
						<div key={payload.scheduleId} className="space-y-2">
							<div className="flex items-baseline gap-2">
								<h4 className="text-sm font-semibold">
									{meta?.title ?? `Schedule ${payload.scheduleId}`}
								</h4>
								<span className="text-xs text-muted-foreground">
									{payload.values.length}{" "}
									{payload.values.length === 1 ? "line" : "lines"}
								</span>
							</div>
							<div className="overflow-x-auto rounded-md border">
								<table className="w-full border-collapse text-sm">
									<tbody>
										{payload.values.map((v) => {
											const parsed = parseLineItemId(v.lineItemId);
											const field = parsed
												? byField.get(parsed.field)
												: undefined;
											return (
												<tr
													key={v.lineItemId}
													className="border-b last:border-b-0 align-top"
												>
													<td className="w-20 px-3 py-1.5 font-mono text-xs text-muted-foreground">
														{parsed?.field ?? v.lineItemId}
														{parsed && parsed.occurrence > 1 && (
															<span className="ml-1 opacity-60">
																#{parsed.occurrence}
															</span>
														)}
													</td>
													<td className="px-3 py-1.5">
														{field?.caption ?? (
															// A filed line with no caption means the payload
															// carries a line the form model does not
															// describe. That is a real gap to chase, not a
															// rendering problem, so it is labelled rather
															// than hidden.
															<span className="text-amber-700 dark:text-amber-400">
																Not described by the form model — line{" "}
																{v.lineItemId}
															</span>
														)}
													</td>
													<td className="w-40 px-3 py-1.5 text-right tabular-nums">
														{formatValue(v.value, field?.kind)}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					);
				})}
				<p className="text-xs text-muted-foreground">
					Figures come from the computed return, and captions from the same form
					definitions the engine files against — this is a view of the payload,
					not a second calculation of it. A line shown in amber is filed but not
					described by the form model.
				</p>
			</CardContent>
		</Card>
	);
}
