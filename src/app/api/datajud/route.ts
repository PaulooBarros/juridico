import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { consultarProcesso } from '@/lib/datajud'

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: headers() })
    if (!session?.user) {
      return NextResponse.json({ ok: false, erro: 'Não autenticado.' }, { status: 401 })
    }

    const body = await req.json()
    const numero = body?.numero
    if (!numero || typeof numero !== 'string') {
      return NextResponse.json({ ok: false, erro: 'Número do processo é obrigatório.' }, { status: 400 })
    }

    const resultado = await consultarProcesso(numero.trim())
    return NextResponse.json(resultado)
  } catch (e: any) {
    console.error('[datajud]', e)
    return NextResponse.json(
      { ok: false, erro: 'Erro interno ao processar a requisição.' },
      { status: 500 },
    )
  }
}
