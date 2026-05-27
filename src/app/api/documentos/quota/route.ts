import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const QUOTA_TOTAL = 100 * 1024 * 1024 // 100 MB

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const userId   = session.user.id
  const supabase = createClient(userId)

  const { data: membro } = await supabase
    .from('membros')
    .select('escritorio_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!membro?.escritorio_id) {
    return NextResponse.json({ usada: 0, total: QUOTA_TOTAL })
  }

  const { data: docs } = await supabase
    .from('documentos')
    .select('tamanho')
    .eq('escritorio_id', membro.escritorio_id)

  const usada = (docs ?? []).reduce((sum, d) => sum + (d.tamanho ?? 0), 0)

  return NextResponse.json({ usada, total: QUOTA_TOTAL })
}
