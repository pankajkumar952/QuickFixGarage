"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

interface RegistrationMapProps {
  location: { lat: number; lng: number };
  setLocation: (loc: { lat: number; lng: number }) => void;
}

export default function RegistrationMap({ location, setLocation }: RegistrationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const isLocating = useRef(false);

  // Auto-detect location on first mount
  useEffect(() => {
    if (!isLocating.current && navigator.geolocation) {
      isLocating.current = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          if (leafletMap.current) {
            leafletMap.current.setView([latitude, longitude], 15);
            if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
          }
        },
        (err) => console.log("Geolocation error:", err.message),
        { enableHighAccuracy: true }
      );
    }
  }, [setLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([location.lat, location.lng], 13);

      L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: '&copy; Google Maps',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20
      }).addTo(leafletMap.current);

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

      // Create initial marker
      const garageIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-primary/20 rounded-full animate-pulse"></div>
            <div class="w-6 h-6 bg-primary border-2 border-white rounded-full shadow-lg"></div>
          </div>
        `,
        className: "",
        iconAnchor: [12, 12],
      });

      markerRef.current = L.marker([location.lat, location.lng], { 
        icon: garageIcon,
        draggable: true 
      }).addTo(leafletMap.current);

      // Listen for marker drag
      markerRef.current.on("dragend", (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        setLocation({ lat: position.lat, lng: position.lng });
      });

      // Listen for map click to reposition marker
      leafletMap.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          setLocation({ lat, lng });
        }
      });
    }
  }, [location, setLocation]);

  return (
    <div ref={mapRef} className="w-full h-full bg-[#0b0e14] relative">
      <button 
        onClick={() => {
           navigator.geolocation.getCurrentPosition((pos) => {
             const { latitude, longitude } = pos.coords;
             setLocation({ lat: latitude, lng: longitude });
             leafletMap.current?.setView([latitude, longitude], 15);
             markerRef.current?.setLatLng([latitude, longitude]);
           });
        }}
        className="absolute bottom-20 right-2 z-[1000] w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-100"
        title="Detect My Location"
      >
        <MapPin className="w-5 h-5 text-primary" />
      </button>
    </div>
  );
}
