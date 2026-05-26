import { NextResponse } from 'next/server'

// Este callback era usado pelo Supabase Auth (magic links, reset de senha).
// Após migração para Better Auth, o fluxo de reset de senha usa /redefinir-senha?token=...
// e é gerenciado diretamente pelo Better Auth em /api/auth/[...all].
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/login`)
}
