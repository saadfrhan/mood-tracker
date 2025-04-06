import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email === null) {
        throw new Error("EmailNotFound");
      }

      // Check if the user exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      if (existingUser) {
        // If the user exists but is trying to log in with a different provider
        if (existingUser.accounts[0].provider !== account?.provider) {
          throw new Error("OAuthAccountNotLinked");
        }
      }

      return true; // Allow sign-in
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
