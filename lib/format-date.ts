/**
 * Formatting for CALENDAR DATES — a tax year end, a date of amalgamation, the
 * day an officer signed — as distinct from instants.
 *
 * ── The bug this exists to prevent ──────────────────────────────────────────
 *
 * Four surfaces formatted these with `new Date(iso).toLocaleDateString("en-CA")`,
 * which parses the string as an INSTANT and then renders it in the VIEWER's
 * timezone. A tax year stored as `2025-01-01T00:00:00Z` … `2025-12-31T00:00:00Z`
 * therefore printed as:
 *
 *   America/Edmonton     2024-12-31  →  2025-12-30
 *   America/Los_Angeles  2024-12-31  →  2025-12-30
 *   Asia/Dhaka           2025-01-01  →  2025-12-31   (correct)
 *   UTC                  2025-01-01  →  2025-12-31   (correct)
 *
 * Every timezone west of UTC shifts the calendar date back a day. Alberta is
 * UTC−7, so the corporation's own preparer saw the WRONG TAX YEAR on the
 * printed return, the jacket and the T183 — while a reviewer east of UTC saw it
 * correctly and could not reproduce the complaint. The AT1 paper Form View was
 * right all along because it slices the ISO string instead of parsing it.
 *
 * A tax year end is not a moment in time. 2025-12-31 is the same day in Calgary
 * and in Dhaka, and rendering it as a different day in either is simply wrong —
 * on a document that gets signed and filed, it is wrong in a way that changes
 * what the document says.
 *
 * ── Use `formatInstant` for the other kind ──────────────────────────────────
 *
 * "Last synced at", "API key created" and similar ARE instants, and showing
 * those in the viewer's own timezone is correct. Reach for this module's
 * calendar formatter only for a date the tax return itself asserts.
 */

/**
 * A calendar date, rendered exactly as stored — no timezone conversion.
 *
 * Accepts the ISO-8601 forms the API returns (`2025-12-31`,
 * `2025-12-31T00:00:00.000Z`) and a `Date`. The date portion is taken from the
 * string directly, so the day printed is the day stored.
 */
export function formatCalendarDate(value?: string | Date | null): string {
	if (value == null || value === "") return "—";
	if (value instanceof Date) {
		return Number.isNaN(value.getTime())
			? "—"
			: // A `Date` carries no record of which calendar day was meant, so read
				// back the UTC fields — the same ones `toISOString()` would print, and
				// the convention every date on this return is stored under.
				`${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
	}
	const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
	return match ? (match[1] as string) : "—";
}

/**
 * A moment in time, in the viewer's own timezone — the right choice for
 * "created", "last used", "synced at", and wrong for anything the return
 * itself states as a date.
 */
export function formatInstant(value?: string | Date | null): string {
	if (value == null || value === "") return "—";
	const d = value instanceof Date ? value : new Date(value);
	return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-CA");
}
