"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateUserAction, uploadFileAction } from "@/lib/actions";
import { User, Lock, Loader2, CheckCircle, Upload } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRef, useEffect } from "react";

export default function AccountProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [profileImageUrl, setProfileImageUrl] = useState((session?.user as any)?.profileImageUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setProfileImageUrl((session.user as any).profileImageUrl || "");
    }
  }, [session]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadFileAction(formData);
      if (res.url) {
        setProfileImageUrl(res.url);
      } else {
        setError(res.error || "File upload failed");
      }
    } catch (err) {
      setError("Server error during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await updateUserAction({ name, currentPassword, newPassword, profileImageUrl });
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword(""); 
      // Force session refresh
      await updateSession({ name, profileImageUrl });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-24 px-6 pb-12 flex items-center justify-center">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black font-outfit uppercase italic tracking-tighter text-white">
              Account <span className="text-primary">Settings</span>
            </h1>
            <p className="text-muted-foreground italic">Update your personal information</p>
          </div>

          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md shadow-2xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Profile
              </CardTitle>
              <CardDescription>Manage your display name and login credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-full bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all overflow-hidden group"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : profileImageUrl ? (
                      <>
                        <SafeImage src={profileImageUrl} className="w-full h-full object-cover" fallbackSrc="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <User className="w-8 h-8 text-white/30 group-hover:text-white/50" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Full Name</label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="h-12 bg-white/5 border-white/10 text-white font-bold placeholder:text-white/20"
                    placeholder="Leave blank to keep current name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        className="h-12 pl-12 bg-white/5 border-white/10 text-white font-bold placeholder:text-white/20"
                        placeholder="Required for password change"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="h-12 pl-12 bg-white/5 border-white/10 text-white font-bold placeholder:text-white/20"
                        placeholder="Leave blank to keep"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm font-bold text-red-500 italic text-center">{error}</p>}
                
                {success && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-emerald-500 font-bold italic">
                    <CheckCircle className="w-4 h-4" /> Profile Updated!
                  </motion.div>
                )}

                <Button type="submit" className="w-full h-12 text-lg font-black uppercase italic tracking-widest rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {(session?.user as any)?.role === "owner" && (
            <div className="text-center pt-4">
               <Link href="/garage-profile">
                 <Button variant="outline" className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary uppercase italic font-bold">
                   Go to Garage Profile Settings
                 </Button>
               </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
