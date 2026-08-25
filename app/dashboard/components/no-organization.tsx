"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchemaForm } from "@classytic/fluid/formkit";
import { defineSchema, field, section } from "@classytic/formkit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFirm } from "@/app/(auth)/_lib/firm";

type FirmValues = { organizationName: string };

const firmSchema = defineSchema<FirmValues>({
  sections: [
    section<FirmValues>("firm", "", [
      field.text<FirmValues>("organizationName", "Firm name", {
        required: true,
        fullWidth: true,
        placeholder: "e.g. Okafor & Associates",
        description:
          "The practice you file under. Clients and engagements belong to it.",
      }),
    ]),
  ],
});

/**
 * Shown when a signed-in user belongs to no organization.
 *
 * ── Why this screen has to exist ────────────────────────────────────────────
 *
 * Everything in the product is org-scoped, so this user can see nothing and
 * save nothing — but the dashboard would still render, as an empty shell whose
 * every button fails. Left unhandled it reads as "the product is broken"
 * rather than "you are not in a firm yet".
 *
 * It is reachable two ways: an account created straight against the API (no
 * organization is implied by signing up at the HTTP layer), and a sign-up whose
 * firm creation failed after the account was already made. In both cases the
 * account is fine and only the firm is missing, so the fix is to offer the
 * missing half rather than to sign them out.
 */
export function NoOrganization() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      await createFirm(String(values.organizationName ?? "").trim());
      // A full navigation rather than router.refresh(): the org list, the
      // active-org pointer on the session and the server-rendered layout all
      // have to agree before the dashboard is usable, and this is a
      // once-per-account action where reloading costs nothing.
      window.location.assign("/dashboard");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not create the firm",
      );
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set up your firm</CardTitle>
          <CardDescription>
            Your account is ready. Clients, engagements and returns all belong
            to a firm, so name yours to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaForm schema={firmSchema} onSubmit={onSubmit}>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create firm"}
            </Button>
          </SchemaForm>
        </CardContent>
      </Card>
    </div>
  );
}
