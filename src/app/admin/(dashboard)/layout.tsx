import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Users, Store, AlertTriangle, LayoutDashboard, Settings } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/logout-button";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white flex font-inter">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-white/5 bg-[#0a0a0a] flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(251,26,26,0.4)]">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black font-outfit uppercase tracking-tighter text-lg leading-tight text-white">
                QuickFix<span className="text-primary">Admin</span>
              </span>
              <span className="text-[9px] font-black uppercase text-white/30 tracking-widest leading-none">System Control</span>
            </div>
          </div>
        </div>
        
        <AdminSidebarNav />

        <div className="p-4 border-t border-white/5 mt-auto">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar for mobile */}
        <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="font-black font-outfit uppercase tracking-tighter">Admin</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="relative z-10 h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
