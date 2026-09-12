"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Zap, 
  User, 
  Store, 
  Mail, 
  Lock, 
  Key, 
  ArrowRight, 
  MessageSquare, 
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  XCircle,
  Link2,
  Car,
  FileUp,
  ShieldCheck,
  CheckCircle,
  Search,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  sendOtpAction, 
  loginAction, 
  registerAction, 
  verifyOtpAction, 
  forgotPasswordAction, 
  resetPasswordAction,
  uploadFileAction
} from "@/lib/actions";
import dynamic from "next/dynamic";
import { SafeImage } from "@/components/ui/safe-image";

const RegistrationMap = dynamic<any>(() => import("@/components/map/registration-map"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl" />
});

export function AuthHub({ initialMode = true }: { initialMode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode ? "login" : "register");
  const [role, setRole] = useState<"user" | "owner">("user");
  
  const [step, setStep] = useState<"details" | "garage_info" | "documents" | "reset">("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [garageName, setGarageName] = useState("");
  const [services, setServices] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [govIdUrl, setGovIdUrl] = useState("");
  const [garageImageUrl, setGarageImageUrl] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const [uploadingGovId, setUploadingGovId] = useState(false);
  const [uploadingGarageImage, setUploadingGarageImage] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const govIdInputRef = useRef<HTMLInputElement>(null);
  const garageImageInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "register") setMode("register");
    else if (modeParam === "forgot") setMode("forgot");
    
    const roleParam = searchParams.get("role") as "user" | "owner";
    if (roleParam) setRole(roleParam);
  }, [searchParams]);

  useEffect(() => {
    // Mode changed, reset state
  }, [mode]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (address.trim().length > 3 && !isGeocoding && step === "garage_info") {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=in`);
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error("Suggestion fetch failed:", err);
        }
      } else {
        setSuggestions([]);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [address, isGeocoding, step]);

  const resetState = () => {
    setError("");
    setSuccess("");
    setStep("details");
    setOtp("");
    setOtpSent(false);
  };

  const handleModeChange = (newMode: "login" | "register" | "forgot") => {
    setMode(newMode);
    resetState();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "govId" | "garageImage" | "profileImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "govId") setUploadingGovId(true);
    else if (type === "garageImage") setUploadingGarageImage(true);
    else setUploadingProfileImage(true);
    
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadFileAction(formData);
      if (res.url) {
        if (type === "govId") setGovIdUrl(res.url);
        else if (type === "garageImage") setGarageImageUrl(res.url);
        else setProfileImageUrl(res.url);
      } else {
        setError(res.error || "File upload failed");
      }
    } catch (err) {
      setError("Server error during upload");
    } finally {
      if (type === "govId") setUploadingGovId(false);
      else if (type === "garageImage") setUploadingGarageImage(false);
      else setUploadingProfileImage(false);
    }
  };

  const handleGeocode = async () => {
    if (!address) return;
    setIsGeocoding(true);
    setError("");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        setError("Location not found. Please try adding city/state.");
      }
    } catch (err) {
      setError("Geocoding failed.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    setSendingOtp(true);
    setError("");
    setSuccess("");
    const res = await sendOtpAction(email, mode as any);
    setSendingOtp(false);
    if (res.error) {
      setError(res.error);
    } else {
      setOtpSent(true);
      setSuccess("OTP has been sent to your email!");
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();

    // ALL modes must verify email first
    if (!otpSent) {
      setError("Please click 'SEND OTP CODE' and verify your email first.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // 1. Verify OTP first for ALL modes
      const otpVerification = await verifyOtpAction(email, otp, mode as any);
      if (!otpVerification.success) {
        setError("Invalid or expired OTP. You must request a new one.");
        setOtpSent(false);
        setOtp("");
        setLoading(false);
        return;
      }
      if (mode === "login") {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        
        const result = await loginAction(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          const redirectTo = searchParams.get("redirectTo") || "/dashboard";
          router.push(redirectTo);
        }
      } else if (mode === "register") {
        if (role === "owner") {
          setStep("garage_info");
        } else {
          await handleFinalRegister();
        }
      } else if (mode === "forgot") {
        const res = await forgotPasswordAction(email);
        if (res.success) {
          setStep("reset");
        } else {
          setError(res.error || "No account found");
        }
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT") || err?.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
      setError("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await resetPasswordAction({ email, newPassword: password });
    setLoading(false);
    if (res.success) {
      setSuccess("Account recovered! You can now log in.");
      setMode("login");
      setStep("details");
      setPassword("");
      setOtpSent(false);
      setOtp("");
    } else {
      setError(res.error || "Reset failed");
    }
  };

  const handleFinalRegister = async () => {
    setLoading(true);
    setError("");
    const result = await registerAction(
      { name, email, password, role, garageName, services, phone, address, lat: location.lat, lng: location.lng },
      { govIdUrl, garageImageUrl, profileImageUrl, redirectTo: searchParams.get("redirectTo") || undefined }
    );
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Auto login after successful registration
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      
      const loginRes = await loginAction(formData);
      setLoading(false);
      
      if (loginRes?.error) {
        setError(loginRes.error);
      } else {
        const redirectTo = searchParams.get("redirectTo") || "/dashboard";
        router.push(redirectTo);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-inter selection:bg-primary selection:text-white">
      {/* Immersive Background */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Floating UI Elements */}
      <div className="absolute top-1/4 right-1/4 animate-pulse pointer-events-none opacity-20 hidden lg:block">
         <Zap className="w-40 h-40 text-primary stroke-[0.5]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-20 flex flex-col md:flex-row bg-[#080808]/90 backdrop-blur-3xl rounded-[48px] border border-white/5 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]"
      >
        {/* Left Side: Brand & Context */}
        <div className="w-full md:w-[40%] p-10 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                    <Zap className="w-6 h-6 text-white fill-current" />
                 </div>
                 <span className="text-2xl font-black font-outfit uppercase tracking-tighter text-white">QuickFix<span className="text-primary italic">Garage</span></span>
              </div>
              
              <div className="space-y-4">
                 <h1 className="text-4xl lg:text-5xl font-black font-outfit uppercase italic tracking-tighter text-white leading-[0.9]">
                   Ready to <br/><span className="text-primary">Deploy?</span>
                 </h1>
                 <p className="text-white/40 text-sm font-medium leading-relaxed italic">
                   The mission control for India's first real-time emergency roadside assistance network.
                 </p>
              </div>
           </div>

           <div className="pt-12 md:pt-0">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 w-fit">
                 <ShieldCheck className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Secure Connection Active</span>
              </div>
           </div>
        </div>

        {/* Right Side: Form Logic */}
        <div className="flex-1 p-6 sm:p-10 lg:p-20 relative">
          <div className="max-w-md mx-auto space-y-12">
            {/* Form Header */}
            <div className="space-y-4">
               {step !== "details" && (
                  <button 
                    onClick={() => setStep("details")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-all group italic"
                  >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back
                  </button>
               )}
               <div className="space-y-1">
                  <h2 className="text-4xl font-black font-outfit uppercase italic tracking-tighter text-white leading-none">
                    {mode === "login" ? "Authentication" : mode === "forgot" ? "Recovery" : "Registration"}
                  </h2>
                  <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                     <span>{mode === "login" ? "Log in to your account" : mode === "forgot" ? "Reset your password" : "Create a new account"}</span>
                     <span className="w-1 h-1 rounded-full bg-white/10" />
                     <button 
                      onClick={() => handleModeChange(mode === "login" ? "register" : "login")}
                      className="text-primary hover:text-white underline font-bold transition-colors"
                    >
                      {mode === "login" ? "Join Network" : "Switch to Login"}
                    </button>
                  </div>
               </div>
            </div>

            {/* Error/Success Feed */}
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                   <AlertCircle className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">{success}</p>
              </motion.div>
            )}

            {/* Role Selection High-End Toggle */}
            {step === "details" && mode === "register" && (
              <div className="flex p-2 bg-white/5 rounded-3xl border border-white/5 relative">
                <div className={cn(
                  "absolute inset-y-2 w-[calc(50%-8px)] bg-primary rounded-[22px] transition-all duration-500 ease-out shadow-2xl shadow-primary/40",
                  role === "owner" ? "left-[calc(50%+4px)]" : "left-2"
                )} />
                <button 
                  onClick={() => setRole("user")}
                  className={cn(
                    "flex-1 py-4 relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest italic transition-colors",
                    role === "user" ? "text-white" : "text-white/30 hover:text-white/50"
                  )}
                >
                  <User className="w-4 h-4" /> Driver
                </button>
                <button 
                  onClick={() => setRole("owner")}
                  className={cn(
                    "flex-1 py-4 relative z-10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest italic transition-colors",
                    role === "owner" ? "text-white" : "text-white/30 hover:text-white/50"
                  )}
                >
                  <Store className="w-4 h-4" /> Garage Owner
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "details" && (
                <motion.form key="details" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleAction} className="space-y-8">
                  <div className="space-y-6">
                    {mode === "register" && (
                      <div className="flex gap-4 items-end">
                        <div 
                          onClick={() => profileImageInputRef.current?.click()}
                          className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-all overflow-hidden shrink-0"
                        >
                          <input type="file" ref={profileImageInputRef} onChange={(e) => handleFileUpload(e, "profileImage")} className="hidden" accept="image/*" />
                          {uploadingProfileImage ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : profileImageUrl ? <SafeImage src={profileImageUrl} className="w-full h-full object-cover" fallbackSrc="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" /> : <User className="w-5 h-5 text-white/30" />}
                        </div>
                        <div className="space-y-2 flex-1">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 h-3 block">Full Name</label>
                          <Input placeholder="e.g. Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 text-white font-bold tracking-widest transition-all focus:bg-white/5 focus:ring-0 focus:border-primary/50 placeholder:text-white/10" required />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 h-3 block">Email Address</label>
                       <Input type="email" placeholder="rahul@example.in" value={email} onChange={(e) => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 text-white font-bold tracking-wide transition-all focus:bg-white/5 focus:ring-0 focus:border-primary/50 placeholder:text-white/10" required />
                    </div>

                    {mode !== "forgot" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 h-3 block">Password</label>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 text-white font-bold tracking-[0.5em] transition-all focus:bg-white/5 focus:ring-0 focus:border-primary/50 placeholder:text-white/10 pr-12" required />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {mode === "login" && (
                          <div className="flex justify-end pt-1">
                            <button 
                              type="button" 
                              onClick={() => handleModeChange("forgot")}
                              className="text-[9px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors italic"
                            >
                              Forget Password?
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* OTP Section (Required for all modes) */}
                    <div className="space-y-2 relative">
                       <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 h-3 block">Email Verification</label>
                         <div className="flex gap-4">
                           {!otpSent ? (
                             <Button 
                               type="button" 
                               onClick={handleSendOtp}
                               disabled={sendingOtp}
                               className="w-full h-16 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-black tracking-[0.3em] uppercase italic transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,26,26,0.2)] group overflow-hidden relative"
                             >
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                               {sendingOtp ? (
                                 <div className="flex items-center gap-3 relative z-10">
                                   <Loader2 className="w-5 h-5 animate-spin" />
                                   <span>TRANSMITTING...</span>
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-3 relative z-10">
                                   <Zap className="w-5 h-5" />
                                   <span>SEND OTP CODE</span>
                                 </div>
                               )}
                             </Button>
                           ) : (
                             <Input 
                               placeholder="ENTER 6-DIGIT OTP" 
                               value={otp} 
                               onChange={(e) => setOtp(e.target.value)} 
                               maxLength={6}
                               className="w-full h-16 rounded-2xl bg-primary/5 border border-primary/20 text-center text-primary font-black text-xl tracking-[0.5em] transition-all focus:bg-primary/10 focus:ring-0 focus:border-primary focus:shadow-[0_0_20px_rgba(251,26,26,0.4)] placeholder:text-primary/30 placeholder:text-sm placeholder:tracking-[0.2em]" 
                               required 
                             />
                           )}
                       </div>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={loading} className="w-full h-20 text-sm font-black font-outfit uppercase italic tracking-[0.2em] text-white bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 rounded-3xl mt-4 group">
                    {loading ? <Loader2 className="animate-spin" /> : <>{mode === "login" ? "Login" : mode === "forgot" ? "Reset Password" : "Sign Up"} <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" /></>}
                  </Button>
                </motion.form>
              )}

              {step === "reset" && (
                <motion.form key="reset" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handlePasswordReset} className="space-y-10 text-center">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black font-outfit uppercase italic text-white tracking-tighter">New Password</h3>
                     <p className="text-[10px] text-white/30 font-black uppercase tracking-widest italic">Enter your new password</p>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1 h-3 block">New Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 text-white font-bold tracking-[0.5em] transition-all focus:bg-white/5 focus:ring-0 focus:border-primary/50 placeholder:text-white/10 pr-12" required />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-20 bg-white text-black rounded-3xl font-black font-outfit uppercase tracking-widest italic text-sm hover:bg-white/90 shadow-2xl shadow-white/10 mt-4 group">
                     {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
                  </Button>
                </motion.form>
              )}
              
              {/* Other steps follow similar high-end redesign */}
              {step === "garage_info" && (
                <motion.div key="garage" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Garage Name</label>
                          <Input placeholder="e.g. Sharma Auto Motors" value={garageName} onChange={(e) => setGarageName(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 font-bold tracking-widest" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Phone Number</label>
                          <Input placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-16 rounded-2xl bg-white/[0.03] border-white/5 font-bold tracking-widest" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2 relative z-50">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Address</label>
                        <div className="flex gap-2 relative">
                          <Input 
                            placeholder="123, MG Road, Bangalore" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                setSuggestions([]);
                                handleGeocode();
                              }
                            }}
                            className="h-16 flex-1 rounded-2xl bg-white/[0.03] border-white/5 font-bold tracking-widest text-[11px]" 
                            required 
                          />
                          {suggestions.length > 0 && (
                             <div className="absolute top-full left-0 right-0 mt-2 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                               {suggestions.map((s, i) => (
                                 <button 
                                   key={i}
                                   type="button"
                                   onClick={() => {
                                     setAddress(s.display_name);
                                     setSuggestions([]);
                                     setLocation({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
                                   }}
                                   className="w-full text-left px-4 py-3 text-[11px] text-white/80 hover:bg-white/10 border-b border-white/5 last:border-0 truncate font-inter lowercase first-letter:uppercase"
                                 >
                                   {s.display_name}
                                 </button>
                               ))}
                             </div>
                           )}
                          <Button 
                            type="button" 
                            onClick={() => {
                              setSuggestions([]);
                              handleGeocode();
                            }} 
                            disabled={isGeocoding}
                            className="h-16 px-6 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-2xl transition-all"
                          >
                            {isGeocoding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] pl-1 italic">Map Location</label>
                        <div className="h-[240px] rounded-[32px] overflow-hidden border border-white/10 shadow-inner group">
                          <RegistrationMap location={location} setLocation={setLocation} />
                        </div>
                      </div>
                   </div>
                   <Button onClick={() => setStep("documents")} className="w-full h-20 bg-primary text-white font-black font-outfit uppercase italic tracking-widest rounded-3xl hover:bg-primary/90 shadow-2xl shadow-primary/20 group">
                    Next Step <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {step === "documents" && (
                <motion.div key="docs" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                   <div className="grid grid-cols-2 gap-6">
                     <div 
                        onClick={() => govIdInputRef.current?.click()}
                        className={cn(
                          "group relative h-48 bg-white/[0.02] border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer",
                          govIdUrl ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/5 hover:bg-white/[0.05] hover:border-primary/50"
                        )}
                     >
                        <input type="file" ref={govIdInputRef} onChange={(e) => handleFileUpload(e, "govId")} className="hidden" accept="image/*,.pdf" />
                        {uploadingGovId ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : govIdUrl ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <FileUp className="w-10 h-10 text-white/10 group-hover:text-primary transition-all mb-3" />}
                        <p className={cn("text-[10px] font-black uppercase tracking-widest italic", govIdUrl ? "text-emerald-500" : "text-white/20 group-hover:text-primary")}>{govIdUrl ? "UPLOADED" : "GOVT ID"}</p>
                     </div>

                     <div 
                        onClick={() => garageImageInputRef.current?.click()}
                        className={cn(
                          "group relative h-48 bg-white/[0.02] border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all cursor-pointer",
                          garageImageUrl ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/5 hover:bg-white/[0.05] hover:border-primary/50"
                        )}
                     >
                        <input type="file" ref={garageImageInputRef} onChange={(e) => handleFileUpload(e, "garageImage")} className="hidden" accept="image/*" />
                        {uploadingGarageImage ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : garageImageUrl ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <Store className="w-10 h-10 text-white/10 group-hover:text-primary transition-all mb-3" />}
                        <p className={cn("text-[10px] font-black uppercase tracking-widest italic", garageImageUrl ? "text-emerald-500" : "text-white/20 group-hover:text-primary")}>{garageImageUrl ? "UPLOADED" : "GARAGE IMAGE"}</p>
                     </div>
                   </div>

                   <Button 
                    onClick={handleFinalRegister} 
                    disabled={loading || !govIdUrl || !garageImageUrl}
                    className="w-full h-24 bg-primary text-white rounded-[40px] font-black font-outfit uppercase italic tracking-[0.2em] shadow-2xl shadow-primary/40 text-xl hover:bg-primary/95 transition-all active:scale-[0.98]"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                   </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
