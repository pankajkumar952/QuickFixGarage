import { auth } from "@/auth";
import { db } from "@/db";
import { garagesTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Store, MapPin, Trash2, CheckCircle, ExternalLink } from "lucide-react";
import { FormattedDate } from "@/components/ui/formatted-date";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import { deleteGarageAction } from "@/lib/admin-actions";
import { GarageTierSelector } from "./garage-tier-selector";

export default async function AdminGaragesPage() {
  const session = await auth();

  // Fetch all garages with their owner info
  const garages = await (db as any)
    .select({
      id: garagesTable.id,
      name: garagesTable.name,
      address: garagesTable.address,
      phone: garagesTable.phone,
      createdAt: garagesTable.createdAt,
      ownerName: usersTable.name,
      ownerEmail: usersTable.email,
      govIdUrl: garagesTable.govIdUrl,
      garageImageUrl: garagesTable.garageImageUrl,
      tier: garagesTable.tier,
    })
    .from(garagesTable)
    .leftJoin(usersTable, eq(garagesTable.ownerId, usersTable.id));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-outfit uppercase italic tracking-tighter text-white">
            Garage <span className="text-red-500">Nodes</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">Review and manage registered service nodes.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search garages..." 
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/50 transition-colors text-white"
          />
        </div>
      </div>

      <Card className="border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/5 uppercase text-[10px] font-black tracking-widest text-white/40">
              <tr>
                <th className="p-4">Garage Detail</th>
                <th className="p-4">Owner Contact</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Media & Docs</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {garages.map((garage: any) => (
                <tr key={garage.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase italic">{garage.name}</p>
                        <p className="text-xs text-white/50 flex items-center gap-1"><MapPin className="w-3 h-3" /> {garage.address || "No Address"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-white">{garage.ownerName}</p>
                    <p className="text-xs text-white/50">{garage.phone}</p>
                  </td>
                  <td className="p-4">
                    <GarageTierSelector garageId={garage.id} currentTier={garage.tier || "silver"} />
                  </td>
                  <td className="p-4 space-y-2">
                    <div>
                      {garage.govIdUrl ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                          <a href={`/api/admin/garages/${garage.id}/image?type=govId`} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold w-fit">
                            View ID <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/50 border border-white/10">
                          Pending
                        </span>
                      )}
                    </div>
                    {garage.garageImageUrl && (
                      <a href={`/api/admin/garages/${garage.id}/image?type=garageImage`} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold w-fit">
                        View Image <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <form action={deleteGarageAction.bind(null, garage.id)}>
                      <Button type="submit" variant="ghost" size="icon" className="text-white/40 hover:text-red-500 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
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
