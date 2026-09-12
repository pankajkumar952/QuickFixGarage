import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { usersTable } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const {
  auth,
  signIn,
  signOut,
  handlers,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const userRows = await (db as any).select().from(usersTable).where(eq(usersTable.email as any, email)).limit(1);
          const user = userRows[0] as any;
          
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

          if (passwordsMatch) return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  debug: true,
});
