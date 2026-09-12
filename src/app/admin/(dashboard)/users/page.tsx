import { auth } from "@/auth";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserCog, MoreVertical, Trash2, ExternalLink, FileText } from "lucide-react";
import { FormattedDate } from "@/components/ui/formatted-date";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import { deleteUserAction } from "@/lib/admin-actions";

export default async function AdminUsersPage() {
  const session = await auth();

  // Fetch all users
  const users = await (db as any).select().from(usersTable).orderBy(desc(usersTable.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-outfit uppercase italic tracking-tighter text-white">
            User <span className="text-red-500">Management</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">Manage all registered drivers and garage owners.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/50 transition-colors text-white"
          />
        </div>
      </div>

      <Card className="border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/5 uppercase text-[10px] font-black tracking-widest text-white/40">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {user.profileImageUrl ? (
                          <SafeImage src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" fallbackSrc={`https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                        ) : (
                          <UserCog className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-white/50">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                      user.role === 'owner' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-white/10 text-white/70'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <FormattedDate date={user.createdAt} type="date" className="text-white/70" />
                  </td>
                  <td className="p-4 text-right">
                    <form action={deleteUserAction.bind(null, user.id)}>
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
