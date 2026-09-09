/**
 * The CRA-numbered schedule registry — mirrors the real T2 editor's left nav.
 *
 * This array is the single source of truth: the nav tree, the `ScheduleKey`
 * union and the key → schema lookup are all derived from it, so adding a
 * schedule is a new file in `./schedules/{t2,at1,co17}/` plus one line here.
 *
 * The schedules directory is split by which program OWNS the schedule, not by
 * who reads it: `t2/` holds the base federal schedules (AT1/CO17 both compose
 * FROM these — e.g. AT1's own CCA reconciliation needs the federal Schedule 8
 * entries from `t2/cca.ts` — that doesn't make CCA an AT1 schedule), `at1/`
 * holds schedules that exist only because of the Alberta AT1 return, `co17/`
 * the one Québec-only schedule, `shared/` the `ScheduleDef` infrastructure
 * every schedule file imports regardless of program.
 */
import type { ReturnInput } from "../_lib/return-input";
import { alberta } from "./schedules/at1/alberta";
import { albertaContinuity } from "./schedules/at1/alberta-continuity";
import { albertaDonations } from "./schedules/at1/alberta-donations";
import { albertaIeg } from "./schedules/at1/alberta-ieg";
import { albertaSbd } from "./schedules/at1/alberta-sbd";
import { albertaOtherCredits3 } from "./schedules/at1/alberta-schedule3";
import { albertaForeignInvestment4 } from "./schedules/at1/alberta-schedule4";
import { albertaSchedule12 } from "./schedules/at1/alberta-schedule12";
import { albertaResourceDeductions15 } from "./schedules/at1/alberta-schedule15";
import { albertaSchedule18Abil } from "./schedules/at1/alberta-schedule18";
import { quebec } from "./schedules/co17/quebec";
import type { ScheduleDef, ScheduleProgram } from "./schedules/shared/define";
import { balanceSheet } from "./schedules/t2/balance-sheet";
import { capital } from "./schedules/t2/capital";
import { capitalGains } from "./schedules/t2/capital-gains";
import { cca } from "./schedules/t2/cca";
import { credits } from "./schedules/t2/credits";
import { dividends } from "./schedules/t2/dividends";
import { donations } from "./schedules/t2/donations";
import { eifel } from "./schedules/t2/eifel";
import { firstReturn } from "./schedules/t2/first-return";
import { foreign } from "./schedules/t2/foreign";
import { gifiNotes } from "./schedules/t2/gifi-notes";
import { identification } from "./schedules/t2/identification";
import { incomeStatement } from "./schedules/t2/income-statement";
import { internetBusiness } from "./schedules/t2/internet-business";
import { losses } from "./schedules/t2/losses";
import { netIncome } from "./schedules/t2/net-income";
import { payments } from "./schedules/t2/payments";
import { preferredShares } from "./schedules/t2/preferred-shares";
import { provincialAllocation } from "./schedules/t2/provincial-allocation";
import { reserves } from "./schedules/t2/reserves";
import { sbd } from "./schedules/t2/sbd";
import { shareholders } from "./schedules/t2/shareholders";

/** In return order — this is the order the preparer sees in the schedule tree. */
export const SCHEDULES = [
	identification,
	balanceSheet,
	incomeStatement,
	gifiNotes,
	netIncome,
	reserves,
	donations,
	dividends,
	preferredShares,
	capitalGains,
	losses,
	sbd,
	capital,
	eifel,
	cca,
	credits,
	foreign,
	provincialAllocation,
	quebec,
	alberta,
	albertaSbd,
	albertaDonations,
	albertaContinuity,
	albertaIeg,
	albertaOtherCredits3,
	albertaForeignInvestment4,
	albertaSchedule12,
	albertaSchedule18Abil,
	albertaResourceDeductions15,
	payments,
	internetBusiness,
	firstReturn,
	shareholders,
] as const;

export type ScheduleKey = (typeof SCHEDULES)[number]["key"];

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;

/**
 * Compile-time pin: the registry and the persisted `ReturnInput` shape must
 * cover exactly the same schedules. Adding a slice to `ReturnInput` without
 * registering a schedule (or vice versa) fails here rather than showing up as
 * a schedule that silently saves nowhere.
 */
export const SCHEDULE_KEYS_MATCH_RETURN_INPUT: Exact<
	ScheduleKey,
	keyof ReturnInput
> = true;

const BY_KEY = Object.fromEntries(SCHEDULES.map((s) => [s.key, s])) as Record<
	ScheduleKey,
	ScheduleDef
>;

/** Nav metadata only — no form schemas, so nav-only consumers stay light. */
export const SCHEDULE_TREE: {
	key: ScheduleKey;
	num: string;
	label: string;
	hint: string;
	programs?: readonly ScheduleProgram[];
}[] = SCHEDULES.map(({ key, num, label, hint, programs }) => ({
	key,
	num,
	label,
	hint,
	...(programs ? { programs } : {}),
}));

/**
 * The schedule tree for one filing program — drops schedules that don't apply
 * (a `programs`-less schedule applies to every program). So a CO17 engagement
 * shows the Québec block and hides nothing federal it still consumes, while a T2
 * engagement never sees the Québec block.
 *
 * `programs` rides along on each entry so a consumer can filter further client-
 * side (e.g. "show only this program's OWN schedules, not the federal ones it
 * also consumes as input") — see `isProgramSpecific` below.
 */
export const scheduleTreeFor = (program: string) =>
	SCHEDULES.filter(
		(s) => !s.programs || s.programs.includes(program as ScheduleProgram),
	).map(({ key, num, label, hint, programs }) => ({
		key,
		num,
		label,
		hint,
		...(programs ? { programs } : {}),
	}));

/**
 * True for a schedule that belongs ONLY to `program` — e.g. an AT1 engagement's
 * "Alberta AT1 — required fields" block, as opposed to Schedule 8 (CCA), which
 * has no `programs` restriction because Alberta's own CCA reconciliation needs
 * the federal figures entered there too. Drives the sidebar's program filter:
 * narrowing to "just AT1" should hide the shared federal schedules, not the
 * whole return.
 */
export const isProgramSpecific = (
	s: { programs?: readonly ScheduleProgram[] },
	program: string,
) => !!s.programs && s.programs.every((p) => p === program);

export const schemaFor = (key: ScheduleKey) => BY_KEY[key].schema;

/** `undefined` when the schedule has no paper Form View yet — drives whether the editor shows the Guided/Form View toggle at all. */
export const formViewFor = (key: ScheduleKey) => BY_KEY[key].formView;
