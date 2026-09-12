"use client";

import { useTransition } from "react";
import { updateGarageTierAction } from "@/lib/admin-actions";
import { Zap, Shield, Crown } from "lucide-react";

const tiers = [
  { id: "silver", label: "Silver", icon: Shield, color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20" },
  { id: "gold", label: "Gold", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { id: "elite", label: "Elite", icon: Crown, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
];

export function GarageTierSelector({ garageId, currentTier }: { garageId: number, currentTier: string }) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (tier: string) => {
    startTransition(async () => {
      await updateGarageTierAction(garageId, tier);
    });
  };

  const activeTier = tiers.find(t => t.id === currentTier) || tiers[0];
  const ActiveIcon = activeTier.icon;

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTier.bg} ${activeTier.color} border ${activeTier.border} w-fit`}>
        <ActiveIcon className="w-3 h-3" />
        {activeTier.label} {isPending && "..."}
      </div>
      <div className="flex gap-1">
        {tiers.map(t => (
          <button
            key={t.id}
            onClick={() => handleUpdate(t.id)}
            disabled={isPending || currentTier === t.id}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${currentTier === t.id ? t.bg + " " + t.color : "bg-white/5 text-white/40 hover:bg-white/10"}`}
            title={`Set to ${t.label}`}
          >
            <t.icon className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
