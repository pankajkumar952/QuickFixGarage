import { auth } from "@/auth";
import { db } from "@/db";
import { usersTable, garagesTable, serviceRequestsTable } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, AlertTriangle, Activity } from "lucide-react";
import { FormattedDate } from "@/components/ui/formatted-date";
import { ActivityGraph, DayActivity } from "@/components/admin/activity-graph";

export default async function AdminDashboardOverview() {
  const session = await auth();

  // Fetch all data for the admin overview
  const [users, garages, requests] = await Promise.all([
    (db as any).select().from(usersTable),
    (db as any).select().from(garagesTable),
    (db as any).select().from(serviceRequestsTable)
  ]);

  // Dynamic Activity Logic
  const now = new Date();
  const last14Days: DayActivity[] = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return { date: d.toISOString().split('T')[0], count: 0, events: [] };
  });

  const countActivity = (items: any[], type: "User" | "Garage" | "SOS", titleField: string) => {
    items.forEach(item => {
      if (!item.createdAt) return;
      const dateObj = new Date(item.createdAt);
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayIndex = last14Days.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1) {
        last14Days[dayIndex].count++;
        last14Days[dayIndex].events.push({
          type,
          title: item[titleField] || "Unknown",
          time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  };

  countActivity(users, "User", "name");
  countActivity(garages, "Garage", "name");
  countActivity(requests, "SOS", "vehicleType");

  const maxActivity = Math.max(...last14Days.map(d => d.count), 1);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-medium text-white tracking-tight">Overview</h1>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span className="font-medium text-white">Today</span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        
        {/* Main Column */}
        <div className="flex-1 space-y-6 flex flex-col">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#141414] border-transparent shadow-none rounded-2xl hover:bg-[#1a1a1a] transition-colors">
              <CardContent className="p-6">
                <div className="text-xs text-white/50 mb-3 font-medium">Total Users</div>
                <div className="text-3xl font-semibold text-white font-outfit">{users.length}</div>
                <div className="text-xs text-primary mt-3 flex items-center gap-1.5 font-medium bg-primary/10 w-fit px-2 py-1 rounded-md">
                  <Activity className="w-3 h-3" /> +12% this week
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#141414] border-transparent shadow-none rounded-2xl hover:bg-[#1a1a1a] transition-colors">
              <CardContent className="p-6">
                <div className="text-xs text-white/50 mb-3 font-medium">Active Garages</div>
                <div className="text-3xl font-semibold text-white font-outfit">{garages.length}</div>
                <div className="text-xs text-primary mt-3 flex items-center gap-1.5 font-medium bg-primary/10 w-fit px-2 py-1 rounded-md">
                  <Activity className="w-3 h-3" /> +5% this month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#141414] border-transparent shadow-none rounded-2xl hover:bg-[#1a1a1a] transition-colors">
              <CardContent className="p-6">
                <div className="text-xs text-white/50 mb-3 font-medium">SOS Requests</div>
                <div className="text-3xl font-semibold text-white font-outfit">{requests.length}</div>
                <div className="text-xs text-primary mt-3 flex items-center gap-1.5 font-medium bg-primary/10 w-fit px-2 py-1 rounded-md">
                  <Activity className="w-3 h-3" /> +24% vs last week
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Graph */}
          <div className="flex-1 flex flex-col min-h-[400px]">
            <ActivityGraph data={last14Days} maxActivity={maxActivity} />
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="w-full xl:w-[380px] space-y-6 flex flex-col">
          
          {/* Notifications / SOS Logs Timeline */}
          <div className="bg-[#141414] rounded-2xl p-6 flex-1 min-h-[300px]">
            <h3 className="text-sm font-medium text-white mb-6">Emergency Logs</h3>
            <div className="space-y-6">
              {requests.slice(0, 5).map((r: any) => (
                <div key={r.id} className="flex gap-4 relative">
                  <div className="absolute top-8 left-4 bottom-[-24px] w-px bg-white/5 last:hidden" />
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 z-10">
                    <AlertTriangle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-white/90 leading-tight">
                      {r.vehicleType}
                    </p>
                    <p className="text-xs text-white/50 mt-1 line-clamp-1">{r.problem}</p>
                    <div className="text-[10px] text-white/30 mt-2 font-medium">
                      <FormattedDate date={r.createdAt} type="both" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts / Garages */}
          <div className="bg-[#141414] rounded-2xl p-6">
            <h3 className="text-sm font-medium text-white mb-6">Registered Garages</h3>
            <div className="space-y-2">
              {garages.slice(0, 4).map((g: any, idx: number) => (
                <div key={g.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${idx === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-white/50 border border-white/5">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${idx === 0 ? 'text-primary' : 'text-white'}`}>{g.name}</p>
                      <p className="text-xs text-white/40">{g.phone || "No phone"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
