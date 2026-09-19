"use client";

import { SchemaForm } from "@classytic/fluid/formkit";
import { defineSchema, field, section } from "@classytic/formkit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
						/*
						 * `signIn.email` REJECTS on a network-level failure rather than
						 * returning `{ error }` — the backend unreachable, CORS, a
						 * redeploy mid-request. Unhandled, that rejection skipped
						 * `setLoading(false)` and left the button disabled on "Signing
						 * in…" for ever, with nothing shown: the submit appeared to do
						 * nothing at all and the page had to be reloaded to try again.
						 *
						 * A benchmark session reported exactly that ("the Sign-in submit
						 * can silently no-op and needs a redo"), and it compounded the
						 * session drops it was trying to recover from.
						 *
						 * `finally` clears the button whatever happens, so the form can
						 * always be retried.
						 */
						setLoading(true);
						try {
							const { error } = await signIn.email({
								email: String(values.email ?? ""),
								password: String(values.password ?? ""),
							});
							if (error) {
								toast.error(error.message ?? "Sign-in failed");
								return;
							}
							router.push("/dashboard");
						} catch {
							// Distinguished from a rejected credential on purpose: nothing is
							// wrong with what they typed, so telling them so would send them
							// hunting for a mistake they did not make.
							toast.error(
								"Could not reach the server. Your details were not sent — check your connection and try again.",
							);
						} finally {
							setLoading(false);
						}
					}}
				>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Signing in…" : "Sign in"}
					</Button>
				</SchemaForm>
				<p className="text-center text-sm text-muted-foreground">
					New here?{" "}
					<Link
						href="/sign-up"
						className="font-medium text-foreground underline underline-offset-4"
					>
						Create an account
					</Link>
				</p>
			</div>
		</div>
	);
}
