"use server";

import { db } from "@/db";
import { serviceRequestsTable, usersTable, garagesTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function enrichRequest(reqRow: any) {
  const [userRows, garageRows] = await Promise.all([
    (db as any).select().from(usersTable).where(eq(usersTable.id as any, reqRow.userId)).limit(1),
    (db as any).select().from(garagesTable).where(eq(garagesTable.id as any, reqRow.garageId)).limit(1)
  ]);
  
  const user = userRows[0];
  const garage = garageRows[0];
  
  return {
    ...reqRow,
    userName: user?.name ?? null,
    garageName: garage?.name ?? null,
  };
}

export async function getRequestStatsAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = parseInt(session.user.id);

  let rows: any[];
  if ((session.user as any).role === "owner") {
    const garageRows = await (db as any).select().from(garagesTable).where(eq(garagesTable.ownerId as any, userId)).limit(1);
    const garage = garageRows[0];
    if (!garage) return { total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0 };
    rows = await (db as any).select().from(serviceRequestsTable).where(eq(serviceRequestsTable.garageId as any, garage.id));
  } else {
    rows = await (db as any).select().from(serviceRequestsTable).where(eq(serviceRequestsTable.userId as any, userId));
  }

  return {
    total: rows.length,
    pending: rows.filter((r: any) => r.status === "pending").length,
    accepted: rows.filter((r: any) => r.status === "accepted").length,
    completed: rows.filter((r: any) => r.status === "completed").length,
    rejected: rows.filter((r: any) => r.status === "rejected").length,
  };
}

export async function listRequestsAction(status?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = parseInt(session.user.id);
  
  let rows: any[];
  if ((session.user as any).role === "owner") {
    const garageRows = await (db as any).select().from(garagesTable).where(eq(garagesTable.ownerId as any, userId)).limit(1);
    const garage = garageRows[0];
    if (!garage) return [];
    
    rows = await (db as any)
      .select({
        id: serviceRequestsTable.id,
        userId: serviceRequestsTable.userId,
        garageId: serviceRequestsTable.garageId,
        vehicleType: serviceRequestsTable.vehicleType,
        problem: serviceRequestsTable.problem,
        status: serviceRequestsTable.status,
        createdAt: serviceRequestsTable.createdAt,
        updatedAt: serviceRequestsTable.updatedAt,
        userName: usersTable.name,
        garageName: garagesTable.name,
        garageLat: garagesTable.lat,
        garageLng: garagesTable.lng,
      })
      .from(serviceRequestsTable)
      .leftJoin(usersTable, eq(serviceRequestsTable.userId as any, usersTable.id))
      .leftJoin(garagesTable, eq(serviceRequestsTable.garageId as any, garagesTable.id))
      .where(eq(serviceRequestsTable.garageId as any, garage.id))
      .orderBy(desc(serviceRequestsTable.createdAt as any));
  } else {
    rows = await (db as any)
      .select({
        id: serviceRequestsTable.id,
        userId: serviceRequestsTable.userId,
        garageId: serviceRequestsTable.garageId,
        vehicleType: serviceRequestsTable.vehicleType,
        problem: serviceRequestsTable.problem,
        status: serviceRequestsTable.status,
        createdAt: serviceRequestsTable.createdAt,
        updatedAt: serviceRequestsTable.updatedAt,
        userName: usersTable.name,
        garageName: garagesTable.name,
        garageLat: garagesTable.lat,
        garageLng: garagesTable.lng,
      })
      .from(serviceRequestsTable)
      .leftJoin(usersTable, eq(serviceRequestsTable.userId as any, usersTable.id))
      .leftJoin(garagesTable, eq(serviceRequestsTable.garageId as any, garagesTable.id))
      .where(eq(serviceRequestsTable.userId as any, userId))
      .orderBy(desc(serviceRequestsTable.createdAt as any));
  }

  if (status) {
    rows = rows.filter((r: any) => r.status === status);
  }

  return rows;
}

export async function createRequestAction(data: {
  garageId: number;
  vehicleType: string;
  problem: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [reqRow] = await (db as any).insert(serviceRequestsTable)
    .values({ 
      ...data, 
      userId: parseInt(session.user.id), 
      status: "pending" 
    })
    .returning();

  revalidatePath("/dashboard");
  return enrichRequest(reqRow);
}

export async function updateRequestStatusAction(requestId: number, status: "accepted" | "completed" | "rejected") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = parseInt(session.user.id);
  
  // Consolidate validation into parallel check
  const [requestRows, garageRows] = await Promise.all([
    (db as any).select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id as any, requestId)).limit(1),
    (session.user as any).role === "owner" 
      ? (db as any).select().from(garagesTable).where(eq(garagesTable.ownerId as any, userId)).limit(1)
      : Promise.resolve([])
  ]);

  const existing = requestRows[0] as any;
  if (!existing) throw new Error("Request not found");

  if ((session.user as any).role === "owner") {
    const garage = garageRows[0];
    if (!garage || garage.id !== existing.garageId) throw new Error("Unauthorized");
  } else if (existing.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const [updated] = await (db as any).update(serviceRequestsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(serviceRequestsTable.id as any, requestId))
    .returning();

  revalidatePath("/dashboard");
  
  // Return updated row immediately, enrichment is done in parallel
  return enrichRequest(updated);
}
