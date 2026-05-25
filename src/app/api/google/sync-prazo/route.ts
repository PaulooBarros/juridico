import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCalendarClient } from '@/lib/google/calendar'

/** Cria ou atualiza evento no Google Calendar para o prazo. */
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { prazoId } = await req.json()

  const { data: prazo } = await supabase
    .from('prazos')
    .select('*, casos(titulo)')
    .eq('id', prazoId)
    .single()

  if (!prazo) return NextResponse.json({ error: 'Prazo não encontrado' }, { status: 404 })

  const client = await getCalendarClient(user.id)
  if (!client) return NextResponse.json({ synced: false, reason: 'sem-token' })

  const { calendar, calendarId } = client

  const casoTitulo = (prazo.casos as any)?.titulo
  const event = {
    summary: prazo.titulo,
    description: [
      casoTitulo && `Caso: ${casoTitulo}`,
      prazo.descricao,
    ].filter(Boolean).join('\n') || undefined,
    start: { date: prazo.data_prazo },
    end:   { date: prazo.data_prazo },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
      ],
    },
  }

  try {
    let eventId = prazo.google_event_id as string | null

    if (eventId) {
      await calendar.events.update({ calendarId, eventId, requestBody: event })
    } else {
      const res = await calendar.events.insert({ calendarId, requestBody: event })
      eventId = res.data.id!
      await supabase.from('prazos').update({ google_event_id: eventId }).eq('id', prazoId)
    }

    return NextResponse.json({ synced: true, eventId })
  } catch (e: any) {
    return NextResponse.json({ synced: false, error: e.message }, { status: 500 })
  }
}

/** Remove o evento do Google Calendar (antes de deletar o prazo). */
export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { prazoId } = await req.json()

  const { data: prazo } = await supabase
    .from('prazos')
    .select('google_event_id')
    .eq('id', prazoId)
    .single()

  if (!prazo?.google_event_id) return NextResponse.json({ deleted: false, reason: 'sem-evento' })

  const client = await getCalendarClient(user.id)
  if (!client) return NextResponse.json({ deleted: false, reason: 'sem-token' })

  const { calendar, calendarId } = client

  try {
    await calendar.events.delete({ calendarId, eventId: prazo.google_event_id })
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ deleted: false })
  }
}
