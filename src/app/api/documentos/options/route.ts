import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

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
    return NextResponse.json({ casos: [], clientes: [] })
  }

  const escritorioId = membro.escritorio_id

  const [{ data: casos }, { data: clientes }] = await Promise.all([
    supabase
      .from('casos')
      .select('id, titulo')
      .eq('escritorio_id', escritorioId)
      .in('status', ['active', 'pending', 'suspended'])
      .order('titulo', { ascending: true }),
    supabase
      .from('clientes')
      .select('id, name')
      .eq('escritorio_id', escritorioId)
      .order('name', { ascending: true }),
  ])

  return NextResponse.json({
    casos:    casos    ?? [],
    clientes: clientes ?? [],
  })
}
