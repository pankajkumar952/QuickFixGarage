"use client";

import { useState, useTransition } from "react";
import { addAdminAction } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, CheckCircle, Loader2, UserPlus } from "lucide-react";

export function AddAdminForm({ currentEmail }: { currentEmail: string }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      const res = await addAdminAction({
        currentEmail,
        currentPassword,
        newName,
        newEmail,
        newPassword
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("New Admin Account created successfully!");
        setCurrentPassword("");
        setNewName("");
        setNewEmail("");
        setNewPassword("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
          <ShieldAlert className="w-5 h-5 shrink-0" /> {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500 text-sm font-bold">
          <CheckCircle className="w-5 h-5 shrink-0" /> {successMsg}
        </div>
      )}

      <div className="space-y-4 p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
        <div>
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-1 block">New Admin Details</label>
          <div className="space-y-3">
            <Input 
              placeholder="Name" 
              className="bg-background border-white/10 text-white" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Input 
              type="email"
              placeholder="Email Address" 
              className="bg-background border-white/10 text-white" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Input 
              type="password"
              placeholder="Secure Password (min 6 chars)" 
              className="bg-background border-white/10 text-white" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <label className="text-[10px] font-black text-red-500/80 uppercase tracking-widest pl-1 mb-1 block">Authorization Required</label>
          <p className="text-xs text-white/30 italic px-1">Verify your identity to authorize creation.</p>
          <Input 
            type="password"
            placeholder="Your Current Password" 
            className="bg-background border-red-500/30 text-white focus-visible:ring-red-500" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest transition-all group">
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <><UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Create Admin Node</>
        )}
      </Button>
    </form>
  );
}
