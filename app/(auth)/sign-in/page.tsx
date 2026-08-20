"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SchemaForm } from "@classytic/fluid/formkit";
import { defineSchema, field, section } from "@classytic/formkit";
import { Button } from "@/components/ui/button";
import { signIn } from "../_lib/client";

const signInSchema = defineSchema<{ email: string; password: string }>({
  sections: [
    section("credentials", "Sign in", [
      field.email<{ email: string; password: string }>("email", "Email", {
        required: true,
        fullWidth: true,
      }),
      field.password<{ email: string; password: string }>(
        "password",
        "Password",
        { required: true, fullWidth: true },
      ),
    ]),
  ],
});

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">TaxFoundry</h1>
          <p className="text-sm text-muted-foreground">
            Canadian corporate tax filing
          </p>
        </div>
        <SchemaForm
          schema={signInSchema}
          onSubmit={async (values: Record<string, unknown>) => {
            setLoading(true);
            const { error } = await signIn.email({
              email: String(values.email ?? ""),
              password: String(values.password ?? ""),
            });
            setLoading(false);
            if (error) {
              toast.error(error.message ?? "Sign-in failed");
              return;
            }
            router.push("/dashboard");
          }}
        >
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </SchemaForm>
      </div>
    </div>
  );
}
