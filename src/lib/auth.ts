import NextAuth, { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { generateRandomAvatar } from "./avatarGenerator";

// Ensure AUTH_SECRET is set
if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set");
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { 
    signIn: "/auth",
    error: "/auth/error"
  },
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
  ],
  events: {
    async createUser({ user }) {
      // Assign a random avatar when a new user is created
      try {
        console.log('Creating user with ID:', user.id);
        const avatar = generateRandomAvatar();
        console.log('Generated avatar:', avatar.preset.id, avatar.preset.name);
        
        const result = await prisma.user.update({
          where: { id: user.id },
          data: {
            selectedAvatarId: avatar.preset.id,
            profilePictureType: 'generated'
          }
        });
        console.log('Updated user with avatar:', result.selectedAvatarId);
      } catch (error) {
        console.error('Error assigning random avatar:', error);
      }
    },
  },
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
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
