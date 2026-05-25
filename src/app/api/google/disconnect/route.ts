import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revokeToken } from '@/lib/google/calendar'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: row } = await supabase
    .from('google_calendar_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .maybeSingle()

  if (row?.access_token) {
    await revokeToken(row.access_token)
  }

  await supabase.from('google_calendar_tokens').delete().eq('user_id', user.id)

  return NextResponse.json({ disconnected: true })
}
