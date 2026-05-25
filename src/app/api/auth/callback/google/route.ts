import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens } from '@/lib/google/calendar'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code   = searchParams.get('code')
  const userId = searchParams.get('state')

  const redirectBase = `${origin}/configuracoes`

  if (!code || !userId) {
    return NextResponse.redirect(`${redirectBase}?tab=integracoes&erro=google-auth-falhou`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(`${redirectBase}?tab=integracoes&erro=token-invalido`)
    }

    // Usa o server client (lê cookies do browser) — nunca o browser client
    const supabase = createClient()

    const { data: membro } = await supabase
      .from('membros')
      .select('escritorio_id')
      .limit(1)
      .maybeSingle()

    const escritorioId = membro?.escritorio_id ?? null

    if (!escritorioId) {
      return NextResponse.redirect(`${redirectBase}?tab=integracoes&erro=sem-escritorio`)
    }

    const { error: upsertError } = await supabase
      .from('google_calendar_tokens')
      .upsert(
        {
          user_id:       userId,
          escritorio_id: escritorioId,
          access_token:  tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at:    new Date(tokens.expiry_date!).toISOString(),
          calendar_id:   'primary',
          updated_at:    new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )

    if (upsertError) {
      console.error('[google-callback] upsert error:', upsertError)
      return NextResponse.redirect(`${redirectBase}?tab=integracoes&erro=google-auth-falhou`)
    }

    return NextResponse.redirect(`${redirectBase}?tab=integracoes&sucesso=google-conectado`)
  } catch (e) {
    console.error('[google-callback] unexpected error:', e)
    return NextResponse.redirect(`${redirectBase}?tab=integracoes&erro=google-auth-falhou`)
  }
}
