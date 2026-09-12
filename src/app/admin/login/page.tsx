"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Loader2, ArrowRight } from "lucide-react";
import { loginAction } from "@/lib/actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("redirectTo", "/admin");

    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 relative font-inter overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#080808]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-10 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-black font-outfit uppercase italic tracking-tighter text-white">System <span className="text-red-500">Admin</span></h1>
          <p className="text-white/40 text-sm font-medium mt-2">Restricted Access. Authenticate to proceed.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-red-500">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Admin ID</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="h-14 bg-white/5 border-white/10 text-white font-bold"
              placeholder="admin@system.local"
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Passcode</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="h-14 bg-white/5 border-white/10 text-white font-bold tracking-[0.2em]"
              placeholder="••••••••"
              required 
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><ShieldAlert className="w-4 h-4 mr-2" /> Authorize Access</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
