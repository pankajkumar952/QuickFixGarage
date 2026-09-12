"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Zap, 
  Car, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Wrench, 
  Fuel, 
  Battery, 
  Navigation,
  Activity,
  ArrowRight
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    { name: "Emergency Repairs", desc: "Immediate mechanical assistance for engine failures and breakdowns.", icon: Wrench },
    { name: "Tyre Replacement", desc: "Flat tyre repair or replacement at your current location.", icon: Car },
    { name: "Fuel Delivery", desc: "Ran out of gas? We'll bring some to you immediately.", icon: Fuel },
    { name: "Battery Jumpstart", desc: "Quick battery jumpstarts or battery health checks.", icon: Battery },
    { name: "Towing Assistance", desc: "Professional towing to the nearest workshop if needed.", icon: Navigation },
    { name: "Diagnostic Scan", desc: "Mobile diagnostic scans to identify electrical or sensor issues.", icon: Activity }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-background relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-32 lg:py-48 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">
            Professional Network
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-outfit uppercase italic tracking-tighter text-white leading-[0.85]">
            Engineered <br /><span className="text-primary">Services</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Every service is handled by verified experts and trackable in real-time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
            >
              <Card className="h-full glass-red border-white/5 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden rounded-[32px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                
                <CardContent className="p-10 space-y-8 relative z-10">
                  <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary transition-all duration-500 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(251,26,26,0.5)]">
                    <service.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black font-outfit uppercase italic tracking-tighter leading-none">{service.name}</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">{service.desc}</p>
                  </div>
                  <div className="flex items-center gap-6 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> 24/7 Priority</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Certified</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Block */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 p-12 md:p-20 rounded-[64px] glass-red border border-primary/20 text-center relative overflow-hidden"
        >
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase italic leading-none">The <span className="text-primary">QuickFix</span> Advantage</h2>
            <p className="text-muted-foreground max-w-4xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
              Unlike traditional roadside assistance, we operate as a real-time, decentralized hub. This ensures the fastest response times by connecting you directly to the closest verified mechanic in our network.
            </p>
            <div className="pt-8">
               <button className="h-16 px-12 rounded-2xl bg-white text-black font-black uppercase tracking-widest italic text-lg hover:bg-white/90 transition-all flex items-center gap-3 mx-auto group">
                 Join the Force <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
