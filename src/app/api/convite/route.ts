import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendConviteEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { email, role } = await req.json()
  if (!email || !role) {
    return NextResponse.json({ error: 'email e role são obrigatórios' }, { status: 400 })
  }

  const userId = session.user.id
  const supabase = createClient(userId)

  // Busca o escritório do usuário
  const { data: membro } = await supabase
    .from('membros')
    .select('escritorio_id, escritorios(nome)')
    .eq('user_id', userId)
    .single()

  if (!membro) {
    return NextResponse.json({ error: 'Escritório não encontrado' }, { status: 404 })
  }

  const escritorioId = membro.escritorio_id
  const nomeEscritorio = (membro.escritorios as any)?.nome ?? 'Escritório'

  // Cria o convite
  const { data: convite, error } = await supabase
    .from('convites')
    .insert({ escritorio_id: escritorioId, created_by: userId, email, role })
    .select('id, email, role, token, expires_at, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Envia o email
  try {
    await sendConviteEmail({
      email,
      nomeEscritorioR:  nomeEscritorio,
      role,
      token:            convite.token,
      nomeConvidadoPor: session.user.name ?? undefined,
    })
  } catch (emailErr) {
    console.error('[convite] falha ao enviar email:', emailErr)
    // Não bloqueia — o convite foi criado, email pode ser reenviado
  }

  return NextResponse.json(convite)
}
