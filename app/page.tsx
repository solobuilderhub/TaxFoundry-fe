import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Check,
  FileSpreadsheet,
  GitCompare,
  History,
  Lock,
  type LucideIcon,
  ShieldCheck,
  X,
} from "lucide-react";
import { CardWrapper, FaqAccordion, StatsGrid, Timeline } from "@classytic/fluid";
import { buildPageMetadata, FaqJsonLd, OrganizationJsonLd } from "@classytic/fluid/seo";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "./_marketing/link-button";
import {
  CERTIFICATION,
  COVERAGE,
  FAQS,
  FEATURES,
  HERO_STATS,
  PIPELINE,
  SITE,
} from "./_marketing/content";
import { ReturnPreview } from "./_marketing/return-preview";
import { Section, Shell } from "./_marketing/section";
import { SiteFooter } from "./_marketing/site-footer";
import { SiteHeader } from "./_marketing/site-header";

// `metadataBase` lives on the root layout so every route inherits it.
export const metadata: Metadata = buildPageMetadata({
  title: "Canadian corporate tax filing, with the numbers under control",
  description: SITE.description,
  canonicalPath: "/",
});

/** Feature icons resolved here so `content.ts` stays a plain data module. */
const FEATURE_ICONS: Record<string, LucideIcon> = {
  Calculator,
  ShieldCheck,
  History,
  FileSpreadsheet,
  GitCompare,
  Lock,
};

export default function LandingPage() {
  return (
    <>
      {/* Structured data. Fed from the same FAQ array the accordion renders. */}
      <OrganizationJsonLd name={SITE.name} url={SITE.url} description={SITE.description} />
      <FaqJsonLd items={FAQS.map((f) => ({ question: f.question, answer: f.answer }))} />

      <SiteHeader />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b">
          {/* Duotone wash. Teal from the left, brass from the right. Pure CSS in
              oklab so the two brand hues blend without a muddy grey midpoint, and
              it re-derives itself from the tokens in either theme. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_18%_0%,color-mix(in_oklab,var(--brand)_20%,transparent),transparent),radial-gradient(50%_45%_at_88%_8%,color-mix(in_oklab,var(--brand-accent)_16%,transparent),transparent)]"
          />
          <Shell className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-6 gap-1.5 border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
              >
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                {CERTIFICATION.label}
              </Badge>

              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Canadian corporate tax filing, with the numbers{" "}
                <span className="text-primary">under control</span>
              </h1>

              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                {SITE.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LinkButton href="/dashboard" size="lg">
                  Open the workspace
                  <ArrowRight className="size-4" />
                </LinkButton>
                <LinkButton href="#how-it-works" variant="outline" size="lg">
                  See how it works
                </LinkButton>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Federal T2 and Alberta AT1, prepared in parallel from one set of facts.
              </p>
            </div>

            <div className="lg:pl-4">
              <ReturnPreview />
            </div>
          </Shell>
        </section>

        {/* ── Proof points ─────────────────────────────────────────────── */}
        <Section size="compact" tone="muted">
          <StatsGrid columns={{ default: 1, sm: 3, lg: 3 }} gap="lg">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="text-center sm:text-start">
                <p className="text-3xl font-semibold tracking-tight">{s.value}</p>
                <p className="mt-1 font-medium">{s.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.hint}</p>
              </div>
            ))}
          </StatsGrid>
        </Section>

        {/* ── Pipeline ─────────────────────────────────────────────────── */}
        <Section
          id="how-it-works"
          eyebrow="How it works"
          title="From trial balance to transmitted return"
          highlight="transmitted return"
          description="Five steps, with a human decision at the point it matters."
        >
          <div className="mx-auto max-w-3xl">
            <Timeline
              items={PIPELINE.map((step, i) => ({
                title: step.title,
                description: step.description,
                status: "success" as const,
                label: `Step ${i + 1}`,
              }))}
              size="lg"
            />
          </div>
        </Section>

        {/* ── Why trust it ─────────────────────────────────────────────── */}
        <Section
          id="trust"
          tone="muted"
          eyebrow="Why trust it"
          title="Built so a filed number can always be explained"
          highlight="explained"
          description="The guarantees below are architectural, not policy. They are enforced in code and in CI."
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = FEATURE_ICONS[f.icon];
              return (
                <CardWrapper
                  key={f.title}
                  className="h-full"
                  title={
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {Icon && <Icon className="size-[18px]" aria-hidden="true" />}
                      </span>
                      <span className="text-base">{f.title}</span>
                    </span>
                  }
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </CardWrapper>
              );
            })}
          </div>
        </Section>

        {/* ── Coverage ─────────────────────────────────────────────────── */}
        <Section
          id="coverage"
          eyebrow="Coverage"
          title="Honest about what it does not do"
          highlight="does not do"
          description="A tax product that guesses at the edges is worse than one that hands them off."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <CardWrapper variant="success" title={COVERAGE.included.title} className="h-full">
              <ul className="space-y-2.5">
                {COVERAGE.included.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardWrapper>

            <CardWrapper
              variant="warning"
              title={COVERAGE.gated.title}
              description={COVERAGE.gated.note}
              className="h-full"
            >
              <ul className="space-y-2.5">
                {COVERAGE.gated.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm">
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardWrapper>
          </div>
        </Section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <Section
          id="faq"
          tone="muted"
          eyebrow="FAQ"
          title="Questions a preparer actually asks"
          description="Including the one about whether an AI is doing your taxes."
        >
          <div className="mx-auto max-w-3xl">
            <FaqAccordion
              items={FAQS.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            />
          </div>
        </Section>

        {/* ── Closing CTA ──────────────────────────────────────────────── */}
        <Section size="compact" className="border-b-0">
          <div className="rounded-2xl border bg-primary/5 px-6 py-12 text-center sm:px-12">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Start a return and see the fact log fill in
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
              Import a trial balance or a prior-year .COR file and watch each schedule resolve, with
              provenance on every figure.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <LinkButton href="/dashboard" size="lg">
                Open the workspace
                <ArrowRight className="size-4" />
              </LinkButton>
              <LinkButton href="/sign-in" variant="outline" size="lg">
                Sign in
              </LinkButton>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
