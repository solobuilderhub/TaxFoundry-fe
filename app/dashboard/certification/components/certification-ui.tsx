"use client";

import { BadgeCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import { HeaderSection } from "@classytic/fluid/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT2Readiness } from "@/hooks/query/use-certification";

const money = (n: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Certification-readiness panel — renders the engine's CRA-style conformance
 * battery live. This is the differentiator over form-fillers made explicit: we
 * PROVE the engine reproduces known-correct results before ever transmitting.
 * The banner stays honest — "engine-verified" until the expected values are
 * CRA-official, never "certified".
 */
export function CertificationUI() {
  const { data, isLoading, isError, error } = useT2Readiness();

  return (
    <div className="space-y-6">
      <HeaderSection
        title="Certification readiness"
        description="The federal T2 engine run against a CRA-style battery of fictional corporations with known-correct results. This is what turns 'not certified yet' into 'provably correct, one enrollment away'."
        icon={ShieldCheck}
      />

      {isLoading && <p className="text-muted-foreground">Running the battery…</p>}
      {isError && (
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Failed to load readiness report"}
        </p>
      )}

      {data && (
        <>
          {/* Honest status banner. */}
          <div
            className={`flex items-start gap-3 rounded-lg border p-4 ${
              data.failed > 0
                ? "border-destructive/40 bg-destructive/5"
                : data.certificationReady
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-amber-500/40 bg-amber-500/5"
            }`}
          >
            {data.failed > 0 ? (
              <TriangleAlert className="mt-0.5 size-5 text-destructive" />
            ) : (
              <BadgeCheck className="mt-0.5 size-5 text-emerald-600" />
            )}
            <div>
              <p className="font-medium">
                {data.passed}/{data.total} cases pass
              </p>
              <p className="text-sm text-muted-foreground">
                {data.failed > 0
                  ? "Engine output diverges from expected. See the failing lines below."
                  : data.certificationReady
                    ? "Ready: all cases pass against CRA-official expected values."
                    : "Engine-verified: every case passes, but expected values are hand-computed. Swap in CRA-official test cases + enrollment to certify for production transmission."}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {data.results.map((r) => (
              <Card key={r.id}>
                <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                  <div className="min-w-0">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                      <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                      {r.name}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{r.scenario}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">{r.source}</Badge>
                    <Badge variant={r.pass ? "default" : "destructive"}>
                      {r.pass ? "pass" : "fail"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="py-1.5 pr-3 font-medium">Line</th>
                          <th className="py-1.5 pr-3 font-medium">CRA ref</th>
                          <th className="py-1.5 pr-3 text-right font-medium">Expected</th>
                          <th className="py-1.5 pr-3 text-right font-medium">Engine</th>
                          <th className="py-1.5 font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        {r.checks.map((c) => (
                          <tr key={c.line} className="border-b last:border-0">
                            <td className="py-1.5 pr-3">{c.label}</td>
                            <td className="py-1.5 pr-3 text-xs text-muted-foreground">{c.craRef}</td>
                            <td className="py-1.5 pr-3 text-right tabular-nums">{money(c.expected)}</td>
                            <td className="py-1.5 pr-3 text-right tabular-nums">{money(c.actual)}</td>
                            <td className="py-1.5">
                              <span className={c.pass ? "text-emerald-600" : "text-destructive"}>
                                {c.pass ? "✓" : "✗"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
