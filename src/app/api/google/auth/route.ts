import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGoogleAuthUrl } from '@/lib/google/calendar'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const url = getGoogleAuthUrl(session.user.id)
  return NextResponse.redirect(url)
}
