"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Zap, 
  Car, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Smartphone, 
  Globe, 
  Award, 
  Lock 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const values = [
    { name: "Transparency", desc: "No hidden fees. You see the price and the mechanic before you agree.", icon: ShieldCheck },
    { name: "Speed", desc: "Our decentralized network means there is always a mechanic nearby.", icon: Zap },
    { name: "Security", desc: "All mechanics are vetted and all transactions are secured.", icon: Lock },
    { name: "Reliability", desc: "24/7 service availability, even in the middle of the night.", icon: Globe },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0b0e14] relative overflow-hidden">
      <Navbar />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px]" />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-sm font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Our Mission
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Reimagining <br />
              <span className="text-primary italic">Roadside Care</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              QuickFix Garage was born out of a simple frustration: why is call-based roadside assistance so slow and opaque? <br /><br />
              We built a real-time, decentralized platform that connects stranded drivers directly with expert mechanics. Our mission is to ensure no one is ever left alone on the road.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
             <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-[40px] border-white/5 bg-white/[0.02] p-8 mt-12 hover:border-primary/20 transition-all group">
                   <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8" />
                   </div>
                   <h3 className="text-4xl font-bold mb-2">150+</h3>
                   <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Connected Garages</p>
                </Card>
                <Card className="rounded-[40px] border-white/5 bg-white/[0.02] p-8 hover:border-primary/20 transition-all group">
                   <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-8 h-8" />
                   </div>
                   <h3 className="text-4xl font-bold mb-2">5k+</h3>
                   <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Active Users</p>
                </Card>
             </div>
          </motion.div>
        </div>

        {/* Values */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold italic mb-4 uppercase">Core Values</h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[32px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-primary group-hover:bg-primary/20 transition-colors">
                  <v.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{v.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed italic">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-40 p-12 rounded-[60px] bg-primary relative overflow-hidden text-center text-primary-foreground group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-all duration-700" />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 italic">Ready to join the network?</h2>
          <div className="flex justify-center gap-4">
             <Button size="lg" variant="secondary" className="px-12 rounded-2xl font-extrabold">Get Started Now</Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
