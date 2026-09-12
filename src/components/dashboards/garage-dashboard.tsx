"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateRequestStatusAction } from "@/lib/requests";
import { respondToRatingAction } from "@/lib/ratings";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MessageSquare, 
  Check, 
  X, 
  Play,
  RotateCcw,
  ExternalLink,
  Zap,
  ShieldCheck,
  User,
  Car,
  Star,
  MessageCircle,
  CornerDownRight,
  Send,
  Calendar,
  Loader2,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FormattedDate } from "@/components/ui/formatted-date";

const STATUS_COLORS = {
  pending: "text-primary bg-primary/10 border-primary/20",
  accepted: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected: "text-white/20 bg-white/5 border-white/10",
};

interface GarageDashboardProps {
  initialRequests: any[];
  stats: any;
  initialRatings: any[];
  userName: string;
}

export function GarageDashboard({ initialRequests, stats, initialRatings, userName }: GarageDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "completed" | "rejected" | "reviews">("pending");
  const [isPending, startTransition] = useTransition();
  const [responseText, setResponseText] = useState<{ [key: number]: string }>({});
  const [isResponding, setIsResponding] = useState<{ [key: number]: boolean }>({});
  
  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const filteredRequests = initialRequests.filter(r => r.status === activeTab);

  const handleUpdateStatus = async (id: number, status: "accepted" | "completed" | "rejected") => {
    startTransition(async () => {
      await updateRequestStatusAction(id, status);
      router.refresh();
    });
  };

  const tabs = [
    { id: "pending", label: "Pending Ops", icon: Clock, count: stats.pending },
    { id: "accepted", label: "Active Jobs", icon: Play, count: stats.accepted },
    { id: "completed", label: "Completed", icon: CheckCircle2, count: stats.completed },
    { id: "reviews", label: "Reviews", icon: Star, count: initialRatings.length },
    { id: "rejected", label: "History", icon: RotateCcw, count: stats.rejected },
  ] as const;

  const handleResponseSubmit = async (ratingId: number) => {
    if (!responseText[ratingId]?.trim()) return;
    
    setIsResponding(prev => ({ ...prev, [ratingId]: true }));
    try {
      await respondToRatingAction(ratingId, responseText[ratingId]);
      setResponseText(prev => ({ ...prev, [ratingId]: "" }));
      router.refresh();
    } catch (err) {
      console.error("Failed to respond:", err);
    } finally {
      setIsResponding(prev => ({ ...prev, [ratingId]: false }));
    }
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
              Command Center
           </div>
           <h1 className="text-5xl font-black font-outfit uppercase italic tracking-tighter text-white">Welcome <span className="text-primary">{userName}</span></h1>
        </div>
        <Link href="/profile">
           <Button size="lg" variant="outline" className="h-16 px-8 rounded-[24px] border-white/10 text-white hover:bg-white/5 font-black uppercase italic tracking-widest text-[13px] transition-all">
              Settings
           </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {tabs.map((tab) => (
          <Card key={tab.id} className="border-white/5 bg-white/[0.01] rounded-[32px] overflow-hidden glass hover:border-primary/20 transition-all group">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", (STATUS_COLORS as any)[tab.id])}>
                   <tab.icon className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black font-outfit text-white">{tab.count}</span>
              </div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] italic">{tab.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Controller */}
      <div className="flex p-2 bg-white/[0.03] rounded-[24px] border border-white/5 backdrop-blur-xl w-full md:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 md:flex-initial flex items-center justify-center gap-3 py-4 px-8 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all italic",
              activeTab === tab.id 
                ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Requests Feed */}
      <div className="min-h-[500px] relative">
        <AnimatePresence mode="wait">
          {activeTab === "reviews" ? (
            <motion.div 
              key="reviews"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-6"
            >
              {initialRatings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <Star className="w-16 h-16 text-white/5 mb-6" />
                  <p className="text-white/20 font-black uppercase italic tracking-widest">No customer signals received.</p>
                </div>
              ) : (
                initialRatings.map((rating) => (
                  <Card key={rating.id} className="bg-white/[0.01] rounded-[40px] border-white/5 glass overflow-hidden">
                    <CardContent className="p-10">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="text-xl font-black text-white font-outfit uppercase italic">{rating.userName}</p>
                                <div className="flex gap-1.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("w-4 h-4", i < rating.stars ? "text-primary fill-primary shadow-[0_0_10px_rgba(251,26,26,0.3)]" : "text-white/10")} />
                                  ))}
                                </div>
                              </div>
                              <FormattedDate date={rating.createdAt} type="date" className="text-[10px] text-white/20 font-black uppercase tracking-widest italic" />
                           </div>
                           <p className="text-lg text-white/70 italic leading-relaxed font-medium">"{rating.comment}"</p>
                           
                           {rating.response ? (
                             <div className="bg-primary/5 border border-primary/20 p-8 rounded-[32px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 -z-10">
                                   <MessageCircle className="w-16 h-16 text-primary" />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                   <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                      <CornerDownRight className="w-4 h-4 text-primary" />
                                   </div>
                                   <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Your Transmission</span>
                                </div>
                                <p className="text-white italic text-base leading-relaxed">{rating.response}</p>
                             </div>
                           ) : (
                             <div className="space-y-4 pt-4 border-t border-white/5">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic">Compose Response</span>
                                <div className="flex gap-4">
                                  <textarea
                                    className="flex-1 min-h-[100px] bg-white/5 border border-white/5 rounded-[24px] p-6 text-white text-sm italic focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                                    placeholder="Thank the customer or address concerns..."
                                    value={responseText[rating.id] || ""}
                                    onChange={(e) => setResponseText(prev => ({ ...prev, [rating.id]: e.target.value }))}
                                  />
                                  <Button 
                                    className="w-20 rounded-[24px] bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-2xl shadow-primary/20"
                                    onClick={() => handleResponseSubmit(rating.id)}
                                    disabled={isResponding[rating.id]}
                                  >
                                    {isResponding[rating.id] ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                  </Button>
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          ) : filteredRequests.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 opacity-20">
                <Zap className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black font-outfit uppercase italic text-white/20 tracking-widest italic">No {activeTab} Transmissions</h3>
              <p className="text-white/10 text-sm font-medium mt-2">All sectors are currently clear.</p>
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="grid gap-6"
            >
              {filteredRequests.map((req) => (
                <Card key={req.id} className="group hover:border-primary/30 transition-all duration-500 bg-white/[0.01] rounded-[40px] border-white/5 overflow-hidden glass relative">
                  <div className="absolute top-0 right-0 p-12 -z-10 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Zap className="w-40 h-40 text-primary stroke-[1.5]" />
                  </div>
                  
                  <CardContent className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[24px] bg-primary/20 flex items-center justify-center border border-primary/20 shadow-inner">
                             <User className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-4">
                              <h3 className="text-2xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">{req.userName || "Distress Caller"}</h3>
                              <span className={cn("text-[10px] px-3 py-1 rounded-full border border-primary/20 uppercase font-black tracking-widest italic", (STATUS_COLORS as any)[req.status])}>
                                {req.status}
                              </span>
                            </div>
                             <div className="flex items-center gap-3 mt-2 text-white/40">
                                <Clock className="w-3.5 h-3.5" />
                                <FormattedDate date={req.createdAt} className="text-[10px] font-black uppercase tracking-widest" />
                             </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
                           <div className="space-y-2">
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] italic flex items-center gap-2 pr-1"><Car className="w-3 h-3 text-primary" /> Vehicle Bio</span>
                              <p className="text-sm font-bold text-white tracking-wide">{req.vehicleType}</p>
                           </div>
                           <div className="space-y-2">
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] italic flex items-center gap-2 pr-1"><Zap className="w-3 h-3 text-primary" /> Failure Report</span>
                              <p className="text-sm font-medium text-white/60 italic leading-relaxed">{req.problem}</p>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 w-full md:w-auto">
                        {/* Garage owner can only chat once request is accepted or completed */}
                        {["accepted", "completed"].includes(req.status) && (
                          <Link href={`/chat/${req.id}`} className="w-full">
                            <Button variant="outline" size="lg" className="w-full h-16 rounded-[20px] bg-white/5 border-white/10 hover:bg-primary/10 hover:border-primary/40 group relative overflow-hidden transition-all">
                              <MessageSquare className="w-5 h-5 mr-3 text-primary group-hover:scale-125 transition-transform" /> 
                              <span className="font-black uppercase tracking-widest text-[11px] italic">Open Chat Link</span>
                            </Button>
                          </Link>
                        )}

                        {req.status === "pending" && (
                          <div className="flex gap-3">
                            <Button 
                              size="lg" 
                              className="flex-1 h-16 rounded-[20px] bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[11px]"
                              onClick={() => handleUpdateStatus(req.id, "accepted")}
                              disabled={isPending}
                            >
                              <Check className="w-5 h-5 mr-3" /> Claim
                            </Button>
                            <Button 
                              size="lg" 
                              variant="outline"
                              className="w-16 h-16 rounded-[20px] border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                              onClick={() => handleUpdateStatus(req.id, "rejected")}
                              disabled={isPending}
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        )}
                        {req.status === "accepted" && (
                          <Button 
                            size="lg" 
                            className="w-full h-16 rounded-[20px] bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest text-[11px]"
                            onClick={() => handleUpdateStatus(req.id, "completed")}
                            disabled={isPending}
                          >
                            <CheckCircle2 className="w-5 h-5 mr-3" /> Complete Ops
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
