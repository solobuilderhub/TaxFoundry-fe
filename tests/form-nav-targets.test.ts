import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	canNavigateToForm,
	FORM_ID_TO_SCHEDULE_KEY,
} from "../app/dashboard/engagements/[id]/return/_config/form-nav";

/**
 * Every cross-reference badge either opens something or does not look like a
 * link.
 *
 * A paper Form View prints the form's own cross-references — "→ T2SCH4 line
 * 901" — and renders each as a button that jumps to that schedule and
 * highlights the line. The ids come from the GENERATED layouts (ultimately
 * from ca-tax), and the map that resolves them is hand-written, so the two can
 * drift silently: a badge whose id is unmapped still renders as a button, and
 * clicking it does nothing at all. Nothing throws, nothing logs — it simply
 * fails to respond, which reads as the app being broken.
 *
 * Two real cases this catches, both live before it was written:
 *
 *   - Not one FEDERAL form was mapped, while the layouts reference T2SCH1,
 *     T2SCH4, T2SCH8 and T2SCH13 seventy-odd times.
 *   - `AT1SCH03`/`AT1SCH04` were mapped, but the layouts spell those ids
 *     WITHOUT the leading zero — so the entries matched nothing and the real
 *     ids were unmapped.
 *
 * The test reads the ids out of the generated files rather than restating
 * them, so a newly emitted cross-reference to an unmapped form fails here
 * instead of shipping as a dead badge.
 */

const GENERATED_DIR = join(
	__dirname,
	"../app/dashboard/engagements/[id]/return/_config/schedules/at1/paper/generated",
);

/**
 * Forms referenced by the printed pages that this app has no editor for.
 *
 * Being on this list is not a gap to close — it is a statement that the
 * reference is EXTERNAL and must render as plain text rather than a button.
 * Adding an id here should mean "there is genuinely no page to open", never
 * "the link is broken and this quiets the test".
 */
const NO_EDITOR: Record<string, string> = {
	T2: "The federal T2 jacket — spread across several schedules here rather than being one page.",
	T661: "Federal SR&ED claim form; not modelled in this app.",
	T2SCH73: "Federal income-inclusion summary; not modelled in this app.",
};

const SCHEDULES_DIR = join(
	__dirname,
	"../app/dashboard/engagements/[id]/return/_config/schedules",
);

/** Every `key:` a schedule file declares, read from source. */
function scheduleKeysFromSource(): Set<string> {
	const keys = new Set<string>();
	const walk = (dir: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const p = join(dir, entry.name);
			if (entry.isDirectory()) walk(p);
			else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
				for (const m of readFileSync(p, "utf8").matchAll(
					/^\s*key:\s*"([^"]+)"/gm,
				)) {
					keys.add(m[1] as string);
				}
			}
		}
	};
	walk(SCHEDULES_DIR);
	return keys;
}

/** Every `form: "…"` id the generated layouts actually emit. */
function referencedFormIds(): string[] {
	const ids = new Set<string>();
	for (const file of readdirSync(GENERATED_DIR).filter((f) =>
		f.endsWith(".ts"),
	)) {
		const src = readFileSync(join(GENERATED_DIR, file), "utf8");
		for (const m of src.matchAll(/form:\s*"([^"]+)"/g)) ids.add(m[1] as string);
	}
	return [...ids].sort();
}

describe("paper Form View cross-reference targets", () => {
	const referenced = referencedFormIds();

	it("finds cross-references to check (guards against the scan silently matching nothing)", () => {
		expect(referenced.length).toBeGreaterThan(10);
	});

	it("every referenced form is either navigable or explicitly external", () => {
		const unaccounted = referenced.filter(
			(id) => !canNavigateToForm(id) && !(id in NO_EDITOR),
		);
		expect(
			unaccounted,
			"referenced by a generated layout but neither mapped in FORM_ID_TO_SCHEDULE_KEY " +
				"nor listed in NO_EDITOR — these render as buttons that do nothing when clicked",
		).toEqual([]);
	});

	it("maps the federal forms the layouts lean on most", () => {
		// Named explicitly: these were the ones silently dead, and a regression
		// would otherwise only show up as a badge nobody happened to click.
		for (const id of ["T2SCH1", "T2SCH4", "T2SCH8", "T2SCH13"]) {
			expect(canNavigateToForm(id), `${id} must be navigable`).toBe(true);
		}
	});

	it("uses the id spelling the layouts actually emit for AT1 Schedules 3 and 4", () => {
		expect(referenced).toContain("AT1SCH3");
		expect(referenced).toContain("AT1SCH4");
		expect(canNavigateToForm("AT1SCH3")).toBe(true);
		expect(canNavigateToForm("AT1SCH4")).toBe(true);
	});

	it("points every mapping at a schedule that exists", () => {
		// The read-only nav entries have no registry row of their own — they are
		// special-cased in the editor, the same way "Tax Summary" is.
		const READ_ONLY = new Set(["schedule2", "schedule10", "schedule12"]);
		// Read the keys textually rather than importing the registry: importing it
		// pulls every schedule, its form views and the whole component graph into
		// this node test, which does not resolve the app's `@/` alias. The keys
		// themselves are checked by the compiler at the map's own declaration —
		// this only guards against a schedule being deleted or renamed.
		const keys = scheduleKeysFromSource();
		const dangling = Object.entries(FORM_ID_TO_SCHEDULE_KEY)
			.filter(([, key]) => !keys.has(key) && !READ_ONLY.has(key))
			.map(([id, key]) => `${id} → ${key}`);
		expect(dangling, "mapped to a schedule key that no longer exists").toEqual(
			[],
		);
	});

	it("treats an unmapped form as not navigable", () => {
		expect(canNavigateToForm("T661")).toBe(false);
		expect(canNavigateToForm(undefined)).toBe(false);
		expect(canNavigateToForm("NOT_A_FORM")).toBe(false);
	});
});
