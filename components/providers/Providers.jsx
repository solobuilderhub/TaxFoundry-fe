"use client";

import { configureClient, configureAuth } from "@classytic/arc-next/client";
import { configureToast } from "@classytic/arc-next/mutation";
import { configureNavigation } from "@classytic/arc-next/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import TanstackProvider from "@/components/providers/TanstackProvider";
import { ThemeProvider } from "./theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FluidFormSystemProvider } from "@classytic/fluid/formkit";
import { MoneyField } from "@/components/form/money-field";
import { getActiveOrgId } from "@/contexts/OrganizationContext";

// Browser-only: arc-next configure* set module-level state and leak across
// SSR requests if executed on the server. "use client" still loads this
// module server-side during SSR, so guard at the call site.
if (typeof window !== "undefined") {
  configureClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    authMode: "cookie",
  });
  configureToast({
    success: toast.success,
    error: toast.error,
  });
  configureNavigation(useRouter);
  configureAuth({
    getOrgId: getActiveOrgId,
  });
}

const Providers = ({ children }) => {
  return (
    <TanstackProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster position="top-center" />
        <TooltipProvider>
          {/* fluid's formkit integration. Binds formkit schemas to fluid's
              inputs. `money` overrides the default (NumberInput) with fluid's
              MoneyInput, bridged to whole-dollar values via primitives. */}
          <FluidFormSystemProvider components={{ money: MoneyField }}>
            {children}
          </FluidFormSystemProvider>
        </TooltipProvider>
      </ThemeProvider>
    </TanstackProvider>
  );
};

export default Providers;
