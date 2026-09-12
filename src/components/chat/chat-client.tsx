"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listMessagesAction, sendMessageAction } from "@/lib/chat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  MessageSquare, 
  ChevronLeft, 
  Loader2, 
  User, 
  ShieldCheck,
  Zap,
  ArrowLeft,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FormattedDate } from "@/components/ui/formatted-date";

interface ChatPageProps {
  requestId: number;
  initialMessages: any[];
  details: any;
  currentUserId: string | number;
}

export default function ChatPage({ requestId, initialMessages, details, currentUserId }: ChatPageProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling for new messages with recursive setTimeout to prevent request stacking
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const poll = async () => {
      try {
        const freshMessages = await listMessagesAction(requestId);
        if (isMounted && JSON.stringify(freshMessages) !== JSON.stringify(messages)) {
          setMessages(freshMessages);
        }
      } catch (err) {
        console.error("Polling error:", err);
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(poll, 3000); // Wait 3 seconds BEFORE starting the next request
        }
      }
    };

    poll(); // Start polling

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [requestId, messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const text = content.trim();
    setContent("");
    setError("");

    startTransition(async () => {
      try {
        await sendMessageAction(requestId, text);
        // Instant update after sending
        const updated = await listMessagesAction(requestId);
        setMessages(updated);
      } catch (err: any) {
        console.error("Failed to send message:", err);
        setError("Transmission failed. Please try again.");
        // Restore content if failed
        setContent(text);
      }
    });
  };

  const userId = currentUserId;

  return (
    <div className="h-screen flex flex-col bg-background pt-16 overflow-hidden relative">
      <Navbar />
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white/[0.01] border-x border-white/5 relative glass shadow-2xl overflow-hidden backdrop-blur-3xl">
        
        {/* Header */}
        <header className="p-6 md:p-8 border-b border-white/5 bg-background/40 backdrop-blur-3xl flex items-center justify-between relative z-20">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/5 border border-white/5 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                 <User className="w-6 h-6 text-white/40" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <h2 className="font-black text-xl font-outfit uppercase italic tracking-tighter text-white leading-none">
                     {details.isOwner ? details.customer.name : details.garage.name}
                   </h2>
                   {!details.isOwner && details.garage.isVerified && (
                     <ShieldCheck className="w-4 h-4 text-primary" />
                   )}
                   <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest italic">Live Link</span>
                   </div>
                </div>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] italic">
                  Contact: <span className="text-white">{details.isOwner ? details.customer.phone : details.garage.phone}</span> • <span className="text-white/70">{details.isOwner ? details.customer.email : 'No email'}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-right">
             <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] italic">Vehicle Bio</p>
                <p className="text-xs font-bold text-white">{details.vehicleType}</p>
             </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scrollbar-none relative z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/10 text-center space-y-6">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                 <MessageSquare className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                 <p className="font-black text-xl font-outfit uppercase italic tracking-widest">Awaiting Transmission</p>
                 <p className="text-sm font-medium text-white/20 italic">Initialize your first message to the garage owner.</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = String(msg.senderId) === String(userId);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
                >
                  <div className="max-w-[85%] md:max-w-[70%]">
                    <div className={cn("flex items-end gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                      {/* Consistent User Avatar for both sender and receiver */}
                      <div className="w-10 h-10 rounded-full border border-white/10 flex-shrink-0 bg-white/5 flex items-center justify-center overflow-hidden">
                        <User className="w-5 h-5 text-white/40" />
                      </div>
                      
                      {/* Message Bubble and Metadata */}
                      <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                        <div className={cn(
                          "px-5 py-3 rounded-[20px] text-[15px] font-medium leading-relaxed shadow-xl",
                          isMe 
                            ? "rounded-br-none bg-[#128C7E] text-white font-bold" 
                            : "rounded-bl-none bg-[#262626] border border-white/5 text-white"
                        )}>
                          {msg.content}
                        </div>
                        <div className={cn("flex items-center gap-2 px-2", isMe ? "flex-row-reverse" : "flex-row")}>
                          <FormattedDate date={msg.createdAt} type="time" className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic" />
                          {isMe && <ShieldCheck className="w-3 h-3 text-primary/40" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <footer className="p-8 border-t border-white/10 bg-background/40 backdrop-blur-3xl relative z-20">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
            >
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">{error}</p>
            </motion.div>
          )}
          <form onSubmit={handleSend} className="flex gap-5">
            <div className="relative flex-1 group">
               <Input 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Secure message transmission..."
                className="h-20 pr-24 bg-white/5 border-white/5 focus:bg-primary/5 focus:border-primary/40 text-white font-bold text-lg placeholder:text-white/20 rounded-3xl transition-all shadow-inner"
                disabled={isPending}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn(
                    "rounded-2xl w-14 h-14 shadow-2xl transition-all duration-300",
                    content.trim() ? "bg-primary hover:bg-primary/90 shadow-primary/40" : "bg-white/5 text-white/20"
                  )}
                  disabled={isPending || !content.trim()}
                >
                  {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-4 text-center">
             <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] italic">QuickFix Quantum Encryption Layer v2.1</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
