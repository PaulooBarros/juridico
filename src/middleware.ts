import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED = /^\/(dashboard|casos|clientes|documentos|financeiro|equipe|calendario|configuracoes|modelos|notificacoes|perfil|escritorio|planos)/

export function middleware(request: NextRequest) {
  if (PROTECTED.test(request.nextUrl.pathname)) {
    // Better Auth uses 'better-auth.session_token' in dev and
    // '__Secure-better-auth.session_token' in production (HTTPS).
    const hasSession =
      request.cookies.has('better-auth.session_token') ||
      request.cookies.has('__Secure-better-auth.session_token')
    if (!hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
