"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Zap, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { logoutAction } from "@/lib/actions";

export function Navbar({ session: serverSession }: { session?: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: clientSession, status } = useSession();
  
  const session = serverSession || clientSession;
  const isAuthenticated = status === "authenticated" || !!(session as any)?.user;

  const navLinks = [
    { name: "Services", href: "/services" },
    ...(isAuthenticated ? [{ name: "Map", href: "/map" }] : []),
    { name: "About", href: "/about" },
  ];

  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_25px_rgba(251,26,26,0.4)] group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white font-outfit uppercase italic">
                QuickFix<span className="text-primary">Garage</span>
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-all hover:text-primary relative group",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-2 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                  pathname === link.href ? "w-full" : "w-0"
                )} />
              </Link>
            ))}
            
            <div className="h-6 w-px bg-white/10 mx-2" />

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/map">
                    <Button variant="ghost" size="sm" className="font-bold uppercase tracking-[0.2em] text-[10px] text-white hover:text-primary italic">Radar Map</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="font-bold uppercase tracking-[0.2em] text-[10px] text-primary italic">Live Dashboard</Button>
                  </Link>
                  <form action={logoutAction}>
                    <Button 
                      type="submit"
                      variant="outline" 
                      size="sm" 
                      className="border-white/10 font-black uppercase tracking-[0.2em] text-[9px] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 italic px-4"
                    >
                      Disconnect Node
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth?mode=login">
                    <Button variant="ghost" size="sm" className="font-black uppercase tracking-[0.2em] text-[10px] text-white hover:text-primary italic">Access Terminal (Sign In)</Button>
                  </Link>
                  <Link href="/auth?mode=register">
                    <Button size="sm" className="px-8 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] shadow-[0_0_30px_rgba(251,26,26,0.25)] group bg-primary hover:bg-primary/90 italic">
                      Initialize Link
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/5"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-20 border-b border-white/5 bg-background shadow-2xl z-50"
          >
            <div className="px-6 py-10 space-y-8 flex flex-col items-center text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block text-2xl font-black font-outfit uppercase italic tracking-tighter transition-colors",
                    pathname === link.href ? "text-primary" : "text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 w-full space-y-4 max-w-xs mx-auto">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest border-white/10">Dashboard</Button>
                  </Link>
                  <form action={logoutAction} className="w-full">
                    <Button 
                      type="submit"
                      variant="ghost" 
                      onClick={() => setIsOpen(false)}
                      className="w-full h-14 font-bold uppercase tracking-widest text-red-500"
                    >
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/role" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest border-white/10">Sign in</Button>
                  </Link>
                  <Link href="/auth/role" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest shadow-xl">Get Started</Button>
                  </Link>
                </>
              )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
