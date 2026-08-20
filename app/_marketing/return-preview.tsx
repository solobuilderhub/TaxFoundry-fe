import { CardWrapper } from "@classytic/fluid";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Hero visual — a scaled-down render of the real jacket summary rather than an
 * illustration.
 *
 * Built from the same fluid primitives and provenance badges the product uses,
 * so it shows the actual thing being sold (engine-computed lines with their
 * origin stamped on each one) and can never look out of date next to a
 * screenshot. Also: no binary asset, and it themes itself.
 */

const LINES = [
  { label: "Net income for tax", value: "$212,400", provenance: "engine" },
  { label: "Capital cost allowance (S8)", value: "$18,750", provenance: "engine" },
  { label: "Non-capital loss applied (S4)", value: "$35,000", provenance: "human" },
  { label: "Taxable income", value: "$158,650", provenance: "engine" },
  { label: "Small-business-rate income", value: "$158,650", provenance: "engine" },
] as const;

/** Provenance tones come from theme tokens, not raw Tailwind palette colours,
 *  so they track the brand and stay AA-checked in both modes. */
const PROVENANCE_TONE: Record<string, string> = {
  engine: "border-brand/35 text-brand",
  human: "border-brand-accent/40 text-brand-accent",
  imported: "border-info/40 text-info",
};

export function ReturnPreview() {
  return (
    <CardWrapper
      variant="elevated"
      title="Tax Summary: T2 jacket, page 9"
      description="Every line traced to its origin"
      action={
        <Badge variant="secondary" className="font-mono text-[11px]">
          T2 · 2024
        </Badge>
      }
      className="w-full text-left"
      contentClassName="p-0"
    >
      <div className="divide-y border-t">
        {LINES.map((l) => (
          <div key={l.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-sm text-muted-foreground">{l.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-medium tabular-nums">{l.value}</span>
              <Badge
                variant="outline"
                className={cn("hidden text-[10px] capitalize sm:inline-flex", PROVENANCE_TONE[l.provenance])}
              >
                {l.provenance}
              </Badge>
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 border-t-2 border-brand-accent/30 bg-brand-accent/8 px-4 py-3">
          <span className="text-sm font-semibold">Total federal tax owing</span>
          <span className="text-lg font-semibold tabular-nums text-brand-accent">$14,278</span>
        </div>
      </div>
    </CardWrapper>
  );
}
