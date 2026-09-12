"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Store, AlertTriangle, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/garages", icon: Store, label: "Garages" },
  { href: "/admin/requests", icon: AlertTriangle, label: "SOS Logs" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4 space-y-1 mt-6">
      <div className="text-[10px] uppercase font-black text-white/30 tracking-widest px-4 mb-4">Dashboards</div>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold relative group",
              isActive 
                ? "bg-primary text-white shadow-[0_0_20px_rgba(251,26,26,0.3)]" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-white/40 group-hover:text-white")} /> 
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
