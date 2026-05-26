import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens } from '@/lib/google/calendar'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code   = searchParams.get('code')
  const userId = searchParams.get('state')

  const redirectBase = `${origin}/configuracoes`

  if (!code || !userId) {
    console.error('[google-callback] missing code or userId', { code: !!code, userId: !!userId })
    return NextResponse.redirect(`${redirectBase}?tab=integracoes&erro=google-auth-falhou`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    console.log('[google-callback] tokens recebidos:', {
      hasAccess:  !!tokens.access_token,
      hasRefresh: !!tokens.refresh_token,
      expiry:     tokens.expiry_date,
    })

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('[google-callback] token inválido — sem access ou refresh token')
      return NextResponse.redirect(`${redirectBase}?tab=integracoes&erro=token-invalido`)
    }

    const supabase = createClient()

    const { data: membro, error: membroError } = await supabase
      .from('membros')
      .select('escritorio_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()

    console.log('[google-callback] membro lookup:', { userId, membro, membroError })

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
