"use client";

import {
	BooleanCheckbox,
	FormInput,
	MoneyInput,
	NativeSelectInput,
	NumberInput,
	RadioInput,
} from "@classytic/fluid/forms";
import {
	type Control,
	type FieldValues,
	type Path,
	useController,
} from "react-hook-form";
import { cn } from "@/lib/utils";

/**
 * The inputs every printed form is built from — fluid's react-hook-form
 * inputs (and so the host's shadcn primitives), sized for a form facsimile.
 *
 * Each view used to hand-roll its own `Controller` + `<input>` pair with its
 * own class string and its own empty-string/number coercion; one copy dropped
 * a minus sign, another saved "yes" into a number. One set, used everywhere,
 * behaves the same everywhere.
 *
 * The label is always passed — it is the box's accessible name — but hidden
 * visually by default: on a printed form the caption beside the box is the
 * label.
 */
interface PaperInputProps<T extends FieldValues> {
	control: Control<T>;
	name: string;
	/** Accessible name; shown only when `showLabel`. */
	label: string;
	showLabel?: boolean;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

const HIDDEN_LABEL = "sr-only";

/**
 * A whole-dollar amount. The return is completed in dollars ("DO NOT include
 * cents"), so `decimals={0}` — the stored value is the dollar figure itself,
 * no cents conversion. Negative amounts are allowed: losses and adjustments
 * are ordinary entries on these forms.
 */
export function PaperMoney<T extends FieldValues>({
	control,
	name,
	label,
	showLabel,
	placeholder,
	disabled,
	className,
}: PaperInputProps<T>) {
	const { field } = useController({ control, name: name as Path<T> });
	const raw = field.value as unknown;
	const value =
		raw === "" || raw == null || Number.isNaN(Number(raw)) ? null : Number(raw);
	return (
		<MoneyInput
			name={name}
			label={label}
			labelClassName={showLabel ? undefined : HIDDEN_LABEL}
			placeholder={placeholder}
			disabled={disabled}
			currency="CAD"
			decimals={0}
			allowNegative
			value={value}
			// Cleared = null, not undefined: react-hook-form treats an undefined
			// field as "not set" and shows the value the form opened with, so a
			// cleared box reverted to its saved figure. The save strips nulls.
			onChange={(v) => field.onChange(v == null ? null : v)}
			className={cn("w-full", className)}
			inputClassName="text-right tabular-nums"
		/>
	);
}

/** A plain number — days, a rate, a count. */
export function PaperNumber<T extends FieldValues>({
	control,
	name,
	label,
	showLabel,
	placeholder,
	disabled,
	className,
	step,
}: PaperInputProps<T> & { step?: number }) {
	// Bound by hand for the same reason as `PaperMoney`: a cleared box is null.
	const { field } = useController({ control, name: name as Path<T> });
	const raw = field.value as unknown;
	return (
		<NumberInput
			name={name}
			// "" rather than undefined for blank: an undefined value tells fluid to
			// bind to any surrounding FormProvider instead of this handler.
			value={raw === "" || raw == null ? "" : Number(raw)}
			onChange={(v) => field.onChange(v == null ? null : v)}
			label={label}
			labelClassName={showLabel ? undefined : HIDDEN_LABEL}
			placeholder={placeholder}
			disabled={disabled}
			step={step}
			density="compact"
			className={cn("w-full", className)}
			inputClassName="text-right tabular-nums"
		/>
	);
}

/** Free text, or a date (`type="date"`, stored as `YYYY-MM-DD`). */
export function PaperText<T extends FieldValues>({
	control,
	name,
	label,
	showLabel,
	placeholder,
	disabled,
	className,
	type = "text",
}: PaperInputProps<T> & { type?: "text" | "date" }) {
	return (
		<FormInput
			control={control}
			name={name}
			label={label}
			labelClassName={showLabel ? undefined : HIDDEN_LABEL}
			placeholder={placeholder}
			disabled={disabled}
			type={type}
			density="compact"
			className={cn("w-full", className)}
		/>
	);
}

/**
 * A coded answer from a fixed list. Native select, deliberately: these rows sit
 * inside a facsimile of a printed page, where a portalled listbox breaks the
 * layout. Blank stays selectable — withdrawing an answer must be possible.
 */
export function PaperSelect<T extends FieldValues>({
	control,
	name,
	label,
	showLabel,
	disabled,
	className,
	options,
	blankLabel = "—",
}: PaperInputProps<T> & {
	options: readonly { value: string; label: string }[];
	blankLabel?: string;
}) {
	return (
		<NativeSelectInput
			control={control}
			name={name}
			label={label}
			labelClassName={showLabel ? undefined : HIDDEN_LABEL}
			disabled={disabled}
			items={[{ value: "", label: blankLabel }, ...options]}
			className={cn("w-full", className)}
		/>
	);
}

const YES_NO = [
	{ value: "yes", label: "Yes" },
	{ value: "no", label: "No" },
];

/**
 * A box the form prints as a tick, stored as "yes" / "no" like every other AT1
 * answer — so a ticked box and a Yes radio mean the same thing to the engine.
 * Unticking stores "no", which is what an unticked printed box says.
 */
export function PaperCheck<T extends FieldValues>({
	control,
	name,
	label,
	showLabel = true,
	disabled,
	className,
}: PaperInputProps<T>) {
	const { field } = useController({ control, name: name as Path<T> });
	return (
		<BooleanCheckbox
			name={name}
			label={label}
			labelClassName={showLabel ? "font-normal" : HIDDEN_LABEL}
			disabled={disabled}
			value={field.value === "yes"}
			onValueChange={(on) => field.onChange(on ? "yes" : "no")}
			className={cn("gap-1.5", className)}
		/>
	);
}

/**
 * An AT1 yes/no answer, stored as the literal "yes" / "no". No preselection:
 * TRA records No as an answer the corporation gives, so unanswered must stay
 * distinguishable from No.
 */
export function PaperYesNo<T extends FieldValues>({
	control,
	name,
	label,
	showLabel,
	disabled,
	className,
}: PaperInputProps<T>) {
	return (
		<RadioInput
			control={control}
			name={name}
			label={label}
			labelClassName={showLabel ? undefined : HIDDEN_LABEL}
			disabled={disabled}
			choices={YES_NO}
			orientation="horizontal"
			className={cn("shrink-0", className)}
		/>
	);
}
