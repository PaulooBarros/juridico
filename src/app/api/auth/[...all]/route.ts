import { auth } from "../../../../lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const handler = toNextJsHandler(auth.handler);

export async function GET(req: NextRequest) {
  console.log("[auth]", req.method, req.nextUrl.pathname);
  return handler.GET(req);
}

export async function POST(req: NextRequest) {
  console.log("[auth]", req.method, req.nextUrl.pathname);
  return handler.POST(req);
}
