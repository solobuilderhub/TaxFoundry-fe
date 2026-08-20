import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NAV_LINKS } from "./content";
import { LinkButton } from "./link-button";
import { Shell } from "./section";
import { Wordmark } from "@/components/brand";

/**
 * Landing header. Deliberately a SERVER component — the nav is anchor links, so
 * there is nothing to hydrate. On small screens the link row collapses and the
 * two CTAs remain, which avoids shipping a hamburger-menu client bundle for a
 * four-item in-page nav.
 *
 * CTAs go through `LinkButton` — see that file for why `buttonVariants()` can't
 * be called from a Server Component.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Shell className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <Wordmark />
          <span className="sr-only">TaxFoundry home</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LinkButton href="/sign-in" variant="ghost" size="sm">
            Sign in
          </LinkButton>
          <LinkButton href="/dashboard" size="sm">
            Open workspace
            <ArrowRight className="size-4" />
          </LinkButton>
        </div>
      </Shell>
    </header>
  );
}
