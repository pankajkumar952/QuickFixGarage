import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ShieldCheck, Key, Database, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddAdminForm } from "@/components/admin/add-admin-form";

export default async function AdminSettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black font-outfit uppercase italic tracking-tighter text-white">
          System <span className="text-red-500">Settings</span>
        </h1>
        <p className="text-white/50 text-sm">Configure platform security and database parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-lg flex items-center gap-2 font-outfit italic uppercase">
              <ShieldCheck className="w-5 h-5 text-red-500" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Admin Email</label>
              <div className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center text-white/50 font-medium">
                {session?.user?.email}
              </div>
            </div>
            
            <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
              <Key className="w-4 h-4 mr-2" /> Change Master Password
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-lg flex items-center gap-2 font-outfit italic uppercase">
              <UserPlus className="w-5 h-5 text-red-500" /> Add Administrator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AddAdminForm currentEmail={session?.user?.email || ""} />
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-lg flex items-center gap-2 font-outfit italic uppercase">
              <Database className="w-5 h-5 text-red-500" /> Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <h3 className="text-red-500 font-bold uppercase italic text-sm mb-1">Danger Zone</h3>
              <p className="text-xs text-red-500/70 mb-4">These actions cannot be undone. They will permanently modify the production database.</p>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full h-12 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                  Purge Unverified Users
                </Button>
                <Button variant="outline" className="w-full h-12 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                  Clear SOS Logs Older Than 30 Days
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
