/**
 * AT1's Net File line-item id is nine digits, `SSSFFFOOO` — schedule, field,
 * occurrence. Shared between `ScheduleFiledValues` (the "as filed" list under
 * the guided editor) and the paper Form View — both need to turn a filed
 * line-item id back into the 3-digit field number a `PaperField.line` uses,
 * and there is exactly one correct way to split it.
 */
export function parseAt1LineItemId(
	lineItemId: string,
): { field: string; occurrence: number } | undefined {
	if (!/^\d{9}$/.test(lineItemId)) return undefined;
	return {
		field: lineItemId.slice(3, 6),
		occurrence: Number(lineItemId.slice(6, 9)),
	};
}

export const at1Money = (n: number) =>
	new Intl.NumberFormat("en-CA", {
		style: "currency",
		currency: "CAD",
		maximumFractionDigits: 0,
	}).format(n);
