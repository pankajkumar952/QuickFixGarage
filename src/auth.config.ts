import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Add providers in auth.ts (Node.js runtime)
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    // temporarily disabled for debugging
    // authorized({ auth, request: { nextUrl } }) { ... }
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.role) (session.user as any).role = token.role;
        if (token.id) (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
} satisfies NextAuthConfig;
