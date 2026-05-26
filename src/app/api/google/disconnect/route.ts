import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revokeToken } from '@/lib/google/calendar'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const userId = session.user.id
  const supabase = createClient()

  const { data: row } = await supabase
    .from('google_calendar_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .maybeSingle()

  if (row?.access_token) {
    await revokeToken(row.access_token)
  }

  await supabase.from('google_calendar_tokens').delete().eq('user_id', userId)

  return NextResponse.json({ disconnected: true })
}
