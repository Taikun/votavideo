import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

let handler: ReturnType<typeof NextAuth> | null = null;

const getHandler = () => {
  if (!handler) {
    handler = NextAuth(getAuthOptions());
  }
  return handler;
};

export function GET(request: Request, context: unknown) {
  return getHandler()(request, context as never);
}

export function POST(request: Request, context: unknown) {
  return getHandler()(request, context as never);
}

export const runtime = 'nodejs';
