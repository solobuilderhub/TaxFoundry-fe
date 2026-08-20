"use client";

import { useController } from "react-hook-form";
import { MoneyInput } from "@classytic/fluid/forms/money-input";
import { fromMajor, toMajor, money } from "@classytic/primitives/money";
import type { FieldComponentProps } from "@classytic/formkit";
import { DateTimeField } from "./datetime-field";

const CURRENCY = "CAD";

/**
 * formkit `money` field → fluid `MoneyInput`.
 *
 * The tax engine works in whole dollars (major units, GIFI convention) but
 * MoneyInput and `@classytic/primitives` money are minor-unit (cents). This
 * adapter bridges the two with `fromMajor`/`toMajor`, so the stored form value
 * stays in whole dollars (engine unchanged) while the UI gets fluid's proper
 * currency input (symbol, grouping, decimals).
 */
export function MoneyField({ field, control, disabled, error }: FieldComponentProps) {
  const f = field as {
    name: string;
    label?: React.ReactNode;
    description?: React.ReactNode;
    placeholder?: string;
    required?: boolean;
  };
  const { field: rhf } = useController({ name: f.name, control });

  const raw = rhf.value;
  const major =
    raw === "" || raw == null || Number.isNaN(Number(raw)) ? null : Number(raw);
  const minor = major == null ? null : fromMajor(major, CURRENCY).amount;

  return (
    <MoneyInput
      name={f.name}
      label={f.label}
      description={f.description}
      placeholder={f.placeholder}
      required={f.required}
      disabled={disabled}
      currency={CURRENCY}
      showSymbol
      value={minor}
      onChange={(m) =>
        rhf.onChange(m == null ? undefined : toMajor(money(m, CURRENCY)))
      }
      helperText={error?.message}
    />
  );
}

/**
 * Component registry to pass to `SchemaForm`/`SchemaFormSheet`/`SchemaFormDialog`
 * `components={FORM_COMPONENTS}` — those components own their OWN registry and do
 * NOT read the ambient FluidFormSystemProvider, so the `money` override must be
 * handed to each one directly.
 */
export const FORM_COMPONENTS = { money: MoneyField, datetime: DateTimeField };
