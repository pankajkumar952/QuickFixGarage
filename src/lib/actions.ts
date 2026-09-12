"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createAndSendOtp, verifyOtp } from "@/lib/otp";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "owner"]),
  garageName: z.string().optional(),
  services: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

import { garagesTable } from "@/db/schema/garages";

export async function sendOtpAction(email: string, purpose: "register" | "login" | "forgot") {
  try {
    const otpRes = await createAndSendOtp(email, purpose);
    // In dev, we return the OTP for quick access as requested
    return { success: true, otp: (otpRes as any)?.otp };
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return { error: "Failed to send OTP email" };
  }
}

export async function verifyOtpAction(email: string, otp: string, purpose: "register" | "login" | "forgot") {
  // If forgot password, don't delete yet as we need it for the final reset action
  const isValid = await verifyOtp(email, otp, purpose, purpose !== "forgot");
  return { success: isValid };
}

export async function uploadFileAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For Vercel deployments, the local filesystem is read-only.
    // Instead of using S3 for this presentation, we convert the image directly to a Base64 Data URL
    // and store it in the PostgreSQL text column.
    const mimeType = file.type || "application/octet-stream";
    const base64String = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    return { url: dataUrl };
  } catch (error: any) {
    console.error("[UPLOAD FATAL ERROR]", error);
    return { error: `Upload failed: ${error.message || "Unknown error"}` };
  }
}

export async function registerAction(
  values: z.infer<typeof RegisterSchema>, 
  extra: { govIdUrl?: string; garageImageUrl?: string; profileImageUrl?: string; redirectTo?: string }
) {
  const parsed = RegisterSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid registration data" };

  const { name, email, password, role } = parsed.data;
  const redirectPath = extra.redirectTo || "/dashboard";

  // Additional checks for owners
  if (role === "owner") {
    if (!extra.govIdUrl) return { error: "Government ID is required for garage owners" };
    if (!extra.garageImageUrl) return { error: "Garage image is required for garage owners" };
  }

  try {
    const cleanEmail = email.toLowerCase();
    const existing = await (db as any).select().from(usersTable).where(eq(usersTable.email as any, cleanEmail)).limit(1);
    if (existing.length > 0) return { error: "Email already registered" };

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await (db as any).insert(usersTable).values({
      name,
      email: cleanEmail,
      passwordHash,
      role,
      emailVerified: true,
      govIdUrl: extra.govIdUrl,
      garageImageUrl: extra.garageImageUrl,
      profileImageUrl: extra.profileImageUrl,
    }).returning();

    // If owner, create garage profile
    if (role === "owner" && user) {
      await (db as any).insert(garagesTable).values({
        ownerId: user.id,
        name: parsed.data.garageName || `${name}'s Garage`,
        services: parsed.data.services || "General Repairs",
        phone: parsed.data.phone || "",
        address: parsed.data.address || "",
        lat: parsed.data.lat || 12.9716, // Default to Bangalore center if not picked
        lng: parsed.data.lng || 77.5946,
        garageImageUrl: extra.garageImageUrl,
        govIdUrl: extra.govIdUrl,
      });
    }

    // Removed auto-login to fix localhost redirect issue and satisfy UX request.
    return { success: true };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error; // Rethrow redirect
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong during login." };
      }
    }
    console.error("Registration error:", error);
    return { error: "Registration failed" };
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Missing required fields" };
  }

  const cleanEmail = email.toLowerCase();

  const userRows = await (db as any).select().from(usersTable).where(eq(usersTable.email as any, cleanEmail)).limit(1);
  const user = userRows[0];
  
  if (!user) {
    return { error: "Invalid email" };
  }
  
  const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordsMatch) {
    return { error: "Invalid password" };
  }

  try {
    await signIn("credentials", { email: cleanEmail, password, redirect: false });
    return { success: true };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Something went wrong" };
  }
}

export async function logoutAction() {
  // Try to use NextAuth signOut but prevent it from forcing an absolute redirect
  // which causes the localhost bug on Render when AUTH_URL is missing
  try {
    await signOut({ redirect: false });
  } catch (err) {
    // Ignore any thrown redirects from NextAuth
  }
  
  // Manually clear cookies just in case NextAuth fails
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((c) => {
    if (c.name.includes("authjs") || c.name.includes("next-auth")) {
      cookieStore.delete(c.name);
    }
  });

  // Force a purely relative Next.js redirect to home
  redirect("/");
}

export async function forgotPasswordAction(email: string) {
  const cleanEmail = email.toLowerCase();
  try {
    const existing = await (db as any).select().from(usersTable).where(eq(usersTable.email as any, cleanEmail)).limit(1);
    if (existing.length === 0) return { error: "No account found with this email" };

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Step failed" };
  }
}

export async function resetPasswordAction(values: any) {
  const { email, newPassword } = values;
  const cleanEmail = email.toLowerCase();

  try {

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await (db as any).update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.email as any, cleanEmail));

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password" };
  }
}

export async function updateUserAction(data: { name?: string; currentPassword?: string; newPassword?: string; profileImageUrl?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const userRows = await (db as any).select().from(usersTable).where(eq(usersTable.id as any, parseInt(session.user.id))).limit(1);
    const user = userRows[0];
    if (!user) return { error: "User not found" };

    const updates: any = {};
    if (data.name && data.name.trim() !== "") {
      updates.name = data.name;
    }
    
    if (data.profileImageUrl) {
      updates.profileImageUrl = data.profileImageUrl;
    }

    if (data.newPassword && data.newPassword.trim().length >= 6) {
      if (!data.currentPassword) return { error: "Current password is required to set a new password" };
      const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isValid) return { error: "Current password is incorrect" };
      
      updates.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }
    
    await (db as any).update(usersTable)
      .set(updates)
      .where(eq(usersTable.id as any, parseInt(session.user.id)));

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile" };
  }
}
