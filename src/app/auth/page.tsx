"use client";

import { Suspense } from "react";
import { AuthHub } from "@/components/auth/auth-hub";

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 animate-pulse border border-primary/20" />
      </div>
    }>
      <AuthHub />
    </Suspense>
  );
}
