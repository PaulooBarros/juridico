import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const userId   = session.user.id
  const supabase = createClient(userId)

  // Busca o documento para garantir que pertence ao escritório do usuário
  const { data: doc } = await supabase
    .from('documentos')
    .select('id, storage_path, escritorio_id')
    .eq('id', params.id)
    .maybeSingle()

  if (!doc) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })

  // Remove do storage
  if (doc.storage_path) {
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .remove([doc.storage_path])

    if (storageError) {
      console.error('[documentos/delete] storage error', storageError)
      // Continua mesmo se o storage falhar — o registro DB é o mais importante
    }
  }

  // Remove registro do banco
  const { error } = await supabase
    .from('documentos')
    .delete()
    .eq('id', params.id)

  if (error) {
    console.error('[documentos/delete] db error', error)
    return NextResponse.json({ error: 'Erro ao excluir documento' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
