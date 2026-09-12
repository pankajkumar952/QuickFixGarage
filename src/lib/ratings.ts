"use server";

import { db } from "@/db";
import { ratingsTable, usersTable, serviceRequestsTable, garagesTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createRatingAction(data: {
  requestId: number;
  stars: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = parseInt(session.user.id);
  
  // Verify request existence and ownership
  const [request] = await (db as any).select().from(serviceRequestsTable).where(
    and(
      eq(serviceRequestsTable.id as any, data.requestId as any),
      eq(serviceRequestsTable.userId as any, userId)
    )
  ).limit(1);

  if (!request) throw new Error("Request not found or unauthorized");
  if (request.status !== "completed") throw new Error("Only completed requests can be reviewed");

  const [rating] = await (db as any).insert(ratingsTable).values({
    requestId: data.requestId,
    garageId: request.garageId,
    userId: userId,
    stars: data.stars,
    comment: data.comment,
  }).returning();

  revalidatePath("/dashboard");
  return rating;
}

export async function listGarageRatingsAction(garageId: number) {
  const ratings = await (db as any)
    .select({
      id: ratingsTable.id,
      stars: ratingsTable.stars,
      comment: ratingsTable.comment,
      response: ratingsTable.response,
      respondedAt: ratingsTable.respondedAt,
      createdAt: ratingsTable.createdAt,
      userName: usersTable.name,
    })
    .from(ratingsTable)
    .leftJoin(usersTable, eq(ratingsTable.userId as any, usersTable.id as any))
    .where(eq(ratingsTable.garageId as any, garageId))
    .orderBy(desc(ratingsTable.createdAt as any));

  return ratings;
}

export async function respondToRatingAction(ratingId: number, response: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = parseInt(session.user.id);
  
  const [rating] = await (db as any).select().from(ratingsTable).where(eq(ratingsTable.id as any, ratingId)).limit(1);
  if (!rating) throw new Error("Rating not found");

  // Verify ownership of the garage
  const [garage] = await (db as any).select().from(garagesTable).where(
    and(
      eq(garagesTable.id as any, rating.garageId as any),
      eq(garagesTable.ownerId as any, userId)
    )
  ).limit(1);

  if (!garage) throw new Error("Unauthorized to respond to this rating");

  const [updated] = await (db as any).update(ratingsTable)
    .set({ 
      response, 
      respondedAt: new Date() 
    })
    .where(eq(ratingsTable.id as any, ratingId))
    .returning();

  revalidatePath("/dashboard");
  return updated;
}
