import { auth } from "@/auth";
import { db } from "@/db";
import { serviceRequestsTable, usersTable, garagesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Search, AlertTriangle, Trash2, Zap } from "lucide-react";
import { FormattedDate } from "@/components/ui/formatted-date";
import { Button } from "@/components/ui/button";

const STATUS_COLORS = {
  pending: "text-red-500 bg-red-500/10 border-red-500/20",
  accepted: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  completed: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-white/40 bg-white/5 border-white/10",
};

export default async function AdminRequestsPage() {
  const session = await auth();

  // Fetch all requests with user and garage info
  const requests = await (db as any)
    .select({
      id: serviceRequestsTable.id,
      vehicleType: serviceRequestsTable.vehicleType,
      problem: serviceRequestsTable.problem,
      status: serviceRequestsTable.status,
      createdAt: serviceRequestsTable.createdAt,
      userName: usersTable.name,
      garageName: garagesTable.name,
    })
    .from(serviceRequestsTable)
    .leftJoin(usersTable, eq(serviceRequestsTable.userId, usersTable.id))
    .leftJoin(garagesTable, eq(serviceRequestsTable.garageId, garagesTable.id))
    .orderBy(desc(serviceRequestsTable.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-outfit uppercase italic tracking-tighter text-white">
            Emergency <span className="text-red-500">Logs</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">Monitor all SOS transmissions across the network.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/50 transition-colors text-white"
          />
        </div>
      </div>

      <Card className="border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/5 uppercase text-[10px] font-black tracking-widest text-white/40">
              <tr>
                <th className="p-4">Transmission Detail</th>
                <th className="p-4">Parties Involved</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((req: any) => (
                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase italic">{req.vehicleType}</p>
                        <p className="text-xs text-white/50 italic max-w-xs truncate">"{req.problem}"</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-white text-xs"><span className="text-white/30 mr-1">USR:</span> {req.userName || "Unknown"}</p>
                    <p className="font-medium text-white text-xs mt-1"><span className="text-white/30 mr-1">GRG:</span> {req.garageName || "Unknown Node"}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${(STATUS_COLORS as any)[req.status]}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" className="text-white/40 hover:text-red-500 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
