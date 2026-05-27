/**
 * Clientes Supabase para Server Components, API Routes e Server Actions.
 *
 * createClient(userId?)         — cliente base, aceita userId opcional
 * createServerAuthClient()      — async: busca o userId da sessão Better Auth
 *                                 automaticamente e injeta como x-user-id (RLS)
 *
 * Se SUPABASE_SERVICE_ROLE_KEY estiver configurada, o service role é usado
 * automaticamente (bypassa RLS — seguro porque o código é server-side).
 */
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const URL  = () => process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const SVC  = () => process.env.SUPABASE_SERVICE_ROLE_KEY

// ── Cliente base (aceita userId opcional para RLS) ────────────────────────────

export function createClient(userId?: string) {
  const serviceKey = SVC()

  // Service role bypassa RLS → preferido quando disponível
  if (serviceKey) {
    return createSupabaseClient(URL(), serviceKey, {
      auth: {
        autoRefreshToken:   false,
        persistSession:     false,
        detectSessionInUrl: false,
      },
    })
  }

  // Anon key + x-user-id para ativar RLS
  const cookieStore = cookies()
  return createServerClient(URL(), ANON(), {
    cookies: {
      getAll()                { return cookieStore.getAll() },
      setAll(cookiesToSet)    {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch { /* Server Components não podem escrever cookies */ }
      },
    },
    global: userId ? { headers: { 'x-user-id': userId } } : undefined,
  })
}

// ── Cliente autenticado (busca userId automaticamente) ────────────────────────
// Use este em Server Components e API Routes quando não tiver o userId em mãos.

export async function createServerAuthClient() {
  // Se tiver service role, não precisa buscar sessão
  if (SVC()) return createClient()

  // Importação dinâmica para evitar carregar auth.ts em contextos de build
  const { auth } = await import('@/lib/auth')
  const { headers } = await import('next/headers')

  const session = await auth.api.getSession({ headers: headers() }).catch(() => null)
  const userId  = session?.user?.id ?? undefined

  return createClient(userId)
}
