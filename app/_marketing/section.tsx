import type { ReactNode } from "react";
import { DisplayHeading } from "@classytic/fluid";
import { cn } from "@/lib/utils";

/**
 * Marketing layout primitives.
 *
 * One `<Section>` owns the page's vertical rhythm, max width and gutters, so a
 * new section is a `<Section>` plus content rather than another hand-tuned
 * `py-24 max-w-6xl px-6` string that drifts from its neighbours. Heading
 * typography comes from fluid's `DisplayHeading` — server-safe, and the same
 * scale the rest of the platform uses.
 *
 * Server components: nothing here is interactive.
 */

export function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>{children}</div>;
}

export interface SectionProps {
  id?: string;
  /** Small label above the title. */
  eyebrow?: string;
  title?: ReactNode;
  /** Word within `title` to accent, via fluid's DisplayHeading highlight. */
  highlight?: string;
  description?: ReactNode;
  /** `muted` tints the band so alternating sections read as distinct. */
  tone?: "default" | "muted";
  /** Heading block alignment. Content below always fills the width. */
  align?: "start" | "center";
  size?: "default" | "compact";
  className?: string;
  children?: ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  highlight,
  description,
  tone = "default",
  align = "center",
  size = "default",
  className,
  children,
}: SectionProps) {
  const hasHeading = Boolean(eyebrow || title || description);
  return (
    <section
      id={id}
      // `scroll-mt` keeps the sticky header from covering the heading when the
      // in-page nav anchors here.
      className={cn(
        "scroll-mt-20 border-b",
        tone === "muted" && "bg-muted/30",
        size === "compact" ? "py-14" : "py-20 sm:py-28",
        className,
      )}
    >
      <Shell>
        {hasHeading && (
          <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {eyebrow}
              </p>
            )}
            {title && (
              <DisplayHeading
                as="h2"
                size="lg"
                align={align}
                highlightText={highlight}
                className="text-balance"
              >
                {title}
              </DisplayHeading>
            )}
            {description && (
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </p>
            )}
          </div>
        )}
        {children && <div className={cn(hasHeading && "mt-12")}>{children}</div>}
      </Shell>
    </section>
  );
}
