"use client";

import { Navbar } from "@/components/navbar";
import { User, Store, ArrowRight, ArrowLeft, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-inter">
      <Navbar />
      
      {/* Immersive Background Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-20 space-y-16 text-center"
      >
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(251,26,26,0.4)] mb-8"
          >
            <Zap className="w-8 h-8 text-white fill-current" />
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black font-outfit uppercase italic tracking-tighter text-white leading-tight">
            Select Your <span className="text-primary italic">Role</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/40 font-medium italic">
            Join the world's most advanced emergency roadside ecosystem. <br/> Choose your mission parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Driver Role */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }} 
            className="group relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-[56px] blur-[30px] opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <Link href="/register?role=user">
              <div className="relative h-full p-10 lg:p-14 rounded-[56px] bg-[#080808]/80 border border-white/5 backdrop-blur-3xl flex flex-col items-center text-center gap-10 group-hover:border-primary/50 transition-all overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 -rotate-12">
                   <User className="w-32 h-32 text-primary" />
                </div>
                
                <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-primary transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(251,26,26,0.5)] group-hover:scale-110">
                  <User className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                </div>
                
                <div className="space-y-4 relative z-10">
                  <h3 className="text-3xl font-black font-outfit uppercase italic tracking-tighter">Customer</h3>
                  <p className="text-white/40 font-medium text-sm leading-relaxed italic">
                    Stranded on the road? Deploy a distress beacon and sync with verified rescue nodes instantly.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic pt-4">
                  Sign Up <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-500" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Provider Role */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }} 
            className="group relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-[56px] blur-[30px] opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <Link href="/register?role=owner">
              <div className="relative h-full p-10 lg:p-14 rounded-[56px] bg-[#080808]/80 border border-white/5 backdrop-blur-3xl flex flex-col items-center text-center gap-10 group-hover:border-primary/50 transition-all overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 -rotate-12">
                   <Store className="w-32 h-32 text-primary" />
                </div>

                <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-primary transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(251,26,26,0.5)] group-hover:scale-110">
                  <Store className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                </div>
                
                <div className="space-y-4 relative z-10">
                  <h3 className="text-3xl font-black font-outfit uppercase italic tracking-tighter">Garage Owner</h3>
                  <p className="text-white/40 font-medium text-sm leading-relaxed italic">
                    Register your station. Accept missions. Scale your enterprise within the live grid.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic pt-4">
                  Sign Up <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-500" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-8"
        >
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] italic">
            Secure Authorization Protocol v4.0.2 Active
          </p>
          <div className="mt-8 flex items-center justify-center gap-8">
             <button 
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors italic group"
             >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-2 transition-transform" /> Back to Home
             </button>
             <div className="w-px h-10 bg-white/5" />
             <Link 
              href="/login"
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors italic underline"
             >
                Already have an account? Sign In
             </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
