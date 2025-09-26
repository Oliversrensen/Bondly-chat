// src/lib/auth-middleware.ts (unchanged)
import NextAuth from "next-auth";
export const { auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/auth" },
  providers: [],
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request }) {
      const p = request.nextUrl.pathname;
      if (p.startsWith("/auth") || p.startsWith("/api/auth") || p.startsWith("/_next")) return true;
      if (p === "/favicon.ico" || p === "/robots.txt" || p === "/sitemap.xml") return true;
      return !!auth;
    },
  },
});
