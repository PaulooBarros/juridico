/**
 * Cliente Supabase com a SERVICE ROLE KEY.
 *
 * ⚠️  USE APENAS EM CÓDIGO SERVER-SIDE (Server Components, API Routes, Server Actions).
 *      Nunca importe este arquivo em componentes 'use client'.
 *
 * O service role bypassa TODAS as políticas de RLS — só é seguro porque
 * o código do servidor já valida a sessão via Better Auth antes de qualquer query.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !secret) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados. ' +
      'Adicione ao .env.local (veja README).'
    )
  }

  return createSupabaseClient(url, secret, {
    auth: {
      // Service role não usa sessão de usuário
      autoRefreshToken:  false,
      persistSession:    false,
      detectSessionInUrl: false,
    },
  })
}
