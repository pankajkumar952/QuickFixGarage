"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

interface MapClientProps {
  userLocation: { lat: number; lng: number } | null;
  garages: any[];
  selectedGarageId?: number | null;
  onSelectGarage: (id: number) => void;
  className?: string;
}

export default function MapClient({ 
  userLocation, 
  garages, 
  selectedGarageId,
  onSelectGarage,
  className 
}: MapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!leafletMap.current) {
      // Default to Bangalore if no location provided yet
      const initialPos: [number, number] = userLocation 
        ? [userLocation.lat, userLocation.lng] 
        : [12.9716, 77.5946];

      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(initialPos, 13);

      L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: '&copy; Google Maps',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20
      }).addTo(leafletMap.current);

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
    }
    
    const map = leafletMap.current;

    // Update User Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping"></div>
            <div class="absolute w-8 h-8 bg-primary/30 rounded-full animate-pulse"></div>
            <div class="relative w-5 h-5 bg-primary border-2 border-white rounded-full shadow-[0_0_20px_rgba(251,26,26,0.6)]"></div>
          </div>
        `,
        className: "",
        iconAnchor: [24, 24],
      });

      // Clear previous user marker by checking for a specific tag or just adding a unique one
      // For now, we just add it. In a production app, we'd track the user marker specifically.
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<span class='text-[10px] font-black uppercase tracking-widest text-primary italic'>System Locator: Active</span>");
      
      map.panTo([userLocation.lat, userLocation.lng]);
    }

    // Update Garage Markers
    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    garages.forEach((garage) => {
      const isSelected = selectedGarageId === garage.id;
      
      const garageIcon = L.divIcon({
        html: `
          <div class="transition-all duration-500 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="w-12 h-12 rounded-[18px] ${isSelected ? 'bg-primary shadow-[0_0_30px_rgba(251,26,26,0.5)]' : 'bg-black/60'} backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl relative overflow-hidden">
              ${isSelected ? '<div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>' : ''}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${isSelected ? 'text-white' : 'text-primary'} relative z-10">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            ${isSelected ? '<div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 -z-10 shadow-lg"></div>' : ''}
          </div>
        `,
        className: "",
        iconAnchor: [24, 24],
      });

      const marker = L.marker([garage.lat, garage.lng], { icon: garageIcon })
        .addTo(map)
        .on("click", () => onSelectGarage(garage.id));
      
      markersRef.current[garage.id] = marker;
    });

  }, [userLocation, garages, selectedGarageId, onSelectGarage]);

  // Center map on selected garage
  useEffect(() => {
    if (selectedGarageId && markersRef.current[selectedGarageId] && leafletMap.current) {
      const marker = markersRef.current[selectedGarageId];
      leafletMap.current.setView(marker.getLatLng(), 15, { animate: true });
    }
  }, [selectedGarageId]);

  return (
    <div 
      ref={mapRef} 
      className={cn("w-full h-full bg-[#0b0e14]", className)} 
    />
  );
}
