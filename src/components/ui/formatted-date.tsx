"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: string | Date | number;
  type?: "date" | "time" | "both";
  className?: string;
}

export function FormattedDate({ date, type = "both", className }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);
  const d = new Date(date);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a stable format that matches the server's initial render
    // Or a placeholder to avoid mismatch
    return <span className={className}>--:--</span>;
  }

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = d.toLocaleDateString();

  return (
    <span className={className}>
      {type === "time" ? timeStr : type === "date" ? dateStr : `${timeStr} • ${dateStr}`}
    </span>
  );
}
