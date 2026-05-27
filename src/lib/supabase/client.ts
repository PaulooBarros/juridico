/**
 * Clientes Supabase para uso no browser (componentes 'use client').
 *
 * createClient()         — cliente anon simples (sem autenticação)
 * createAuthClient()     — cliente com header x-user-id injetado automaticamente
 *                          → ativa as políticas de RLS do Better Auth
 *
 * Use sempre createAuthClient() nas funções de query (listarCasos, etc.).
 */
import { createBrowserClient } from '@supabase/ssr'
import { authClient } from '@/lib/auth-client'

// ── Cache do userId em memória (evita getSession() em toda query) ──────────────
let _cachedUserId: string | null | undefined = undefined

async function getCachedUserId(): Promise<string | null> {
  if (_cachedUserId !== undefined) return _cachedUserId
  const session = await authClient.getSession()
  _cachedUserId = session.data?.user?.id ?? null
  return _cachedUserId
}

/** Invalida o cache (chamar no login/logout) */
export function invalidateUserCache() {
  _cachedUserId = undefined
}

// ── Cliente anon (sem contexto de usuário) ────────────────────────────────────

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

// ── Cliente autenticado (injeta x-user-id → ativa RLS) ───────────────────────

export async function createAuthClient() {
  const userId = await getCachedUserId()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    userId
      ? { global: { headers: { 'x-user-id': userId } } }
      : undefined
  )
}
