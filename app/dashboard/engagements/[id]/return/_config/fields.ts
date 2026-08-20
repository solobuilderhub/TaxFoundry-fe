/**
 * Schedule-authoring builders.
 *
 * Schemas are authored against **`@classytic/formkit/server`** — the entry
 * documented as RSC-safe (schema utilities + builders, no React). The other two
 * candidates both drag a renderer along: `@classytic/fluid/formkit` is
 * `"use client"` and re-exports the shadcn adapter, and formkit's main entry
 * pulls `FormGenerator`/`FormSystemContext` into the graph. A schedule is plain
 * data, so `./schedules/*` stays importable from a server component, a test, or
 * a node script; the client boundary belongs in the component that renders it
 * (`components/return-editor.tsx`, which takes `SchemaForm` from fluid).
 *
 * `fieldsFor<T>()` wraps formkit's `field.for` so a field name is checked
 * against the persisted slice type ONCE per schedule, instead of restating an
 * explicit `<TFieldValues>` generic on all ~90 call sites.
 */
import { field, type BaseField } from "@classytic/formkit/server";
import type { FieldValues } from "react-hook-form";

type NumberProps = Parameters<typeof field.number>[2];

/**
 * A money field: same authoring API as `field.number`, but rendered by fluid's
 * `MoneyInput` (registered as the `money` type in `FORM_COMPONENTS`). Values
 * stay in whole dollars — `MoneyField` bridges to minor units for display.
 */
export const money = (name: string, label: string, props?: NumberProps): BaseField => ({
  ...field.number(name, label, props),
  type: "money",
});

/**
 * Path-checked builders for one schedule's persisted slice — every field name
 * is verified against `T`, so renaming a key in `_lib/return-input.ts` breaks
 * the schema at compile time instead of silently orphaning saved data.
 *
 * Array/group ITEM fields use relative names and so are authored with the plain
 * `field.*` / `money` builders (formkit types `itemFields` as `BaseField[]`).
 */
export function fieldsFor<T extends FieldValues>() {
  const f = field.for<T>();
  return {
    ...f,
    money: (
      name: Parameters<typeof f.number>[0],
      label: string,
      props?: NumberProps,
    ): BaseField<T> => ({ ...f.number(name, label, props), type: "money" }),
  };
}
