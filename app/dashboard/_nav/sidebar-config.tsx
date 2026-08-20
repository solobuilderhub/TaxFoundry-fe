"use client";

import {
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  matchRoute,
  type SidebarConfig,
} from "@classytic/fluid/dashboard/client";
import { Logomark, Wordmark } from "@/components/brand";

/**
 * TaxFoundry dashboard sidebar (fluid DashboardLayout `SidebarConfig`,
 * `variant: "inset"`). Navigation is static for now; role/org gating can layer
 * in later via `resolveNavigation` like fajr-fe does.
 */
export function useSidebarConfig(): SidebarConfig {
  const pathname = usePathname();

  const groups = [
    {
      label: "Workspace",
      items: [
        { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
        { title: "Clients", url: "/dashboard/clients", icon: Building2 },
        { title: "Engagements", url: "/dashboard/engagements", icon: FileText },
        { title: "Reviews", url: "/dashboard/reviews", icon: ClipboardCheck },
        {
          title: "Certification",
          url: "/dashboard/certification",
          icon: ShieldCheck,
        },
        {
          title: "Integrations",
          url: "/dashboard/integrations",
          icon: Plug,
        },
      ],
    },
  ];

  const navigation = groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      isActive:
        item.url === "/dashboard"
          ? pathname === item.url
          : matchRoute(pathname, item.url),
    })),
  }));

  return {
    variant: "inset",
    brand: {
      title: "TaxFoundry",
      // `icon` is the boxed mark for the collapsed rail; `logo` renders unboxed
      // when expanded — which is what we want, since our mark carries its own
      // teal/brass colour and shouldn't sit on a solid `bg-sidebar-primary`
      // square. fluid suppresses its own `title` text beside a `logo` (the
      // wordmark already spells it), so this renders once, not twice.
      icon: <Logomark className="size-[18px]" />,
      logo: <Wordmark className="text-[15px]" />,
      href: "/dashboard",
    },
    navigation,
  };
}
