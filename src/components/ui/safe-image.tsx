"use client";

import { useState, useEffect } from "react";

export function SafeImage({ src, alt, fallbackSrc, className }: { src: string, alt: string, fallbackSrc: string, className?: string }) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      onError={() => { 
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }} 
    />
  );
}
