import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

let cachedAdapter: Adapter | null = null;
let cachedOptions: NextAuthOptions | null = null;

function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Configure it in your deployment before running NextAuth."
    );
  }
}

function getAdapter(): Adapter {
  if (!cachedAdapter) {
    ensureDatabaseUrl();
    try {
      cachedAdapter = PrismaAdapter(prisma);
    } catch (error) {
      console.error("Failed to initialize PrismaAdapter", {
        error,
        databaseUrlDefined: Boolean(process.env.DATABASE_URL),
      });
      throw error;
    }
  }
  return cachedAdapter;
}

export function getAuthOptions(): NextAuthOptions {
  if (!cachedOptions) {
    const adapter = getAdapter();
    cachedOptions = {
      adapter,
      providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ],
      secret: process.env.NEXTAUTH_SECRET,
      callbacks: {
        session({ session, user }) {
          if (session.user) {
            session.user.id = user.id;
            // Assign admin role if the email matches the admin email from env variables
            session.user.role = user.email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
          }
          return session;
        },
      },
    };
  }

  return cachedOptions;
}
