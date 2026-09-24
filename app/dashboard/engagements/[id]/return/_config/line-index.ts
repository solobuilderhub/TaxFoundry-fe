import type { PaperField } from "./schedules/at1/paper/generated/jacket.layout";
import { AT1_JACKET_FIELDS } from "./schedules/at1/paper/generated/jacket.layout";
import { AT1_SCHEDULE_1_FIELDS } from "./schedules/at1/paper/generated/schedule1.layout";
import { AT1_SCHEDULE_2_FIELDS } from "./schedules/at1/paper/generated/schedule2.layout";
import { AT1_SCHEDULE_3_FIELDS } from "./schedules/at1/paper/generated/schedule3.layout";
import { AT1_SCHEDULE_4_FIELDS } from "./schedules/at1/paper/generated/schedule4.layout";
import { AT1_SCHEDULE_10_FIELDS } from "./schedules/at1/paper/generated/schedule10.layout";
import { AT1_SCHEDULE_12_FIELDS } from "./schedules/at1/paper/generated/schedule12.layout";
import { AT1_SCHEDULE_13_FIELDS } from "./schedules/at1/paper/generated/schedule13.layout";
import { AT1_SCHEDULE_15_FIELDS } from "./schedules/at1/paper/generated/schedule15.layout";
import { AT1_SCHEDULE_16_FIELDS } from "./schedules/at1/paper/generated/schedule16.layout";
import { AT1_SCHEDULE_17_FIELDS } from "./schedules/at1/paper/generated/schedule17.layout";
import { AT1_SCHEDULE_18_FIELDS } from "./schedules/at1/paper/generated/schedule18.layout";
import { AT1_SCHEDULE_20_FIELDS } from "./schedules/at1/paper/generated/schedule20.layout";
import { AT1_SCHEDULE_21_FIELDS } from "./schedules/at1/paper/generated/schedule21.layout";
import { AT1_SCHEDULE_29_FIELDS } from "./schedules/at1/paper/generated/schedule29.layout";

/**
 * Every numbered line on the AT1 forms, for "Go to line".
 *
 * Built from the generated layouts — the same form definitions the views
 * render — so a line found here is a line the form it opens actually prints.
 * Nothing is typed by hand: a caption or number that changes in ca-tax
 * changes here on the next `generate:forms`.
 */
export interface LineHit {
	/** The form id `onNavigate` takes ("AT1", "AT1SCH1", …). */
	formId: string;
	/** The schedule number as the nav shows it ("000", "001", …). */
	num: string;
	/** The printed three-digit line. */
	line: string;
	/** The nine-digit id, which the views highlight on. */
	lineId: string;
	caption: string;
}

const SOURCES: readonly {
	formId: string;
	num: string;
	fields: readonly PaperField[];
}[] = [
	{ formId: "AT1", num: "000", fields: AT1_JACKET_FIELDS },
	{ formId: "AT1SCH1", num: "001", fields: AT1_SCHEDULE_1_FIELDS },
	{ formId: "AT1SCH2", num: "002", fields: AT1_SCHEDULE_2_FIELDS },
	{ formId: "AT1SCH3", num: "003", fields: AT1_SCHEDULE_3_FIELDS },
	{ formId: "AT1SCH4", num: "004", fields: AT1_SCHEDULE_4_FIELDS },
	{ formId: "AT1SCH10", num: "010", fields: AT1_SCHEDULE_10_FIELDS },
	{ formId: "AT1SCH12", num: "012", fields: AT1_SCHEDULE_12_FIELDS },
	{ formId: "AT1SCH13", num: "013", fields: AT1_SCHEDULE_13_FIELDS },
	{ formId: "AT1SCH15", num: "015", fields: AT1_SCHEDULE_15_FIELDS },
	{ formId: "AT1SCH16", num: "016", fields: AT1_SCHEDULE_16_FIELDS },
	{ formId: "AT1SCH17", num: "017", fields: AT1_SCHEDULE_17_FIELDS },
	{ formId: "AT1SCH18", num: "018", fields: AT1_SCHEDULE_18_FIELDS },
	{ formId: "AT1SCH20", num: "020", fields: AT1_SCHEDULE_20_FIELDS },
	{ formId: "AT1SCH21", num: "021", fields: AT1_SCHEDULE_21_FIELDS },
	{ formId: "AT1SCH29", num: "029", fields: AT1_SCHEDULE_29_FIELDS },
];

export const AT1_LINE_INDEX: readonly LineHit[] = SOURCES.flatMap((s) => {
	const seen = new Set<string>();
	return s.fields.flatMap((f) => {
		const line = /^\d{9}$/.test(f.line) ? f.line.slice(3, 6) : f.line;
		// One hit per printed line — a repeating row is one place to go.
		if (seen.has(line)) return [];
		seen.add(line);
		return [
			{
				formId: s.formId,
				num: s.num,
				line,
				lineId: f.line,
				caption: f.caption,
			},
		];
	});
});

/**
 * What a query finds, best first.
 *
 *   "62" / "062"            that line on every form, the jacket first
 *   "1 031" / "S1-031"      line 031 on Schedule 1
 *   "sch 21" / "S21"        (a schedule alone is not a line — no hits)
 *   "taxable income"        captions containing every word
 */
export function findLines(query: string, limit = 12): LineHit[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	const pad = (n: string) => n.padStart(3, "0");

	const scoped =
		/^(?:s(?:ch(?:edule)?)?\.?\s*)?(\d{1,3})\s*[-:/\s]\s*(\d{1,3})$/.exec(q);
	if (scoped) {
		const [, sch, line] = scoped;
		return AT1_LINE_INDEX.filter(
			(h) => h.num === pad(sch as string) && h.line === pad(line as string),
		).slice(0, limit);
	}
	if (/^\d{1,3}$/.test(q)) {
		return AT1_LINE_INDEX.filter((h) => h.line === pad(q)).slice(0, limit);
	}
	const words = q.split(/\s+/);
	return AT1_LINE_INDEX.filter((h) => {
		const c = h.caption.toLowerCase();
		return words.every((w) => c.includes(w));
	}).slice(0, limit);
}
