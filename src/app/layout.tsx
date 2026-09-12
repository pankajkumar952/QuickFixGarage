import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { UniversalBackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Watermark } from "@/components/watermark";
import { auth } from "@/auth";

// Body copy font (kept under the historical "--font-inter" variable name so
// every existing `font-inter` utility class across the app picks it up).
const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-inter" });
// Display/heading font (kept under "--font-outfit" for the same reason).
const displayFont = Sora({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "QuickFix Garage | Fast, Reliable Roadside Assistance",
  description: "Find nearby garages and get real-time roadside help, fast.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={cn("dark scroll-smooth", bodyFont.variable, displayFont.variable)} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary font-sans"
        )}
      >
        <Providers session={session}>
          <Navbar session={session} />
          {/* Global Background Decorative Elements */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] bg-primary/5 rounded-full blur-[110px] animate-pulse-slow" />
          </div>
          
          <UniversalBackButton />
          <ThemeToggle />
          <Watermark />
          <div className="relative z-10 pt-20">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
