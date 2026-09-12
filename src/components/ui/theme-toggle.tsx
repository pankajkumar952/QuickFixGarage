"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";

import { usePathname } from "next/navigation";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for theme preference
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsLight(true);
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      // Fix images and maps so they don't invert
      const style = document.createElement("style");
      style.id = "invert-fix-style";
      style.innerHTML = `
        img, video, canvas, .leaflet-container {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      setIsLight(false);
      localStorage.setItem("theme", "dark");
      document.documentElement.style.filter = "";
      const style = document.getElementById("invert-fix-style");
      if (style) style.remove();
    } else {
      setIsLight(true);
      localStorage.setItem("theme", "light");
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      const style = document.createElement("style");
      style.id = "invert-fix-style";
      style.innerHTML = `
        img, video, canvas, .leaflet-container {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-[9999] h-12 w-12 rounded-full border-white/20 bg-[#030303] text-white shadow-2xl hover:bg-white/10"
      title="Toggle Light/Dark Mode"
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
