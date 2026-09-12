"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createGarageAction, updateGarageAction } from "@/lib/garages";
import { 
  Store, 
  MapPin, 
  Phone, 
  Settings, 
  Save, 
  Loader2, 
  Info,
  ExternalLink,
  CheckCircle,
  Search
} from "lucide-react";
import { motion } from "framer-motion";

interface GarageProfilePageProps {
  initialGarage?: any;
}

export default function GarageProfilePage({ initialGarage }: GarageProfilePageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState(initialGarage?.name || "");
  const [description, setDescription] = useState(initialGarage?.description || "");
  const [services, setServices] = useState(initialGarage?.services || "");
  const [phone, setPhone] = useState(initialGarage?.phone || "");
  const [address, setAddress] = useState(initialGarage?.address || "");
  const [lat, setLat] = useState(initialGarage?.lat || 12.9716); 
  const [lng, setLng] = useState(initialGarage?.lng || 77.5946);
  const [garageImageUrl, setGarageImageUrl] = useState(initialGarage?.garageImageUrl || "");
  const [govIdUrl, setGovIdUrl] = useState(initialGarage?.govIdUrl || "");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (address.trim().length > 3 && !isGeocoding) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=in`);
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error("Suggestion fetch failed:", err);
        }
      } else {
        setSuggestions([]);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [address, isGeocoding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const data = { name, description, services, phone, address, lat, lng, garageImageUrl, govIdUrl };

    try {
      if (initialGarage) {
        await updateGarageAction(initialGarage.id, data);
      } else {
        await createGarageAction(data);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleGeocode = async () => {
    if (!address) return;
    setIsGeocoding(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
      } else {
        setError("Location not found. Please try adding city/state.");
      }
    } catch (err) {
      setError("Geocoding failed.");
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 px-6 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group">
                <Store className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{initialGarage ? "Edit Garage Profile" : "Create Garage Profile"}</h1>
                <p className="text-muted-foreground mt-1">Manage your shop details and location on the map.</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-lg">Shop Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Garage Name</label>
                    <Input placeholder="e.g. Sharma Auto Motors" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      placeholder="About your garage..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-widest italic">Garage Image URL</label>
                    <Input placeholder="https://..." value={garageImageUrl} onChange={(e) => setGarageImageUrl(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-widest italic text-amber-500">Government ID URL</label>
                    <Input placeholder="https://..." value={govIdUrl} onChange={(e) => setGovIdUrl(e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-lg">Contact & Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-widest"><Phone className="w-3 h-3" /> Phone Number</label>
                      <Input placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2 relative z-50">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-widest"><MapPin className="w-3 h-3" /> Address</label>
                      <div className="flex gap-2 relative">
                        <Input 
                          placeholder="123, MG Road, Bangalore" 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setSuggestions([]);
                              handleGeocode();
                            }
                          }}
                          className="flex-1" 
                        />
                        {suggestions.length > 0 && (
                           <div className="absolute top-full left-0 right-0 mt-2 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                             {suggestions.map((s, i) => (
                               <button 
                                 key={i}
                                 type="button"
                                 onClick={() => {
                                   setAddress(s.display_name);
                                   setSuggestions([]);
                                   setLat(parseFloat(s.lat));
                                   setLng(parseFloat(s.lon));
                                 }}
                                 className="w-full text-left px-4 py-3 text-xs text-white/80 hover:bg-white/10 border-b border-white/5 last:border-0 truncate font-inter lowercase first-letter:uppercase"
                               >
                                 {s.display_name}
                               </button>
                             ))}
                           </div>
                         )}
                        <Button 
                          type="button" 
                          variant="secondary"
                          onClick={() => {
                            setSuggestions([]);
                            handleGeocode();
                          }} 
                          disabled={isGeocoding}
                          className="px-4"
                        >
                          {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats / Map Preview */}
            <div className="space-y-6">
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-lg">Geo-Location</CardTitle>
                  <CardDescription>Enter exact coordinates for mapping.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold">LATITUDE</span>
                      <Input type="number" step="any" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold">LONGITUDE</span>
                      <Input type="number" step="any" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-snug">
                      Users within a 10km radius of these coordinates will see your garage on their map.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button type="submit" className="w-full h-14 text-lg gap-2" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                </Button>
                {success && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-emerald-500 font-medium">
                    <CheckCircle className="w-4 h-4" /> Profile Updated Successfully!
                  </motion.div>
                )}
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                {initialGarage && (
                  <Button variant="outline" className="w-full border-white/10" asChild>
                    <a href={`/garage/${initialGarage.id}`} target="_blank">View Public Profile <ExternalLink className="ml-2 w-4 h-4" /></a>
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
