"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  HandCoins,
  Church,
  CreditCard,
  BookOpen,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/types";

interface SidebarNavProps {
  role: UserRole;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["member", "admin", "superuser"],
    },
    {
      href: "/churches",
      label: "Churches",
      icon: Church,
      roles: ["superuser"],
    },
    {
      href: "/members",
      label: "Members",
      icon: Users,
      roles: ["admin", "superuser"],
    },
    {
      href: "/attendance",
      label: "Attendance",
      icon: ClipboardCheck,
      roles: ["admin", "superuser"],
    },
    {
      href: "/offerings",
      label: "Offerings",
      icon: HandCoins,
      roles: ["admin", "superuser"],
    },
    {
      href: "/sunday-school",
      label: "Sunday School",
      icon: BookOpen,
      roles: ["admin", "superuser", "member"],
    },
    {
      href: "/plans",
      label: "Plans",
      icon: CreditCard,
      roles: ["superuser", "admin"],
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Church className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold font-headline">
          FaithFlow
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="p-2">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    className="w-full justify-start"
                    tooltip={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </div>
    </div>
  );
}