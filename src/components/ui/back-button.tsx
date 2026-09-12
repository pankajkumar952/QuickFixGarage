"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";

export function UniversalBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on home page and dashboard roots maybe
  const isHidden = pathname === "/" || pathname === "/user/dashboard" || pathname === "/owner/dashboard" || pathname?.startsWith("/admin");

  if (isHidden) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-6 left-6 z-[100]"
    >
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => router.back()}
        className="rounded-full bg-white/5 backdrop-blur-xl border-white/10 hover:bg-primary hover:text-primary-foreground group transition-all"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </Button>
    </motion.div>
  );
}
