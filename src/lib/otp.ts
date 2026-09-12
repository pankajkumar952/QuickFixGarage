import { db } from "@/db";
import { otpsTable } from "@/db/schema/otps";
import { eq, and, gt } from "drizzle-orm";
import { transporter, FROM_EMAIL } from "@/lib/mailer";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createAndSendOtp(email: string, purpose: "register" | "login" | "forgot") {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store in database
  await (db as any).insert(otpsTable).values({
    email,
    code: otp,
    purpose,
    expiresAt,
  });

  // Log to console for development visibility
  console.log(`\n--- [CAPTCHA] ---\nEmail: ${email}\nCode:   ${otp}\n------------------------\n`);

  // Send real email via Gmail
  try {
    let subject = "Your QuickFix Garage OTP Code";
    let text = `Your OTP code is: ${otp}. It will expire in 10 minutes.`;
    
    if (purpose === "register") {
      subject = "Welcome to QuickFix Garage - Verification Code";
      text = `Thank you for registering! Your verification code is: ${otp}. It will expire in 10 minutes.`;
    } else if (purpose === "forgot") {
      subject = "QuickFix Garage - Password Reset Code";
      text = `You requested a password reset. Your OTP code is: ${otp}. It will expire in 10 minutes.`;
    }

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">QuickFix Garage</h2>
          <p>${text.replace(otp, `<strong style="font-size: 24px; letter-spacing: 2px; color: #111;">${otp}</strong>`)}</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });
    console.log(`[MAILER] OTP successfully sent to ${email}`);
  } catch (error) {
    console.error("[MAILER ERROR] Failed to send OTP email. Have you set GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env?", error);
    // Continue execution so development console logging still works if email fails
  }

  return { success: true, otp };
}

export async function verifyOtp(email: string, code: string, purpose: "register" | "login" | "forgot", deleteAfter: boolean = true): Promise<boolean> {
  const rows = await (db as any)
    .select()
    .from(otpsTable)
    .where(
      and(
        eq(otpsTable.email as any, email),
        eq(otpsTable.code as any, code.trim()),
        eq(otpsTable.purpose as any, purpose),
        gt(otpsTable.expiresAt as any, new Date())
      )
    )
    .limit(1);

  const record = rows[0] as any;

  if (!record) return false;

  if (!record) return false;
  if (!deleteAfter) return true;

  // Cleanup after successful verification
  await (db as any).delete(otpsTable).where(eq(otpsTable.id as any, record.id));
  return true;
}
