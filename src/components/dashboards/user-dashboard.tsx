"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Navigation,
  Car,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Star,
  X,
  Loader2,
  Zap,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createRatingAction } from "@/lib/ratings";
import { FormattedDate } from "@/components/ui/formatted-date";

const LiveTrackingMap = dynamic(() => import("@/components/map/live-tracking-map"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center text-muted-foreground/30 font-black uppercase tracking-widest italic">Loading Tracking Interface...</div>
});

const STATUS_COLORS = {
  pending: "text-primary bg-primary/10 border-primary/20",
  accepted: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected: "text-white/20 bg-white/5 border-white/10",
};

interface UserDashboardProps {
  initialRequests: any[];
  stats: any;
  userName: string;
}

export function UserDashboard({ initialRequests, stats, userName }: UserDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverStars, setHoverStars] = useState(0);

  const [trackRequestId, setTrackRequestId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (trackRequestId) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 12.9716, lng: 77.5946 }),
        { enableHighAccuracy: true }
      );
    }
  }, [trackRequestId]);

  // Polling to detect if a garage owner has accepted the request
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const activeRequests = initialRequests.filter(r => ["pending", "accepted"].includes(r.status));
  const historyRequests = initialRequests.filter(r => ["completed", "rejected"].includes(r.status));

  const displayRequests = activeTab === "active" ? activeRequests : historyRequests;

  return (
    <div className="space-y-12">
      {/* Welcome & Quick Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
              User Terminal
           </div>
           <h1 className="text-5xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">Welcome <span className="text-primary">{userName}</span></h1>
        </div>
        <div className="flex gap-4">
          <Link href="/profile">
             <Button size="lg" variant="outline" className="h-20 px-8 rounded-[28px] border-white/10 text-white hover:bg-white/5 font-black uppercase italic tracking-widest text-[13px] transition-all">
                Settings
             </Button>
          </Link>
          <Link href="/map">
            <Button size="lg" className="h-20 px-10 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[13px] shadow-[0_0_50px_rgba(251,26,26,0.3)] hover:scale-105 transition-all group">
              <Zap className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" /> New Help Request
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Requests List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex p-2 bg-white/[0.03] rounded-[24px] border border-white/5 backdrop-blur-xl w-fit">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "flex items-center gap-3 py-4 px-10 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all italic",
                activeTab === "active" 
                  ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              Active Node ({activeRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex items-center gap-3 py-4 px-10 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all italic",
                activeTab === "history" 
                  ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              History
            </button>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {displayRequests.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-[48px] bg-white/[0.01]"
                >
                  <div className="w-20 h-20 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 opacity-20">
                     <Car className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black font-outfit uppercase italic text-white/20 tracking-widest leading-none">No active transmissions.</h3>
                  {activeTab === "active" && (
                    <Link href="/map" className="mt-6">
                       <Button variant="link" className="text-primary font-black uppercase italic tracking-widest text-[10px] hover:text-primary/80">Activate Locator Engine <ArrowRight className="w-3 h-3 ml-2" /></Button>
                    </Link>
                  )}
                </motion.div>
              ) : (
                displayRequests.map((req, idx) => (
                  <motion.div 
                    key={req.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="hover:border-primary/30 transition-all duration-500 bg-white/[0.01] rounded-[40px] border-white/5 overflow-hidden glass group relative">
                      <div className="absolute top-0 right-0 p-10 -z-10 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Zap className="w-32 h-32 text-primary" />
                      </div>

                      <CardContent className="p-8 md:p-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                          <div className="flex-1 space-y-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                                 <Zap className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-2xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">{req.garageName || "Unknown Node"}</h3>
                                  <span className={cn("text-[9px] px-2.5 py-1 rounded-full border border-primary/20 uppercase font-black tracking-widest italic", (STATUS_COLORS as any)[req.status])}>
                                    {req.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-white/40">
                                  <div className="flex items-center gap-2">
                                     <Calendar className="w-3 h-3" />
                                     <FormattedDate date={req.createdAt} type="date" className="text-[10px] font-black uppercase tracking-widest italic" />
                                  </div>
                                  <div className="flex items-center gap-2 text-primary">
                                     <Clock className="w-3 h-3" />
                                     <FormattedDate date={req.createdAt} type="time" className="text-[10px] font-black uppercase tracking-widest italic" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 pl-16">
                              <p className="text-lg font-black text-white italic tracking-tight">{req.vehicleType}</p>
                              <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 border-l-primary/50 border-l-2">
                                 <p className="text-sm font-medium text-white/60 leading-relaxed italic line-clamp-2">"{req.problem}"</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                            {/* Open Chat available for both pending (to ask questions) and accepted */}
                            {/* Chat proceed only if accepted/completed */}
                            {["accepted", "completed"].includes(req.status) ? (
                              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <Link href={`/chat/${req.id}`} className="w-full md:flex-1">
                                  <Button size="lg" className="w-full h-16 rounded-[22px] bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[11px] shadow-2xl shadow-primary/20">
                                    <MessageSquare className="w-4 h-4 mr-3" /> <span>Open Chat</span>
                                  </Button>
                                </Link>
                                {req.status === "accepted" && (
                                  <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${req.garageLat},${req.garageLng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full md:flex-1"
                                  >
                                    <Button 
                                      size="lg" 
                                      variant="outline" 
                                      className="w-full h-16 rounded-[22px] border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group/nav"
                                    >
                                      <Navigation className="w-4 h-4 text-primary mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                      <span className="font-black uppercase italic tracking-widest text-[11px] text-white">Live Route</span>
                                    </Button>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="flex-1 px-6 py-4 rounded-[22px] bg-white/5 border border-white/5 flex items-center justify-center gap-3 animate-pulse">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Waiting for Acceptance</span>
                              </div>
                            )}
                            {req.status === "completed" && (
                              <Button 
                                size="lg" 
                                variant="outline" 
                                className="w-full h-16 rounded-[22px] border-primary/20 bg-primary/5 text-primary font-black uppercase italic tracking-widest text-[11px] hover:bg-primary/10 transition-all"
                                onClick={() => {
                                  setSelectedRequestId(req.id);
                                  setIsReviewModalOpen(true);
                                }}
                              >
                                 Review Operation
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Sidebar Stats / Info */}
        <div className="space-y-8">
          <Card className="border-white/5 bg-gradient-to-br from-primary/10 to-transparent rounded-[40px] glass overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-32 h-32 text-primary" />
            </div>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black font-outfit uppercase italic tracking-tighter text-white">System Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Live Connections</span>
                <span className="text-2xl font-black font-outfit text-primary">{activeRequests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Successful Ops</span>
                <span className="text-2xl font-black font-outfit text-white">{stats.completed}</span>
              </div>
              
              <div className="mt-8 flex items-start gap-4 p-5 rounded-[24px] bg-amber-500/5 border border-amber-500/10 text-amber-500/80">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold leading-relaxed italic">
                  Emergency response times may vary based on terminal proximity and mechanic load.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/[0.01] rounded-[40px] glass overflow-hidden group">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">Logistics <span className="text-primary italic">Bridge</span></CardTitle>
              <CardDescription className="text-white/30 font-medium text-xs mt-3">Reserve secondary transport via satellite link.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Button variant="outline" className="w-full h-16 rounded-[20px] border-white/5 bg-white/5 hover:bg-white/10 group transition-all" asChild>
                <a href="https://m.uber.com" target="_blank" className="font-black uppercase tracking-widest text-[10px] italic">
                   Reserve Uber Link <Navigation className="ml-3 w-4 h-4 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackRequestId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setTrackRequestId(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl h-[80vh] glass border border-white/20 rounded-[48px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <button 
                className="absolute top-8 right-8 z-50 text-white/40 hover:text-white transition-all bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10"
                onClick={() => setTrackRequestId(null)}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex-1 w-full h-full p-2">
                {userLocation && initialRequests.find(r => r.id === trackRequestId)?.garageLat ? (
                  <LiveTrackingMap 
                    userLocation={userLocation}
                    garageLocation={{
                      lat: initialRequests.find(r => r.id === trackRequestId).garageLat,
                      lng: initialRequests.find(r => r.id === trackRequestId).garageLng
                    }}
                  />
                ) : (
                  <div className="flex w-full h-full items-center justify-center text-primary font-black uppercase tracking-widest italic">
                    <Loader2 className="animate-spin w-10 h-10 mr-4" /> Syncing Coordinates...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !isSubmitting && setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass-red border border-primary/20 rounded-[48px] p-10 md:p-14 shadow-2xl relative z-10"
            >
              <button 
                className="absolute top-10 right-10 text-white/40 hover:text-white transition-all scale-125"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-12 space-y-4">
                <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
                   Operation Debrief
                </div>
                <h3 className="text-5xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">Rate <span className="text-primary">Service</span></h3>
                <p className="text-white/40 text-lg font-medium leading-relaxed italic">Your signal helps strengthen the local node network.</p>
              </div>

              <div className="space-y-10">
                <div className="flex flex-col items-center gap-4">
                   <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatingStars(star)}
                          onMouseEnter={() => setHoverStars(star)}
                          onMouseLeave={() => setHoverStars(0)}
                          className="transition-all transform hover:scale-125 active:scale-95"
                          disabled={isSubmitting}
                        >
                          <Star 
                            className={cn(
                              "w-12 h-12 transition-all",
                              (hoverStars || ratingStars) >= star 
                                ? "text-primary fill-primary drop-shadow-[0_0_15px_rgba(251,26,26,0.6)]" 
                                : "text-white/10"
                            )} 
                          />
                        </button>
                      ))}
                   </div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">
                      {ratingStars === 5 ? "Elite Execution" : ratingStars === 4 ? "Exceptional" : ratingStars === 3 ? "Mission Accomplished" : ratingStars === 2 ? "System Friction" : "Critical Failure"}
                   </p>
                </div>

                <div className="space-y-4">
                   <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] pl-1 italic">Mission Brief (Optional)</label>
                   <textarea 
                     className="flex min-h-[140px] w-full rounded-[32px] border border-white/5 bg-white/5 px-6 py-5 text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-white placeholder:text-white/20 transition-all shadow-inner italic"
                     placeholder="How did the operation go?..."
                     value={ratingComment}
                     onChange={(e) => setRatingComment(e.target.value)}
                     disabled={isSubmitting}
                   />
                </div>

                <Button 
                  className="w-full h-20 text-2xl font-black font-outfit uppercase italic tracking-widest rounded-3xl shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-white group"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!selectedRequestId) return;
                    setIsSubmitting(true);
                    try {
                      await createRatingAction({
                        requestId: selectedRequestId,
                        stars: ratingStars,
                        comment: ratingComment
                      });
                      setIsReviewModalOpen(false);
                      setRatingComment("");
                      setRatingStars(5);
                      router.refresh();
                    } catch (err) {
                      console.error("Submission failed:", err);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <><CheckCircle2 className="w-6 h-6 mr-3 fill-current group-hover:scale-125 transition-transform" /> Confirm Log</>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
