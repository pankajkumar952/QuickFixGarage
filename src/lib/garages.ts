"use server";

import { db } from "@/db";
import { garagesTable, ratingsTable, usersTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Distance calculation utility
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getGarageWithRating(garageId: number, userLat?: number, userLng?: number) {
  const rows = await (db as any)
    .select({
      id: garagesTable.id,
      name: garagesTable.name,
      description: garagesTable.description,
      address: garagesTable.address,
      lat: garagesTable.lat,
      lng: garagesTable.lng,
      services: garagesTable.services,
      phone: garagesTable.phone,
      avgRating: sql<number>`AVG(${ratingsTable.stars})`,
      totalRatings: sql<number>`COUNT(${ratingsTable.id})`,
      garageImageUrl: garagesTable.garageImageUrl,
      isVerified: sql<boolean>`CASE WHEN ${usersTable.govIdUrl} IS NOT NULL THEN true ELSE false END`,
    })
    .from(garagesTable as any)
    .leftJoin(ratingsTable as any, eq(garagesTable.id as any, ratingsTable.garageId as any))
    .leftJoin(usersTable as any, eq(garagesTable.ownerId as any, usersTable.id as any))
    .where(eq(garagesTable.id as any, garageId))
    .groupBy(garagesTable.id as any, usersTable.id as any);

  const garage = rows[0];
  if (!garage) return null;

  const distance = userLat != null && userLng != null ? calcDistance(userLat, userLng, garage.lat, garage.lng) : null;

  return {
    ...garage,
    avgRating: garage.avgRating ? parseFloat(garage.avgRating) : null,
    totalRatings: parseInt(garage.totalRatings),
    distance,
  };
}

export async function listGaragesAction(userLat?: number, userLng?: number, radius: number = 10) {
  const garages = await (db as any)
    .select({
      id: garagesTable.id,
      name: garagesTable.name,
      description: garagesTable.description,
      address: garagesTable.address,
      lat: garagesTable.lat,
      lng: garagesTable.lng,
      services: garagesTable.services,
      phone: garagesTable.phone,
      avgRating: sql<number>`AVG(${ratingsTable.stars})`,
      totalRatings: sql<number>`COUNT(${ratingsTable.id})`,
      garageImageUrl: garagesTable.garageImageUrl,
      isVerified: sql<boolean>`CASE WHEN ${usersTable.govIdUrl} IS NOT NULL THEN true ELSE false END`,
    })
    .from(garagesTable as any)
    .leftJoin(ratingsTable as any, eq(garagesTable.id as any, ratingsTable.garageId as any))
    .leftJoin(usersTable as any, eq(garagesTable.ownerId as any, usersTable.id as any))
    .groupBy(garagesTable.id as any, usersTable.id as any);

  const results = garages.map((garage: any) => {
    const distance = userLat != null && userLng != null ? calcDistance(userLat, userLng, (garage as any).lat, (garage as any).lng) : null;
    return {
      ...garage,
      avgRating: garage.avgRating ? parseFloat(garage.avgRating) : null,
      totalRatings: parseInt(garage.totalRatings),
      distance,
    };
  });

  const filtered = userLat != null && userLng != null
    ? results.filter((g: any) => g.distance != null && g.distance <= radius)
    : results;

  return (filtered as any[]).sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}

export async function getMyGarageAction() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") {
    throw new Error("Unauthorized");
  }

  const [garage] = await (db as any).select().from(garagesTable).where(eq(garagesTable.ownerId as any, parseInt(session.user.id)));
  if (!garage) return null;

  return getGarageWithRating(garage.id);
}

export async function createGarageAction(data: {
  name: string;
  description?: string;
  services: string;
  phone?: string;
  address?: string;
  lat: number;
  lng: number;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") {
    throw new Error("Unauthorized");
  }

  const ownerId = parseInt(session.user.id);
  const [existing] = await (db as any).select().from(garagesTable as any).where(eq(garagesTable.ownerId as any, ownerId));
  if (existing) {
    throw new Error("Garage profile already exists");
  }

  const [garage] = await (db as any).insert(garagesTable as any).values({ ...data, ownerId }).returning();
  revalidatePath("/dashboard");
  return garage;
}

export async function updateGarageAction(garageId: number, data: Partial<{
  name: string;
  description: string;
  services: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}>) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") {
    throw new Error("Unauthorized");
  }

  const ownerId = parseInt(session.user.id);
  const [existing] = await (db as any).select().from(garagesTable).where(eq(garagesTable.id as any, garageId));
  
  if (!existing || existing.ownerId !== ownerId) {
    throw new Error("Unauthorized or garage not found");
  }

  const [updated] = await (db as any).update(garagesTable).set(data).where(eq(garagesTable.id as any, garageId)).returning();
  revalidatePath("/dashboard");
  return updated;
}
