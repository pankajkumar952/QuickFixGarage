"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Base64ViewerProps {
  url: string;
  label: string;
  className?: string;
  icon?: any;
}

export function Base64Viewer({ url, label, className, icon: Icon = ExternalLink }: Base64ViewerProps) {
  const [open, setOpen] = useState(false);
  
  // If it's not a data URL, we can safely just use an anchor tag
  if (!url.startsWith("data:")) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        {label} <Icon className="w-3 h-3" />
      </a>
    );
  }

  return (
    <>
      <button 
        type="button" 
        onClick={() => setOpen(true)} 
        className={cn("flex items-center gap-1 cursor-pointer transition-colors", className)}
      >
        {label} <Icon className="w-3 h-3" />
      </button>
      
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setOpen(false)}>
          <div 
            className="relative w-full max-w-[500px] aspect-square flex flex-col bg-[#09090b] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shrink-0">
              <h3 className="text-white font-black uppercase italic tracking-widest text-sm">{label}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpen(false)} 
                className="text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/80">
              {url.startsWith("data:application/pdf") ? (
                <iframe src={url} className="w-full h-full border-0" />
              ) : (
                <img src={url} alt={label} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5 shrink-0">
              <Button 
                className="w-full h-14 rounded-[20px] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 text-white font-black uppercase tracking-widest text-xs italic transition-all"
                onClick={() => setOpen(false)}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
