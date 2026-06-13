import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";

import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "Authenticator Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        // Handle 2FA Verification
        if (user.isTwoFactorEnabled && user.twoFactorSecret) {
          if (!credentials.totp) {
            throw new Error("2FA code required");
          }
          const isValidTotp = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: credentials.totp,
            window: 1
          });

          if (!isValidTotp) {
            throw new Error("Invalid 2FA code");
          }
        }

        // Return the user object, which is encoded in the JWT
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Attach custom role
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
