import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  const isProtected = /^\/(dashboard|casos|clientes|documentos|financeiro|equipe|calendario|configuracoes|modelos|notificacoes|perfil|escritorio|planos)/.test(
    request.nextUrl.pathname
  );

  if (isProtected && !session?.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
