import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { garagesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "govId" or "garageImage"

  if (!type || !["govId", "garageImage"].includes(type)) {
    return new NextResponse("Invalid image type", { status: 400 });
  }

  const { id } = await params;
  const garageId = parseInt(id);
  if (isNaN(garageId)) {
    return new NextResponse("Invalid garage ID", { status: 400 });
  }

  const garageRecords = await (db as any).select().from(garagesTable).where(eq(garagesTable.id, garageId)).limit(1);
  if (garageRecords.length === 0) {
    return new NextResponse("Garage not found", { status: 404 });
  }

  const garage = garageRecords[0];
  const imageUrl = type === "govId" ? garage.govIdUrl : garage.garageImageUrl;

  if (!imageUrl) {
    return new NextResponse("Image not found", { status: 404 });
  }

  // Parse the Data URL (e.g. data:image/jpeg;base64,/9j/4AAQSkZJRg...)
  const match = imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
  
  if (!match) {
    return new NextResponse("Invalid image format stored in database", { status: 500 });
  }

  const mimeType = match[1];
  const base64Data = match[2];
  
  const buffer = Buffer.from(base64Data, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
