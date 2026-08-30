/**
 * The CRA-numbered schedule registry — mirrors the real T2 editor's left nav.
 *
 * This array is the single source of truth: the nav tree, the `ScheduleKey`
 * union and the key → schema lookup are all derived from it, so adding a
 * schedule is a new file in `./schedules/` plus one line here.
 */
import type { ReturnInput } from "../_lib/return-input";
import { alberta } from "./schedules/alberta";
import { albertaContinuity } from "./schedules/alberta-continuity";
import { albertaIeg } from "./schedules/alberta-ieg";
import { albertaOtherCredits3 } from "./schedules/alberta-schedule3";
import { albertaForeignInvestment4 } from "./schedules/alberta-schedule4";
import { albertaRoyaltyDeduction5 } from "./schedules/alberta-schedule5";
import { albertaRoyaltyCredit6 } from "./schedules/alberta-schedule6";
import { albertaRoyaltySupplemental7 } from "./schedules/alberta-schedule7";
import { albertaPoliticalContributions8 } from "./schedules/alberta-schedule8";
import { albertaSredCredit9 } from "./schedules/alberta-schedule9";
import { albertaManufacturing11 } from "./schedules/alberta-schedule11";
import { albertaResourceDeductions15 } from "./schedules/alberta-schedule15";
import { balanceSheet } from "./schedules/balance-sheet";
import { capital } from "./schedules/capital";
import { capitalGains } from "./schedules/capital-gains";
import { cca } from "./schedules/cca";
import { credits } from "./schedules/credits";
import type { ScheduleDef, ScheduleProgram } from "./schedules/define";
import { dividends } from "./schedules/dividends";
import { donations } from "./schedules/donations";
import { eifel } from "./schedules/eifel";
import { firstReturn } from "./schedules/first-return";
import { foreign } from "./schedules/foreign";
import { gifiNotes } from "./schedules/gifi-notes";
import { identification } from "./schedules/identification";
import { incomeStatement } from "./schedules/income-statement";
import { internetBusiness } from "./schedules/internet-business";
import { losses } from "./schedules/losses";
import { netIncome } from "./schedules/net-income";
import { payments } from "./schedules/payments";
import { preferredShares } from "./schedules/preferred-shares";
import { provincialAllocation } from "./schedules/provincial-allocation";
import { quebec } from "./schedules/quebec";
import { reserves } from "./schedules/reserves";
import { sbd } from "./schedules/sbd";
import { shareholders } from "./schedules/shareholders";

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
	albertaContinuity,
	albertaIeg,
	albertaOtherCredits3,
	albertaForeignInvestment4,
	albertaRoyaltyDeduction5,
	albertaRoyaltyCredit6,
	albertaRoyaltySupplemental7,
	albertaPoliticalContributions8,
	albertaSredCredit9,
	albertaManufacturing11,
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
