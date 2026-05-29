import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'
import { randomUUID } from 'crypto'

const MAX_SIZE   = 10 * 1024 * 1024  // 10 MB por arquivo
const QUOTA_MAX  = 100 * 1024 * 1024 // 100 MB por escritório

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const userId   = session.user.id
  const supabase = createServiceClient()

  // Busca escritório do usuário
  const { data: membro } = await supabase
    .from('membros')
    .select('escritorio_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!membro?.escritorio_id) {
    return NextResponse.json({ error: 'Escritório não encontrado' }, { status: 404 })
  }

  const escritorioId = membro.escritorio_id

  // Verifica quota atual do escritório
  const { data: docs } = await supabase
    .from('documentos')
    .select('tamanho')
    .eq('escritorio_id', escritorioId)

  const quotaUsada = (docs ?? []).reduce((sum, d) => sum + (d.tamanho ?? 0), 0)

  const formData = await req.formData()
  const file     = formData.get('file')     as File   | null
  const nome     = formData.get('nome')     as string | null
  const tipo     = formData.get('tipo')     as string | null
  const casoId   = formData.get('caso_id')  as string | null
  const clienteId = formData.get('cliente_id') as string | null

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Apenas arquivos PDF são permitidos' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 10 MB' }, { status: 400 })
  }
  if (quotaUsada + file.size > QUOTA_MAX) {
    const disponivel = QUOTA_MAX - quotaUsada
    const dispMB     = (disponivel / (1024 * 1024)).toFixed(1)
    return NextResponse.json(
      { error: `Cota de armazenamento insuficiente. Disponível: ${dispMB} MB` },
      { status: 413 }
    )
  }

  const fileId  = randomUUID()
  const path    = `${escritorioId}/${fileId}.pdf`
  const buffer  = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError) {
    console.error('[upload/documento]', uploadError)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('documentos')
    .getPublicUrl(path)

  // Salva metadados
  const { data: doc, error: insertError } = await supabase
    .from('documentos')
    .insert({
      escritorio_id: escritorioId,
      caso_id:       casoId   || null,
      cliente_id:    clienteId || null,
      uploaded_by:   userId,
      nome:          nome || file.name.replace('.pdf', ''),
      filename:      file.name,
      tipo:          tipo || 'outro',
      tamanho:       file.size,
      storage_path:  path,
      url:           publicUrl,
    })
    .select()
    .single()

  if (insertError) {
    // Tenta remover arquivo do storage para evitar órfão
    await supabase.storage.from('documentos').remove([path])
    console.error('[upload/documento] insert error', insertError)
    return NextResponse.json({ error: 'Erro ao salvar metadados' }, { status: 500 })
  }

  return NextResponse.json({ documento: doc })
}
