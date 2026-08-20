import { cn } from "@/lib/utils";

/**
 * TaxFoundry brand mark — inline SVG rather than an image asset.
 *
 * Inherits `currentColor` for the frame and reads the brand tokens for the
 * bars, so it is correct in both themes with no second file, stays crisp from a
 * 16px favicon to hero size, and costs no network request. The glyph reads as a
 * stacked return: three schedule rules, teal → brass → neutral, stating both
 * brand hues in the mark itself.
 *
 * Lives in `components/` (not the marketing folder) because the dashboard
 * sidebar and the public site both render it.
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("size-6", className)}>
      <rect
        x="1.5"
        y="1.5"
        width="21"
        height="21"
        rx="6"
        className="stroke-current"
        strokeWidth="1.75"
        opacity="0.35"
      />
      <rect x="6" y="7" width="12" height="2.25" rx="1.125" className="fill-brand" />
      <rect x="6" y="11.875" width="9" height="2.25" rx="1.125" className="fill-brand-accent" />
      <rect x="6" y="16.75" width="5.5" height="2.25" rx="1.125" className="fill-current" opacity="0.4" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <Logomark />
      <span>
        Tax<span className="text-brand">Foundry</span>
      </span>
    </span>
  );
}
