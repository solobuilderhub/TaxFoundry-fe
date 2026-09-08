/**
 * The form registry — every CRA and TRA form this app knows about.
 *
 * ── Migration state: 2 of 42 forms vendored ─────────────────────────────────
 *
 * These definitions are moving out of `@classytic/ca-tax` and into this repo,
 * one form at a time. Until the last one lands, the registry is a HYBRID: a
 * vendored definition in `./definitions/` wins, and every form not yet vendored
 * is re-exported from the package unchanged. Consumers import from `@/forms`
 * and cannot tell the difference, so a form can be migrated without touching
 * anything downstream.
 *
 * Why move at all: a form definition is the app's promise that the number
 * beside a box is the number on the printed form. Owning them means a wrong
 * caption or a missing line is a one-file fix here, rather than an upstream
 * release we wait on. See `./README.md` for which forms are known to be weak.
 *
 * To vendor the next one:
 *   npx tsx scripts/vendor-form.ts <FORM_ID>     # writes ./definitions/<id>.ts
 *   …then add it to VENDORED below and re-export its constant.
 *
 * The re-export list below is deliberately explicit rather than `export *`.
 * `@classytic/ca-tax/t2` also exports 100+ compute functions and three tax
 * engines; the frontend has no business reaching any of them, and listing the
 * form surface by name keeps that boundary visible — and shrinking.
 */
import { FORMS as UPSTREAM_FORMS } from "@classytic/ca-tax/forms";
import { AT1_SCHEDULE_12 } from "./definitions/at1sch12";
import { AT1_SCHEDULE_21 } from "./definitions/at1sch21";
import type { FormDefinition } from "./types";

// ── Vendored — definitions owned by this repo ───────────────────────────────

export { AT1_SCHEDULE_12, AT1_SCHEDULE_21 };
export {
	AT1_SCHEDULE_12_PAIRS,
	type Schedule12Pair,
} from "./definitions/at1sch12.pairs";
export {
	AT1_SCHEDULE_21_BLOCKS,
	AT1_SCHEDULE_21_CONTINUITY_ORDER,
	AT1_SCHEDULE_21_POOLS,
	type Schedule21Block,
	type Schedule21Pool,
	type Schedule21RowKind,
} from "./definitions/at1sch21.pools";

/**
 * Every vendored definition, in migration order. Adding an entry here is what
 * makes it take precedence in `FORMS` below.
 */
const VENDORED: readonly FormDefinition[] = [AT1_SCHEDULE_12, AT1_SCHEDULE_21];

// ── Not yet vendored — still the package's definitions ──────────────────────

export {
	AT1_JACKET,
	AT1_SCHEDULE_1,
	AT1_SCHEDULE_2,
	AT1_SCHEDULE_3,
	AT1_SCHEDULE_4,
	AT1_SCHEDULE_5,
	AT1_SCHEDULE_6,
	AT1_SCHEDULE_7,
	AT1_SCHEDULE_8,
	AT1_SCHEDULE_9,
	AT1_SCHEDULE_10,
	AT1_SCHEDULE_13,
	AT1_SCHEDULE_15,
	AT1_SCHEDULE_17,
	AT1_SCHEDULE_20,
	AT1_SCHEDULE_29,
	T2_SCHEDULE_1,
	T2_SCHEDULE_2,
	T2_SCHEDULE_5,
	T2_SCHEDULE_8,
	T2_SCHEDULE_13,
	T2_SCHEDULE_31,
	T2_SCHEDULE_33,
	T2_SCHEDULE_50,
} from "@classytic/ca-tax/t2";

/**
 * Per-schedule tables whose shape a flat field list can't express — matrix
 * columns, pool grids, federal/Alberta line pairings. Still upstream; each moves
 * alongside the form it belongs to (Schedule 21's already has, above).
 */
export {
	AT1_SCHEDULE_13_COLUMNS,
	AT1_SCHEDULE_17_RESERVES,
	SCHEDULE_8_COLUMNS,
} from "@classytic/ca-tax/t2";

// ── The registry ────────────────────────────────────────────────────────────

const vendoredById = new Map(VENDORED.map((form) => [form.id, form]));

/**
 * Every form, in the package's order, with vendored definitions substituted in.
 *
 * Order is preserved so that anything iterating the registry — the line-citation
 * check, a future coverage report — reads the same before and after a form is
 * vendored.
 */
export const FORMS: readonly FormDefinition[] = (
	UPSTREAM_FORMS as readonly FormDefinition[]
).map((form) => vendoredById.get(form.id) ?? form);

/** Look up one form by `id`, e.g. `"AT1SCH21"`. */
export const formById = (id: string): FormDefinition | undefined =>
	FORMS.find((form) => form.id === id);

/** True once a form's definition lives in this repo rather than the package. */
export const isVendored = (id: string): boolean => vendoredById.has(id);

export { fieldsInSection, scheduleTwentyOneLineId } from "./helpers";
export type * from "./types";
