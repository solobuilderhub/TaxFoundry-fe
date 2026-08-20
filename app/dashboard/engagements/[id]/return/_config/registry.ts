/**
 * The CRA-numbered schedule registry — mirrors the real T2 editor's left nav.
 *
 * This array is the single source of truth: the nav tree, the `ScheduleKey`
 * union and the key → schema lookup are all derived from it, so adding a
 * schedule is a new file in `./schedules/` plus one line here.
 */
import type { ReturnInput } from "../_lib/return-input";
import { balanceSheet } from "./schedules/balance-sheet";
import { capitalGains } from "./schedules/capital-gains";
import { cca } from "./schedules/cca";
import { credits } from "./schedules/credits";
import type { ScheduleDef } from "./schedules/define";
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
import { capital } from "./schedules/capital";
import { payments } from "./schedules/payments";
import { preferredShares } from "./schedules/preferred-shares";
import { provincialAllocation } from "./schedules/provincial-allocation";
import { alberta } from "./schedules/alberta";
import { quebec } from "./schedules/quebec";
import { reserves } from "./schedules/reserves";
import { sbd } from "./schedules/sbd";
import { shareholders } from "./schedules/shareholders";
import type { ScheduleProgram } from "./schedules/define";

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
export const SCHEDULE_KEYS_MATCH_RETURN_INPUT: Exact<ScheduleKey, keyof ReturnInput> = true;

const BY_KEY = Object.fromEntries(SCHEDULES.map((s) => [s.key, s])) as Record<
  ScheduleKey,
  ScheduleDef
>;

/** Nav metadata only — no form schemas, so nav-only consumers stay light. */
export const SCHEDULE_TREE: { key: ScheduleKey; num: string; label: string; hint: string }[] =
  SCHEDULES.map(({ key, num, label, hint }) => ({ key, num, label, hint }));

/**
 * The schedule tree for one filing program — drops schedules that don't apply
 * (a `programs`-less schedule applies to every program). So a CO17 engagement
 * shows the Québec block and hides nothing federal it still consumes, while a T2
 * engagement never sees the Québec block.
 */
export const scheduleTreeFor = (program: string) =>
  SCHEDULES.filter((s) => !s.programs || s.programs.includes(program as ScheduleProgram)).map(
    ({ key, num, label, hint }) => ({ key, num, label, hint }),
  );

export const schemaFor = (key: ScheduleKey) => BY_KEY[key].schema;
