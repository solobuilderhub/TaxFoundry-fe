"use client";

import { MoneyInput } from "@classytic/fluid/forms/money-input";
import type { FieldComponentProps } from "@classytic/formkit";
import { fromMajor, money, toMajor } from "@classytic/primitives/money";
import { useController } from "react-hook-form";
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
 *
 * `allowNegative`: fluid's `MoneyInput` defaults this to `false`, which is
 * right for a retail cash-tendered box but wrong here — this adapter renders
 * EVERY money field on a T2/AT1 return, and a loss year, a negative
 * adjustment, a recapture-vs-terminal-loss offset or a reserve continuity's
 * own "+/-" column are all ordinary inputs, not edge cases. Left at the
 * default, `MoneyInput`'s `sanitizeDraft` treats a leading "-" as a character
 * outside its allowed set and drops it on the first keystroke — silently, no
 * error, no indication anything was refused. A preparer typing "-50,000" into
 * "Net income (loss) for federal purposes" got a field holding "50,000.00":
 * a loss filed as income, the worst class of sign error this app can produce,
 * and confirmed independently across three separate input paths on the
 * production build. Explicit `true` here, so the one call site every money
 * field renders through can't silently regress back to the fluid default.
 */
export function MoneyField({
	field,
	control,
	disabled,
	error,
}: FieldComponentProps) {
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
			allowNegative
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
