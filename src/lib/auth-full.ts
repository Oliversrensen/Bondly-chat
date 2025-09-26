import NextAuth, { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { generateSillyName } from "./sillyname";


export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth" }, // middleware will redirect here if not logged in
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user?.id) token.sub = user.id; return token; },
    async session({ session, token }) { if (session.user && token.sub) (session.user as any).id = token.sub; return session; },
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
