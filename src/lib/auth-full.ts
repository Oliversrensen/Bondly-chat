import NextAuth, { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { generateSillyName } from "./sillyname";

// Ensure AUTH_SECRET is set
if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set");
}


export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth" }, // middleware will redirect here if not logged in
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      // Explicitly enable PKCE
      checks: ["pkce", "state"],
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      // Explicitly enable PKCE for GitHub too
      checks: ["pkce", "state"],
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user?.id) token.sub = user.id; return token; },
    async session({ session, token }) { if (session.user && token.sub) (session.user as any).id = token.sub; return session; },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  // Ensure proper PKCE handling
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  events: {
  async createUser({ user }) {
    if (!user?.id) return;
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { sillyName: generateSillyName() },
      });
    } catch (err) {
      console.error("Failed to assign silly name", err);
    }
  },
},
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
