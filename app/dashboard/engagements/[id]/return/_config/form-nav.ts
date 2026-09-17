import type { ScheduleKey } from "./registry";

/**
 * A paper Form View's cross-reference badge → the schedule it should open.
 *
 * Lives here, apart from both the editor and the rendering primitives, because
 * both need it and for opposite reasons: the editor asks "which schedule does
 * this badge open?", while `PaperLineRef` asks "is there one at all?" — and a
 * badge that cannot answer the second question honestly is the bug this file
 * exists to fix.
 *
 * `registry` is imported TYPE-ONLY on purpose. The value import would close a
 * cycle (registry → schedules → paper views → primitives → here), and a
 * type-only import is erased at compile time, so the runtime graph stays
 * acyclic while the values below are still checked against the real keys.
 *
 * Every id here is one a generated layout actually emits in a `from`/`to`
 * (`grep 'form: "' schedules/at1/paper/generated/*.ts`), and every value is
 * checked against that schedule's own `num`. Both halves had gone wrong:
 *
 *   - **Not one federal form was mapped.** The layouts reference T2SCH1,
 *     T2SCH4, T2SCH8 and T2SCH13 seventy-odd times between them, and
 *     `onNavigate` returned early on every one — a badge that looked
 *     clickable, read "→ T2SCH4 line 901", and did nothing when clicked.
 *   - **`AT1SCH03`/`AT1SCH04` matched nothing.** The layouts spell those two
 *     without the leading zero (`AT1SCH3`, `AT1SCH4`), so the entries were
 *     dead weight and the real ids were unmapped. Both spellings are accepted
 *     rather than picking a winner: the id comes from ca-tax, and this file
 *     should not be what breaks when it is regularized.
 *
 * Ids deliberately absent: `T2` (the federal jacket — spread across several
 * schedules here rather than being one page), `T661` (SR&ED) and `T2SCH73`.
 * None has an editor to open, so their badges render as plain text.
 */
export const FORM_ID_TO_SCHEDULE_KEY: Record<
	string,
	ScheduleKey | "schedule2" | "schedule10" | "schedule12"
> = {
	AT1: "alberta",
	AT1SCH1: "albertaSbd",
	AT1SCH2: "schedule2",
	AT1SCH3: "albertaOtherCredits3",
	AT1SCH03: "albertaOtherCredits3",
	AT1SCH4: "albertaForeignInvestment4",
	AT1SCH04: "albertaForeignInvestment4",
	AT1SCH10: "schedule10",
	AT1SCH12: "schedule12",
	AT1SCH13: "cca",
	AT1SCH15: "albertaResourceDeductions15",
	AT1SCH17: "reserves",
	AT1SCH20: "albertaDonations",
	AT1SCH21: "albertaContinuity",
	AT1SCH29: "albertaIeg",

	// Federal targets, each verified against the schedule's own `num`.
	T2SCH1: "netIncome", // 001 Net Income for Tax (S1)
	T2SCH2: "donations", // 002 Donations & Gifts (S2)
	T2SCH4: "losses", // 004 Losses (S4)
	T2SCH5: "provincialAllocation", // 005 Provincial Allocation (S5 Part 1)
	T2SCH6: "capitalGains", // 006 Capital Gains (S6)
	T2SCH8: "cca", // 008 Capital Cost Allowance (S8)
	T2SCH13: "reserves", // 013 Continuity of Reserves (S13)
	T2SCH130: "eifel", // Interest Limitation (EIFEL)
};

/**
 * Whether a cross-reference to `form` can actually open something.
 *
 * Used to decide whether a badge is a button or plain text. A reference this
 * app cannot follow is still worth PRINTING — "→ T661 line 460" tells the
 * preparer where the figure comes from, which is the form's own language — it
 * just must not pretend to be a link.
 */
export const canNavigateToForm = (form: string | undefined): boolean =>
	!!form && form in FORM_ID_TO_SCHEDULE_KEY;
