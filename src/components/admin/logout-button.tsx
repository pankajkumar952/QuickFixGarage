"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions";

export function AdminLogoutButton() {
  return (
    <form action={logoutAction} className="w-full">
      <button 
        type="submit"
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer transition-colors text-sm font-bold"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </form>
  );
}
