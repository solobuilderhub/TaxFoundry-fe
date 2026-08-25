"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SchemaForm } from "@classytic/fluid/formkit";
import { defineSchema, field, section } from "@classytic/formkit";
import { Button } from "@/components/ui/button";
import { signUp } from "../_lib/client";
import { createFirm } from "../_lib/firm";

type SignUpValues = {
  name: string;
  organizationName: string;
  email: string;
  password: string;
};

/**
 * `minLength` mirrors the server's `emailAndPassword.minPasswordLength` in
 * `apps/server/src/auth.ts`. Stating a different rule here would either reject
 * passwords the server accepts or send the user round a trip to be told a rule
 * the form could have told them.
 */
const MIN_PASSWORD = 6;

const signUpSchema = defineSchema<SignUpValues>({
  sections: [
    section<SignUpValues>("account", "Create your account", [
      field.text<SignUpValues>("name", "Your name", {
        required: true,
        fullWidth: true,
        placeholder: "e.g. Jane Okafor",
      }),
      field.text<SignUpValues>("organizationName", "Firm name", {
        required: true,
        fullWidth: true,
        placeholder: "e.g. Okafor & Associates",
        description:
          "The practice you file under. Clients and engagements belong to it.",
      }),
      field.email<SignUpValues>("email", "Email", {
        required: true,
        fullWidth: true,
      }),
      field.password<SignUpValues>("password", "Password", {
        required: true,
        fullWidth: true,
        minLength: {
          value: MIN_PASSWORD,
          message: `At least ${MIN_PASSWORD} characters`,
        },
      }),
    ]),
  ],
});

/**
 * Sign up — create an account and the firm it works inside.
 *
 * Both happen here because neither is useful alone: the account authenticates,
 * the firm is what every client, engagement and return is scoped to. See
 * `_lib/firm.ts`.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const firmName = String(values.organizationName ?? "").trim();

      const { error } = await signUp.email({
        name: String(values.name ?? "").trim(),
        email: String(values.email ?? "").trim(),
        password: String(values.password ?? ""),
      });
      if (error) {
        toast.error(error.message ?? "Could not create the account");
        return;
      }

      // Better Auth signs the new user in, so this call is authenticated. If it
      // fails the account still exists — the dashboard offers firm creation
      // again rather than leaving them with an account they cannot use.
      await createFirm(firmName);

      toast.success(`Welcome to TaxFoundry, ${firmName}`);
      router.push("/dashboard");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not finish setting up the firm",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">TaxFoundry</h1>
          <p className="text-sm text-muted-foreground">
            Canadian corporate tax filing
          </p>
        </div>
        <SchemaForm schema={signUpSchema} onSubmit={onSubmit}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating your account…" : "Create account"}
          </Button>
        </SchemaForm>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
