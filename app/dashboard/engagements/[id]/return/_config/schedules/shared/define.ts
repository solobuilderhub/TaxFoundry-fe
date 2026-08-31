import type { FormSchema } from "@classytic/formkit/server";
import type { ReactNode } from "react";
import type { Control } from "react-hook-form";
import type { Client } from "@/api/clients";
import type { ComputedReturn } from "@/api/computed-returns";
import type { EngagementYear } from "@/api/engagements";
import type { ReturnInput } from "../../../_lib/return-input";

/**
 * One schedule = one file exporting one of these. Everything the app needs per
 * schedule lives here — the nav chip, the form schema, and the `ReturnInput`
 * key it saves under — so adding a schedule is a new file plus one line in
 * `registry.ts`, not five edits spread across a barrel.
 */
/** The filing programs a schedule applies to. */
export type ScheduleProgram = "T2" | "AT1" | "CO17";

export type ScheduleDef<K extends keyof ReturnInput = keyof ReturnInput> = {
  /** The `ReturnInput` slice this schedule reads and writes. */
  key: K;
  /** CRA schedule / jacket line number — the mono chip in the schedule tree. */
  num: string;
  label: string;
  hint: string;
  schema: FormSchema;
  /**
   * Programs this schedule appears for. Omitted = every program (the federal
   * schedules a provincial return still consumes). A program-specific schedule
   * (e.g. the Québec CO-17 block) lists only its own program.
   */
  programs?: readonly ScheduleProgram[];
  /**
   * A paper-exact "Form View" — a second, switchable rendering of the SAME
   * `control` the guided card editor uses (see `return-editor.tsx`'s
   * `ScheduleForm`, which passes `form.control` from `SchemaForm`'s
   * `children(form)` render-prop so both views share one form-state instance
   * and switching between them never drops an in-progress edit). Omitted for
   * every schedule that doesn't have one yet — the toggle only shows when
   * this is defined.
   */
  formView?: (props: {
    control: Control<Record<string, unknown>>;
    disabled?: boolean;
    computed?: ComputedReturn;
    engagement?: EngagementYear;
    client?: Client;
  }) => ReactNode;
};

/** Identity helper — infers `key` as a literal so the registry can derive `ScheduleKey`. */
export const defineSchedule = <K extends keyof ReturnInput>(d: ScheduleDef<K>): ScheduleDef<K> => d;
