import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const userId = session.user.id

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Apenas JPG, PNG ou WebP' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 2 MB' }, { status: 400 })

    const supabase = createServiceClient()

    const ext    = file.type.split('/')[1].replace('jpeg', 'jpg')
    const path   = `avatars/${userId}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('imagens')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('[upload/avatar] storage error:', uploadError)
      return NextResponse.json({ error: `Storage: ${uploadError.message}` }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('imagens').getPublicUrl(path)

    // Cache-buster: força o browser a buscar a nova imagem em vez de servir a versão em cache
    // (a URL base é sempre a mesma para o mesmo userId, então sem isso o browser mostra a foto antiga)
    const freshUrl = `${publicUrl}?t=${Date.now()}`

    // Atualiza diretamente na tabela do Better Auth (service role bypassa RLS)
    const { error: dbError } = await supabase
      .from('user')
      .update({ image: freshUrl })
      .eq('id', userId)

    if (dbError) {
      console.error('[upload/avatar] db error:', dbError)
      return NextResponse.json({ error: `Falha ao salvar URL da foto: ${dbError.message}` }, { status: 500 })
    }

    // Atualiza também via API do Better Auth para que a sessão retorne o novo valor
    try {
      await auth.api.updateUser({
        body:    { image: freshUrl },
        headers: req.headers,
      })
    } catch (authErr) {
      console.error('[upload/avatar] auth.api.updateUser error:', authErr)
    }

    return NextResponse.json({ url: freshUrl })
  } catch (err: any) {
    console.error('[upload/avatar] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}
