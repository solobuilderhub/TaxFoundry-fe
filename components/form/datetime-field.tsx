"use client";

import { useController } from "react-hook-form";
import type { FieldComponentProps } from "@classytic/formkit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * formkit `datetime` field → a native `datetime-local` input.
 *
 * ── Why this override exists ────────────────────────────────────────────────
 *
 * Fluid's `DateTimeInput` is picker-only: a popover trigger over a calendar and
 * two time selects, with no text entry. That is a deliberate and consistent
 * choice across fluid's whole date family, not a defect — so it is overridden
 * HERE rather than changed there. Fluid publishes `components={...}` for exactly
 * this, and the host already uses it for `money`.
 *
 * The reason this one field needs typing is the T183. A preparer records **when
 * the officer signed**, which is almost always a moment already past —
 * "yesterday, 2:30pm". Reaching a past date through calendar navigation is slow
 * and error-prone, while a `datetime-local` accepts it typed AND still offers
 * the browser's own picker. It is also keyboard-native, which a popover calendar
 * is only approximately.
 *
 * ── The value contract ──────────────────────────────────────────────────────
 *
 * `datetime-local` reads and writes `YYYY-MM-DDTHH:mm` in LOCAL time with no
 * zone. The caller converts to ISO on submit (`new Date(value).toISOString()`),
 * which is right: the officer signed at a wall-clock moment where they were, and
 * the browser's zone is the closest available truth. Storing the raw local
 * string here keeps that conversion in one place instead of round-tripping a
 * Date through the form.
 */
export function DateTimeField({ field, control, disabled, error }: FieldComponentProps) {
  const f = field as {
    name: string;
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    max?: string;
  };
  const { field: rhf } = useController({ name: f.name, control });

  const id = `dtf-${f.name}`;
  const message = (error as { message?: string } | undefined)?.message;

  return (
    <div className="grid gap-2">
      {f.label && (
        <Label htmlFor={id}>
          {f.label}
          {f.required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      <Input
        id={id}
        type="datetime-local"
        disabled={disabled}
        required={f.required}
        aria-invalid={Boolean(message) || undefined}
        // A signature cannot have been given in the future. The server rejects
        // it too — this just refuses to offer it.
        max={f.max}
        value={typeof rhf.value === "string" ? rhf.value : ""}
        onChange={(e) => rhf.onChange(e.target.value === "" ? undefined : e.target.value)}
        onBlur={rhf.onBlur}
      />
      {f.description && !message && (
        <p className="text-xs text-muted-foreground">{f.description}</p>
      )}
      {message && <p className="text-xs text-destructive">{message}</p>}
    </div>
  );
}
