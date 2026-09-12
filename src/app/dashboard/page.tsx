import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { UserDashboard } from "@/components/dashboards/user-dashboard";
import { GarageDashboard } from "@/components/dashboards/garage-dashboard";
import { listRequestsAction, getRequestStatsAction } from "@/lib/requests";
import { listGarageRatingsAction } from "@/lib/ratings";
import { db } from "@/db";
import { garagesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth?mode=login");
  }

  const [requests, stats] = await Promise.all([
    listRequestsAction(),
    getRequestStatsAction()
  ]);

  let ratings: any[] = [];
  if ((session.user as any).role === "owner") {
    const garageRows = await (db as any).select().from(garagesTable).where(eq(garagesTable.ownerId as any, parseInt(session.user.id!))).limit(1);
    const garage = garageRows[0];
    if (garage) {
      ratings = await listGarageRatingsAction(garage.id);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {(session.user as any).role === "owner" ? (
        <GarageDashboard 
          initialRequests={requests} 
          stats={stats} 
          initialRatings={ratings}
          userName={session.user.name!}
        />
      ) : (
        <UserDashboard initialRequests={requests} stats={stats} userName={session.user.name!} />
      )}
    </main>
  );
}
