import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  // Usa cliente sem userId — waitlist é pública
  const supabase = createClient()

  const { error } = await supabase
    .from('waitlist')
    .insert({ email: email.toLowerCase().trim() })

  if (error) {
    // Duplicate email — trata como sucesso silencioso
    if (error.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    console.error('[waitlist]', error)
    return NextResponse.json({ error: 'Erro ao salvar. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
