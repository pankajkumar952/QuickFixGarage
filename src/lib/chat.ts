"use server";

import { db } from "@/db";
import { messagesTable, usersTable, serviceRequestsTable, garagesTable } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function listMessagesAction(requestId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const requestRows = await (db as any).select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id as any, requestId)).limit(1);
  const request = requestRows[0];
  if (!request) throw new Error("Request not found");

  const userId = parseInt(session.user.id);
  
  // Security check: only the customer or the garage owner can see messages
  const isCustomer = request.userId === userId;
  
  // For owners, we check if the garage ID in the request belongs to them
  let isOwner = false;
  if ((session.user as any).role === "owner") {
    const garageRows = await (db as any).select().from(garagesTable).where(
      and(
        eq(garagesTable.id as any, request.garageId as any),
        eq(garagesTable.ownerId as any, userId)
      )
    ).limit(1);
    isOwner = garageRows.length > 0;
  }

  if (!isCustomer && !isOwner) {
    throw new Error("Unauthorized to view messages for this request");
  }

  const messages = await ((db as any)
    .select({
      id: messagesTable.id,
      requestId: messagesTable.requestId,
      senderId: messagesTable.senderId,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
      senderName: usersTable.name,
      senderRole: usersTable.role,
    })
    .from(messagesTable)
    .leftJoin(usersTable, eq(messagesTable.senderId as any, usersTable.id as any))
    .where(eq(messagesTable.requestId as any, requestId))
    .orderBy(asc(messagesTable.createdAt as any)) as any);

  return messages;
}

export async function sendMessageAction(requestId: number, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = parseInt(session.user.id);
  
  // Verify user is part of this request
  const requestRows = await (db as any)
    .select()
    .from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.id as any, requestId))
    .limit(1);
  const request = requestRows[0];
  if (!request) throw new Error("Request not found");

  const isCustomer = request.userId === userId;
  let isOwner = false;
  
  if ((session.user as any).role === "owner") {
    const garageRows = await (db as any).select().from(garagesTable).where(
      and(
        eq(garagesTable.id as any, request.garageId as any),
        eq(garagesTable.ownerId as any, userId)
      )
    ).limit(1);
    isOwner = garageRows.length > 0;
  }

  if (!isCustomer && !isOwner) {
    throw new Error("Unauthorized to send messages for this request");
  }

  const [message] = await (db as any).insert(messagesTable).values({
    requestId,
    senderId: userId,
    content,
  }).returning();

  revalidatePath(`/chat/${requestId}`);
  return message;
}

export async function getChatDetailsAction(requestId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = parseInt(session.user.id);

  const requestRows = await (db as any).select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id as any, requestId)).limit(1);
  const request = requestRows[0];
  if (!request) throw new Error("Request not found");

  const [customer] = await (db as any).select().from(usersTable).where(eq(usersTable.id as any, request.userId)).limit(1);
  const [garage] = await (db as any).select().from(garagesTable).where(eq(garagesTable.id as any, request.garageId)).limit(1);

  const isCustomer = request.userId === userId;
  const isOwner = garage?.ownerId === userId;

  if (!isCustomer && !isOwner) throw new Error("Unauthorized to view this thread");

  return {
    isOwner,
    customer: {
      name: customer?.name || "Unknown Driver",
      phone: customer?.phone || "N/A",
      email: customer?.email || "N/A"
    },
    garage: {
      name: garage?.name || "Unknown Node",
      phone: garage?.phone || "N/A",
      address: garage?.address || "N/A",
      isVerified: garage?.isVerified || false,
      garageImageUrl: garage?.garageImageUrl
    },
    vehicleType: request.vehicleType,
    problem: request.problem,
    status: request.status
  };
}
