"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

interface LiveTrackingMapProps {
  userLocation: { lat: number; lng: number };
  garageLocation: { lat: number; lng: number };
  className?: string;
}

export default function LiveTrackingMap({ 
  userLocation, 
  garageLocation,
  className 
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const mechanicMarkerRef = useRef<L.Marker | null>(null);
  const [eta, setEta] = useState(12);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([userLocation.lat, userLocation.lng], 14);

      L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: '&copy; Google Maps',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20
      }).addTo(leafletMap.current);
    }
    
    const map = leafletMap.current;

    // User Marker
    const userIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping"></div>
          <div class="relative w-5 h-5 bg-primary border-2 border-white rounded-full shadow-[0_0_20px_rgba(251,26,26,0.6)]"></div>
        </div>
      `,
      className: "",
      iconAnchor: [24, 24],
    });
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);

    // Garage Marker
    const garageIcon = L.divIcon({
      html: `
        <div class="w-10 h-10 rounded-xl bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
             <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
             <polyline points="9 22 9 12 15 12 15 22"></polyline>
           </svg>
        </div>
      `,
      className: "",
      iconAnchor: [20, 20],
    });
    L.marker([garageLocation.lat, garageLocation.lng], { icon: garageIcon }).addTo(map);

    // Fit bounds to show both
    const bounds = L.latLngBounds([userLocation.lat, userLocation.lng], [garageLocation.lat, garageLocation.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Mechanic Marker (Simulating Movement)
    const mechanicIcon = L.divIcon({
      html: `
        <div class="w-12 h-12 rounded-full bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] border-4 border-white flex items-center justify-center z-50">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
             <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
             <circle cx="7" cy="17" r="2"/>
             <path d="M9 17h6"/>
             <circle cx="17" cy="17" r="2"/>
           </svg>
        </div>
      `,
      className: "",
      iconAnchor: [24, 24],
    });

    if (mechanicMarkerRef.current) {
      mechanicMarkerRef.current.remove();
    }
    
    // Start at garage
    mechanicMarkerRef.current = L.marker([garageLocation.lat, garageLocation.lng], { icon: mechanicIcon }).addTo(map);

    // Animate mechanic towards user
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.01;
      if (progress >= 1) {
        clearInterval(interval);
        setEta(0);
        return;
      }
      
      const currentLat = garageLocation.lat + (userLocation.lat - garageLocation.lat) * progress;
      const currentLng = garageLocation.lng + (userLocation.lng - garageLocation.lng) * progress;
      
      mechanicMarkerRef.current?.setLatLng([currentLat, currentLng]);
      setEta(Math.max(1, Math.ceil(12 * (1 - progress))));
    }, 1000); // Update every second

    return () => clearInterval(interval);

  }, [userLocation, garageLocation]);

  return (
    <div className={cn("w-full h-full relative", className)}>
      <div ref={mapRef} className="w-full h-full bg-[#0b0e14] rounded-3xl overflow-hidden" />
      
      {/* ETA Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] glass px-8 py-4 rounded-[24px] border-white/10 shadow-2xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 animate-pulse">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 italic">Live Tracking</p>
          <p className="text-2xl font-bold font-outfit text-white">
            {eta === 0 ? "Arrived!" : `ETA: ${eta} Mins`}
          </p>
        </div>
      </div>
    </div>
  );
}
