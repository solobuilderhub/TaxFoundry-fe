import type { ComponentProps } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * A CTA that navigates — button styling, anchor semantics.
 *
 * Two things this gets right that a hand-rolled `<Link className={buttonVariants(...)}>`
 * does not:
 *
 * 1. `buttonVariants` is exported from a `"use client"` module, so calling it
 *    from a Server Component is invoking a client function from the server.
 *    Rendering `<Button>` instead is legal from an RSC and keeps one source of
 *    button styling.
 * 2. base-ui's Button assumes it renders a native `<button>`. Swapping in an
 *    anchor without `nativeButton={false}` silently drops native button
 *    semantics — base-ui warns about the accessibility impact. Setting it here
 *    once means no call site can forget.
 */
export type LinkButtonProps = Omit<ComponentProps<typeof Button>, "render" | "nativeButton"> & {
  href: string;
};

export function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Button render={<Link href={href} />} nativeButton={false} {...props}>
      {children}
    </Button>
  );
}
