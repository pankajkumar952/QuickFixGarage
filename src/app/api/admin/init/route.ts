import { NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// This route should only be used once to initialize the admin account.
// In a real production scenario, this route would be deleted after the admin is created.
export async function GET(request: Request) {
  // Check if an admin already exists
  const existingAdmin = await (db as any).select().from(usersTable).where(eq(usersTable.role as any, "admin")).limit(1);
  
  if (existingAdmin.length > 0) {
    return NextResponse.json({ message: "Admin account already exists." }, { status: 400 });
  }

  // Create default admin
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  
  try {
    await (db as any).insert(usersTable).values({
      name: "System Admin",
      email: "admin@system.local",
      passwordHash: passwordHash,
      role: "admin",
      emailVerified: true,
    });
    
    return NextResponse.json({ 
      message: "Admin account initialized successfully.",
      credentials: {
        email: "admin@system.local",
        password: "Admin123!"
      }
    });
  } catch (error) {
    console.error("Failed to init admin:", error);
    return NextResponse.json({ error: "Failed to initialize admin account" }, { status: 500 });
  }
}
