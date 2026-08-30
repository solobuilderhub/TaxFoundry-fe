/**
 * Client-side CCA rate table + declining-balance labels, mirroring the engine's
 * ITR Schedule II rates (`@classytic/ca-tax/t2` → `rates/cca-rates.ts`).
 *
 * Used for the Schedule 8 class picker and the live per-class preview only; the
 * ENGINE recomputes the authoritative figure on compute. Domain data, not UI
 * config — it lives in `_lib` so the print surface can read a rate without
 * pulling the form schemas into its bundle.
 */
export const CCA_CLASSES: { value: string; label: string; rate: number }[] = [
  { value: "1", label: "Class 1: Buildings (4%)", rate: 0.04 },
  { value: "6", label: "Class 6: Certain buildings/fences (10%)", rate: 0.1 },
  { value: "8", label: "Class 8: Furniture, equipment (20%)", rate: 0.2 },
  { value: "10", label: "Class 10: Vehicles, general EDP (30%)", rate: 0.3 },
  { value: "10.1", label: "Class 10.1: Passenger vehicle > limit (30%)", rate: 0.3 },
  { value: "12", label: "Class 12: Tools, small assets (100%)", rate: 1.0 },
  // Class 13/14 are straight-line under Reg 1100(1)(b)/(c), not a declining-
  // balance rate — `rate: -1` is a sentinel `ccaClassPreview` (calc.ts) reads
  // to switch to the opening-balance-drawdown preview instead of rate × base.
  // The engine only supports drawing down an EXISTING opening UCC for these
  // two classes (no rate, no half-year rule); a current-year ADDITION is
  // refused server-side (see `computeCcaClass` in `schedule8.ts`) because it
  // would need the lease-term / remaining-life data this row shape has no
  // fields for. The `additions` field stays visible but must be left at 0
  // for these classes until that detailed entry mode exists.
  { value: "13", label: "Class 13: Leaseholds — existing balance only (straight-line)", rate: -1 },
  { value: "14", label: "Class 14: Limited-life intangibles — existing balance only (straight-line)", rate: -1 },
  { value: "50", label: "Class 50: Computer equipment (55%)", rate: 0.55 },
  { value: "53", label: "Class 53: M&P machinery (50%)", rate: 0.5 },
];

const RATES: Record<string, number> = Object.fromEntries(
  CCA_CLASSES.map((c) => [c.value, c.rate]),
);

/** Declining-balance rate for a class; 0 for an unknown or straight-line class. */
export const ccaRate = (ccaClass: string | undefined): number => RATES[ccaClass ?? ""] ?? 0;
