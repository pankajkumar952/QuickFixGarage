"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { 
  Zap, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Shield,
  Smartphone,
  Navigation,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function HomePage() {
  const { data: session } = useSession();
  const isOwner = session?.user && (session.user as any).role === "owner";
  const isUser = session?.user && (session.user as any).role === "user";

  const heroLink = isOwner ? "/dashboard" : isUser ? "/map" : "/auth/role";
  const heroText = isOwner ? "Go to Dashboard" : isUser ? "Request Help Now" : "Get Started Now";

  return (
    <main className="min-h-screen w-full bg-background flex flex-col selection:bg-primary/20">

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Orbital */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] -z-10 opacity-20">
           <svg viewBox="0 0 100 100" className="w-full h-full stroke-primary/30 fill-none stroke-[0.1]">
              <circle cx="50" cy="50" r="40" className="animate-[spin_40s_linear_infinite]" strokeDasharray="1 4" />
              <circle cx="50" cy="50" r="30" className="animate-[spin_30s_linear_infinite_reverse]" strokeDasharray="2 6" />
              <circle cx="50" cy="50" r="20" className="animate-[spin_20s_linear_infinite]" strokeDasharray="1 8" />
           </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest leading-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen Assistance
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter text-white font-outfit uppercase italic leading-[0.9]">
              Roadside <span className="text-primary">Reliability</span> <br />
              <span className="text-white/40">In real-time.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Find the closest verified garage instantly. Live tracking, transparent pricing, and 24/7 hyper-fast support for every driver.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href={heroLink}>
                <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(251,26,26,0.3)] hover:scale-105 transition-transform group">
                  {heroText} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl border-white/10 hover:bg-white/5 bg-transparent backdrop-blur-sm">
                  View Services
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-black text-white font-outfit">12min</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Response Time</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white font-outfit">2k+</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verified Garages</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white font-outfit">99.9%</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reliability Rate</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white font-outfit">4.9/5</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">User Satisfaction</div>
            </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
              <div className="space-y-4">
                 <h2 className="text-4xl md:text-5xl font-black font-outfit uppercase italic leading-none">Built for the <br /><span className="text-primary underline decoration-4 underline-offset-8">Unexpected</span></h2>
                 <p className="text-muted-foreground font-medium max-w-lg">We've combined modern mapping with a powerful network of mechanical experts to keep you moving.</p>
              </div>
              <Link href="/about">
                <Button variant="link" className="text-primary font-bold uppercase tracking-widest group">
                  Learn about the tech <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Navigation} 
                title="Live Map Tracking" 
                desc="Watch your mechanic approach in real-time. No more guessing when help will arrive." 
              />
              <FeatureCard 
                icon={Shield} 
                title="Verified Experts" 
                desc="Every garage in our network undergoes a rigorous 20-point verification process." 
              />
              <FeatureCard 
                icon={Smartphone} 
                title="Tap-to-SOS" 
                desc="A single button press sends your coordinates and vehicle details to nearby pros." 
              />
           </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="pb-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto p-12 md:p-20 rounded-[48px] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 overflow-hidden relative"
        >
          {/* Background Decorative Blob */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase italic leading-[0.9]">
              Garage Owner? <br /><span className="text-white/40 tracking-tighter">Grow your business with us.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-medium">
              Join the future of roadside assistance. Get more customers, manage requests digitally, and build your reputation.
            </p>
            <div className="pt-4">
              <Link href="/auth/role?mode=register&role=owner">
                <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl bg-white text-black hover:bg-white/90">
                  Join as a Provider
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER STRIP */}
      <footer className="border-t border-white/5 py-12 bg-black">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="font-outfit font-black tracking-tighter text-xl uppercase">QuickFix <span className="text-primary italic">Garage</span></span>
           </div>
           <div className="flex gap-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Safety</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
           </div>
           <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              © 2026 QuickFix Garage Platform
           </div>
         </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-colors space-y-6"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-bold font-outfit">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm font-medium">{desc}</p>
      </div>
      <div className="flex items-center gap-2 pt-4">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Premium Feature</span>
      </div>
    </motion.div>
  );
}
