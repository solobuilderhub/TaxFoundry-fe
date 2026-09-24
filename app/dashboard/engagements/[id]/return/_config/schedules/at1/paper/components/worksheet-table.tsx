"use client";

import { BooleanCheckbox } from "@classytic/fluid/forms";
import { type Control, type FieldValues, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	PaperMoney,
	PaperNumber,
	PaperSelect,
	PaperText,
} from "./paper-inputs";

/**
 * A supporting worksheet under a printed form — the detail a form summarises
 * in one figure (class 13 leasehold layers behind Schedule 13's class 13 row,
 * AT4970 projects behind Schedule 29's eligible expenditures).
 *
 * Every tax package keeps this working beside the form rather than in a
 * separate wizard, which is what this is: an editable table bound to the same
 * form `control` as the schedule, saved with it. Rows add and remove here.
 */
export interface WorksheetColumn {
	/** Field name on each row object. */
	name: string;
	label: string;
	kind: "text" | "money" | "number" | "date" | "bool" | "select";
	options?: readonly { value: string; label: string }[];
	/** Tooltip / helper text for the column heading. */
	hint?: string;
}

/** One cell, by column kind — always one of the shared printed-form inputs. */
function WorksheetCell<T extends FieldValues>({
	control,
	name,
	column,
	row,
	disabled,
}: {
	control: Control<T>;
	name: string;
	column: WorksheetColumn;
	row: number;
	disabled?: boolean;
}) {
	const label = `${column.label} — row ${row + 1}`;
	switch (column.kind) {
		case "money":
			return (
				<PaperMoney
					control={control}
					name={name}
					label={label}
					disabled={disabled}
				/>
			);
		case "number":
			return (
				<PaperNumber
					control={control}
					name={name}
					label={label}
					disabled={disabled}
				/>
			);
		case "select":
			return (
				<PaperSelect
					control={control}
					name={name}
					label={label}
					disabled={disabled}
					options={column.options ?? []}
				/>
			);
		case "bool":
			return (
				<BooleanCheckbox
					control={control}
					name={name}
					label={label}
					labelClassName="sr-only"
					disabled={disabled}
				/>
			);
		default:
			return (
				<PaperText
					control={control}
					name={name}
					label={label}
					disabled={disabled}
					type={column.kind === "date" ? "date" : "text"}
				/>
			);
	}
}

export function WorksheetTable<T extends FieldValues>({
	control,
	name,
	columns,
	disabled,
	addLabel = "+ Add a row",
	emptyText = "No rows yet.",
}: {
	control: Control<T>;
	/** The array field on the schedule's slice. */
	name: string;
	columns: readonly WorksheetColumn[];
	disabled?: boolean;
	addLabel?: string;
	emptyText?: string;
}) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: name as never,
	});
	return (
		<div className="overflow-x-auto p-2">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr>
						{columns.map((c) => (
							<th
								key={c.name}
								title={c.hint}
								className="border-b px-2 pb-2 text-left align-bottom text-xs font-semibold"
							>
								{c.label}
							</th>
						))}
						<th className="w-8 border-b" aria-label="Remove" />
					</tr>
				</thead>
				<tbody>
					{fields.length === 0 && (
						<tr>
							<td
								colSpan={columns.length + 1}
								className="px-2 py-3 text-sm text-muted-foreground"
							>
								{emptyText}
							</td>
						</tr>
					)}
					{fields.map((f, i) => (
						<tr key={f.id} className="border-b">
							{columns.map((c) => (
								<td key={c.name} className="px-2 py-1.5">
									<WorksheetCell
										control={control}
										name={`${name}.${i}.${c.name}`}
										column={c}
										row={i}
										disabled={disabled}
									/>
								</td>
							))}
							<td className="px-1 text-center">
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									disabled={disabled}
									onClick={() => remove(i)}
									aria-label={`Remove row ${i + 1}`}
								>
									×
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="mt-2"
				disabled={disabled}
				onClick={() => append({} as never)}
			>
				{addLabel}
			</Button>
		</div>
	);
}

/**
 * One labelled money box on a supporting worksheet — a figure the form needs
 * but does not print (a federal comparison amount, a straight-line opening
 * UCC). Bound to the schedule's own `control` and saved with it.
 */
export function WorksheetMoneyField<T extends FieldValues>({
	control,
	name,
	label,
	hint,
	placeholder,
	disabled,
}: {
	control: Control<T>;
	name: string;
	label: string;
	hint?: string;
	placeholder?: string;
	disabled?: boolean;
}) {
	return (
		<div className="flex items-center gap-3 px-4 py-2 text-sm">
			<span className="min-w-0 flex-1">
				{label}
				{hint && (
					<span className="block text-xs text-muted-foreground">{hint}</span>
				)}
			</span>
			<PaperMoney
				control={control}
				name={name}
				label={label}
				placeholder={placeholder}
				disabled={disabled}
				className="w-36 shrink-0"
			/>
		</div>
	);
}
