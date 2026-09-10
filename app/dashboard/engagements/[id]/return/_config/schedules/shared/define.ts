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

/**
 * Switch the active schedule and briefly highlight one of its lines — the
 * "jump" behind a paper Form View's "→ Schedule X, line Y" cross-reference
 * badges (`ProvenanceBadge`'s `to`). `form` is a `FormDefinition.id`
 * (`"AT1SCH12"`), not a `ScheduleKey` — resolving one to the other is
 * `return-editor.tsx`'s `FORM_ID_TO_SCHEDULE_KEY`'s job, not the caller's.
 */
export type NavigateToLine = (form: string, line: string) => void;

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
    /** Jump to another schedule and highlight one of its lines — undefined when the host hasn't wired navigation (falls back to an inert badge). */
    onNavigate?: NavigateToLine;
    /** The line to scroll to and briefly highlight on THIS schedule, when navigation just landed here. */
    highlightLine?: string;
    /**
     * The whole working return, for a figure this schedule displays but
     * another schedule's slice owns — a T2 amount a Schedule 21 box reads from
     * Schedule 12's slice, say. Read-only here; write through `writeInput`.
     */
    returnInput?: ReturnInput;
    /**
     * Persist one value into ANOTHER schedule's slice of the working return,
     * immediately. Not for this schedule's own fields — bind those through
     * `control`, or this schedule's next save overwrites the write.
     */
    writeInput?: (path: string, value: number | undefined) => Promise<void>;
  }) => ReactNode;
};

/** Identity helper — infers `key` as a literal so the registry can derive `ScheduleKey`. */
export const defineSchedule = <K extends keyof ReturnInput>(d: ScheduleDef<K>): ScheduleDef<K> => d;
