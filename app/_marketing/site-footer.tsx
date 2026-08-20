import Link from "next/link";
import { MapPin } from "lucide-react";
import { CERTIFICATION, NAV_LINKS, SITE } from "./content";
import { Shell } from "./section";
import { Wordmark } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="py-12">
      <Shell className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SITE.tagline}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden="true" />
            Client records held in Canada
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
            Workspace
          </Link>
        </nav>
      </Shell>

      <Shell className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE.name}. Preparation software for Canadian corporate tax
          returns. Not tax advice.
        </p>
        {!CERTIFICATION.certified && <p>{CERTIFICATION.label}: {CERTIFICATION.detail}</p>}
      </Shell>
    </footer>
  );
}
