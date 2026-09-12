"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { listGaragesAction } from "@/lib/garages";
import { createRequestAction } from "@/lib/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Navigation, 
  MapPin, 
  Star, 
  MessageSquare, 
  Car, 
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Search,
  LocateFixed,
  Store
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { listGarageRatingsAction } from "@/lib/ratings";
import { Session } from "next-auth";
import { FormattedDate } from "@/components/ui/formatted-date";
import { SafeImage } from "@/components/ui/safe-image";

// Dynamic import of MapClient to avoid SSR issues with Leaflet
const MapClient = dynamic(() => import("@/components/map/map-client"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center text-muted-foreground/30 font-black uppercase tracking-widest italic">Initializing Satellite...</div>
});

export function MapViewV2({ session: propSession }: { session?: Session | null }) {
  const { data: clientSession, status: authStatus } = useSession();
  const session = clientSession || propSession;
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [garages, setGarages] = useState<any[]>([]);
  const [selectedGarageId, setSelectedGarageId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"idle" | "success" | "error">("idle");
  const [vehicleType, setVehicleType] = useState("");
  const [problem, setProblem] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [garageRatings, setGarageRatings] = useState<any[]>([]);
  const [isRatingsLoading, setIsRatingsLoading] = useState(false);


  const [isLocating, setIsLocating] = useState(false);

  const handleRecenter = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const selectedGarage = garages.find(g => g.id === selectedGarageId);

  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 12.9716, lng: 77.5946 }), // Fallback Bangalore
      { enableHighAccuracy: true }
    );

    // RESTORE SOS DRAFT AFTER AUTH
    const draft = sessionStorage.getItem("sos_draft");
    if (draft && authStatus === "authenticated") {
      try {
        const { vehicleType: v, problem: p, garageId: g } = JSON.parse(draft);
        setVehicleType(v);
        setProblem(p);
        setSelectedGarageId(g);
        setIsRequestModalOpen(true);
        sessionStorage.removeItem("sos_draft");
      } catch (e) {
        console.error("Failed to restore SOS draft", e);
      }
    }
  }, [authStatus]);



  useEffect(() => {
    async function loadGarages() {
      if (!userLocation) return;
      setIsLoading(true);
      // Explicitly enforce maximum 10km radius
      const data = await listGaragesAction(userLocation.lat, userLocation.lng, 10);
      setGarages(data);
      setIsLoading(false);
    }
    loadGarages();
  }, [userLocation]);

  const handleOpenRequestModal = () => {
    setIsRequestModalOpen(true);
    setRequestStatus("idle");
    setErrorMsg("");
  };

  const handleOpenProfileModal = async (garageId: number) => {
    setSelectedGarageId(garageId);
    setIsProfileModalOpen(true);
    setIsRatingsLoading(true);
    try {
      const ratings = await listGarageRatingsAction(garageId);
      setGarageRatings(ratings);
    } catch (err) {
      console.error("Failed to load ratings:", err);
    } finally {
      setIsRatingsLoading(false);
    }
  };



  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGarageId) return;

    // If session is still loading, we should wait instead of redirecting
    if (authStatus === "loading" && !propSession) {
      setErrorMsg("Verifying credentials... Please try again in a second.");
      return;
    }

    if (!session?.user) {
      sessionStorage.setItem("sos_draft", JSON.stringify({
        vehicleType,
        problem,
        garageId: selectedGarageId
      }));
      router.push(`/auth?mode=login&redirectTo=/map`);
      return;
    }

    setErrorMsg("");
    startTransition(async () => {
      try {
        const res = await createRequestAction({
          garageId: selectedGarageId,
          vehicleType,
          problem
        });
        
        if (res.error) {
          setErrorMsg(res.error);
          setRequestStatus("error");
          return;
        }

        setRequestStatus("success");
        setVehicleType("");
        setProblem("");
        
        setTimeout(() => {
          router.push(`/dashboard`);
        }, 1500);
      } catch (err) {
        console.error("Request failed:", err);
        setErrorMsg("System error. Emergency link failed.");
        setRequestStatus("error");
      }
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Map View */}
        <div className="flex-1 relative border-b md:border-b-0 md:border-r border-white/5 min-h-[50vh] md:min-h-0">
          <MapClient 
            userLocation={userLocation} 
            garages={garages} 
            selectedGarageId={selectedGarageId}
            onSelectGarage={(id) => setSelectedGarageId(id)}
          />


          
          {/* Quick Stats Overlay (Stats only, Search moved) */}
          <div className="absolute top-8 left-8 right-8 md:right-auto md:w-[400px] z-10 flex flex-col gap-4 pointer-events-none">
            {/* Stats */}
            <div className="glass p-5 rounded-[24px] flex items-center gap-5 shadow-2xl pointer-events-auto border-white/10 w-fit">
              <div className="w-12 h-12 rounded-[18px] bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(251,26,26,0.2)]">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-white/40 font-black tracking-[0.2em] uppercase block italic">Sector Scanned</span>
                <span className="text-xl font-bold font-outfit text-white leading-none">{garages.length} Nodes Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Garage List */}
        <aside className="w-full md:w-[400px] flex flex-col bg-background/80 backdrop-blur-3xl overflow-hidden glass z-20 h-[50vh] md:h-auto">
          <div className="p-8 border-b border-white/5 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black font-outfit uppercase italic tracking-tighter text-white">Nearby <span className="text-primary">Garages</span></h2>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Scanning 10km radius</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 shrink-0">
                <Button 
                  onClick={handleRecenter}
                  disabled={isLocating}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center p-0 shadow-lg"
                  title="Recenter to my location"
                >
                  <LocateFixed className={cn("w-5 h-5 text-primary", isLocating && "animate-pulse")} />
                </Button>
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40 italic">Recenter</span>
              </div>
            </div>
            

          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-5 scrollbar-none">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-40 glass rounded-[32px] animate-pulse border-white/5" />)
            ) : garages.length === 0 ? (
              <div className="text-center py-24 text-white/20 font-black uppercase tracking-[0.2em] italic">
                No active nodes detected nearby.
              </div>
            ) : (
              garages.map((garage) => (
                <motion.div 
                  key={garage.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedGarageId(garage.id)}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all duration-300 rounded-[32px] overflow-hidden",
                      selectedGarageId === garage.id 
                        ? "glass-red border-primary/50 shadow-[0_0_40px_rgba(251,26,26,0.15)] ring-1 ring-primary/20" 
                        : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4 min-w-0">
                          <div className={cn(
                            "w-14 h-14 rounded-[20px] overflow-hidden flex-shrink-0 border flex items-center justify-center transition-all relative",
                            selectedGarageId === garage.id ? "border-primary/50 bg-primary/10" : "border-white/10 bg-white/5"
                          )}>
                              <SafeImage src={garage.garageImageUrl || "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=200&q=80"} fallbackSrc="https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=200&q=80" alt={garage.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg font-outfit uppercase italic tracking-tight truncate text-white">{garage.name}</h3>
                              {garage.isVerified && (
                                <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" />
                              )}
                            </div>
                            <p className="text-[11px] text-white/40 font-medium truncate">{garage.address}</p>
                          </div>
                        </div>
                        {garage.distance != null && (
                          <span className="text-[10px] font-black font-outfit uppercase italic text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            {garage.distance.toFixed(1)} KM
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 px-1">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="text-sm font-bold text-white font-outfit">{garage.avgRating ? garage.avgRating.toFixed(1) : "NEW"}</span>
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest italic ml-1">({garage.totalRatings} Operations)</span>
                      </div>

                      <AnimatePresence>
                        {selectedGarageId === garage.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-6 border-t border-white/10 mt-6 flex gap-3"
                          >
                            <Button size="sm" className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[11px] group" onClick={handleOpenRequestModal}>
                              <Zap className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" /> Request Help
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-tighter text-[11px]" onClick={() => handleOpenProfileModal(garage.id)}>
                              Profile Info
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* SOS Request Modal UI */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => requestStatus !== "success" && setIsRequestModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-lg glass-red border border-primary/20 rounded-[48px] p-10 md:p-14 shadow-[0_0_100px_rgba(251,26,26,0.15)] relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 -z-10 opacity-10">
                 <Zap className="w-32 h-32 text-primary fill-primary" />
              </div>

              {requestStatus === "success" ? (
                <div className="py-12 text-center space-y-8">
                  <div className="w-24 h-24 bg-primary/20 rounded-[32px] flex items-center justify-center mx-auto border border-primary/50 shadow-[0_0_40px_rgba(251,26,26,0.3)] animate-pulse">
                    <CheckCircle className="w-12 h-12 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-5xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">Emergency Sent</h3>
                    <p className="text-white/40 font-medium text-lg italic max-w-xs mx-auto">
                      Link established with <span className="text-primary font-bold">{selectedGarage?.name}</span>. Redirecting to dashboard...
                    </p>
                  </div>
                  <div className="flex justify-center pt-6">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    className="absolute top-10 right-10 text-white/40 hover:text-white transition-all group scale-125"
                    onClick={() => setIsRequestModalOpen(false)}
                  >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  </button>

                  <div className="mb-12 space-y-4">
                    <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
                       Distress Call Center
                    </div>
                    <h3 className="text-5xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">SOS <span className="text-primary">Request</span></h3>
                    <p className="text-white/40 text-lg font-medium leading-relaxed italic">Direct communication with {selectedGarage?.name}</p>
                  </div>

                  <form onSubmit={handleCreateRequest} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] pl-1 italic">Vehicle Signature</label>
                       <div className="relative group">
                         <Car className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within:scale-110 transition-transform" />
                         <Input 
                           placeholder="Type of Vehicle (e.g. Maruti Swift, White)" 
                           className="h-20 pl-16 rounded-3xl bg-white/5 border-white/5 text-white font-bold text-lg placeholder:text-white/20 focus:bg-primary/5 focus:border-primary/40 transition-all shadow-inner"
                           value={vehicleType}
                           onChange={(e) => setVehicleType(e.target.value)}
                           required
                         />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] pl-1 italic">Diagnostics</label>
                       <textarea 
                         className="flex min-h-[160px] w-full rounded-[32px] border border-white/5 bg-white/5 px-6 py-5 text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-white placeholder:text-white/20 transition-all shadow-inner italic"
                         placeholder="Describe the failure..."
                         value={problem}
                         onChange={(e) => setProblem(e.target.value)}
                         required
                       />
                    </div>
                    {errorMsg && (
                      <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-sm font-black uppercase tracking-widest italic">
                        <AlertCircle className="w-5 h-5" /> {errorMsg}
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-20 text-2xl font-black font-outfit uppercase italic tracking-widest rounded-3xl shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-white group" 
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <><Zap className="w-6 h-6 mr-3 fill-current group-hover:scale-125 transition-transform" /> Engage SOS</>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileModalOpen && selectedGarage && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl h-[85vh] bg-background border border-white/10 rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <button 
                className="absolute top-8 right-8 z-50 text-white/40 hover:text-white transition-all bg-white/5 p-3 rounded-2xl border border-white/5"
                onClick={() => setIsProfileModalOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex-1 overflow-y-auto scrollbar-none">
                <div className="relative h-64 md:h-80 w-full">
                  <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden flex items-center justify-end md:justify-center px-10">
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-10 pointer-events-none" />
                     <div className="absolute inset-0 z-0">
                         <SafeImage 
                           src={selectedGarage.garageImageUrl || "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1920&q=80"} 
                           fallbackSrc="https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1920&q=80"
                           alt={selectedGarage.name} 
                           className="w-full h-full object-cover opacity-50" 
                         />
                       <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                     </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10 space-y-4">
                     <div className="flex items-center gap-3">
                        <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase italic tracking-tighter text-white">{selectedGarage.name}</h2>
                        {selectedGarage.isVerified && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
                             <ShieldCheck className="w-5 h-5 text-primary" />
                             <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Verified Hub</span>
                          </div>
                        )}
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <Star className="w-5 h-5 text-primary fill-primary" />
                           <span className="text-xl font-bold text-white">{selectedGarage.avgRating?.toFixed(1) || "NEW"}</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <p className="text-white/60 font-medium italic">{selectedGarage.address}</p>
                     </div>
                  </div>
                </div>

                <div className="px-10 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="md:col-span-2 space-y-12">
                    <section className="space-y-4">
                      <h3 className="text-xl font-black font-outfit uppercase italic text-white flex items-center gap-3">
                        <Info className="w-5 h-5 text-primary" /> Operational Intel
                       </h3>
                      <p className="text-white/50 text-lg leading-relaxed italic">{selectedGarage.description || "No mission statement provided."}</p>
                    </section> section

                    <section className="space-y-8">
                       <div className="flex items-center justify-between pb-4 border-b border-white/5">
                          <h3 className="text-xl font-black font-outfit uppercase italic text-white">Service Logs (Reviews)</h3>
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic">{garageRatings.length} Operations logged</span>
                       </div>
                       
                       <div className="space-y-6">
                          {isRatingsLoading ? (
                             <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                             </div>
                          ) : garageRatings.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                               <p className="text-white/20 font-black uppercase italic tracking-widest">No service record available.</p>
                            </div>
                          ) : (
                            garageRatings.map((rating) => (
                              <div key={rating.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <p className="font-bold text-white font-outfit uppercase italic">{rating.userName}</p>
                                    <div className="flex gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("w-3 h-3", i < rating.stars ? "text-primary fill-primary" : "text-white/10")} />
                                      ))}
                                    </div>
                                  </div>
                                  <FormattedDate date={rating.createdAt} type="date" className="text-[10px] text-white/20 font-medium" />
                                </div>
                                <p className="text-sm text-white/60 italic leading-relaxed">{rating.comment}</p>
                                {rating.response && (
                                  <div className="mt-4 p-4 bg-primary/10 rounded-2xl border-l-2 border-primary">
                                    <p className="text-xs font-black text-primary uppercase italic mb-1">Response</p>
                                    <p className="text-sm text-white italic">{rating.response}</p>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                       </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                     <div className="glass p-8 rounded-[32px] border-white/10 space-y-6">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic text-center">Emergency Line</p>
                           <p className="text-2xl font-bold text-white text-center font-outfit">{selectedGarage.phone || "N/A"}</p>
                        </div>
                        <Button 
                          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest italic"
                          onClick={() => {
                            setIsProfileModalOpen(false);
                            setIsRequestModalOpen(true);
                          }}
                        >
                          Send SOS Now
                        </Button>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
