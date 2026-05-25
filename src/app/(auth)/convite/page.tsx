'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ConviteInfo = {
  id: string
  email: string
  role: string
  expires_at: string
  accepted_at: string | null
  escritorio: { nome: string; slug: string }
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Titular', admin: 'Sócio / Admin', lawyer: 'Advogado', assistant: 'Assistente',
}

export default function ConvitePage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''

  const [convite, setConvite] = useState<ConviteInfo | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'aceito' | 'erro'>('loading')
  const [erroMsg, setErroMsg] = useState('')
  const [aceitando, setAceitando] = useState(false)

  useEffect(() => {
    if (!token) { setStatus('erro'); setErroMsg('Token de convite não encontrado.'); return }

    const supabase = createClient()

    async function init() {
      const [{ data: { user } }, { data: info, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.rpc('get_convite_by_token', { p_token: token }),
      ])

      if (error || !info) { setStatus('erro'); setErroMsg('Convite não encontrado.'); return }
      if (info.accepted_at) { setStatus('erro'); setErroMsg('Este convite já foi utilizado.'); return }
      if (new Date(info.expires_at) < new Date()) { setStatus('erro'); setErroMsg('Este convite expirou.'); return }

      setConvite(info as ConviteInfo)
      setUser(user)
      setStatus('ok')
    }

    init()
  }, [token])

  async function handleAceitar() {
    if (!user) return
    setAceitando(true)
    const supabase = createClient()
    const { error } = await supabase.rpc('aceitar_convite', { p_token: token })
    if (error) {
      setErroMsg(error.message)
      setAceitando(false)
      return
    }
    setStatus('aceito')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  const next = `/convite?token=${token}`

  if (status === 'loading') {
    return (
      <Shell>
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground mt-4">Verificando convite…</p>
      </Shell>
    )
  }

  if (status === 'erro') {
    return (
      <Shell>
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={22} className="text-destructive" />
        </div>
        <h1 className="font-serif text-[24px] font-medium tracking-[-0.015em] mb-2">Convite inválido</h1>
        <p className="text-[13px] text-muted-foreground mb-6">{erroMsg}</p>
        <Link href="/login" className="text-[13px] text-primary hover:underline">← Voltar para o login</Link>
      </Shell>
    )
  }

  if (status === 'aceito') {
    return (
      <Shell>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={22} className="text-primary" />
        </div>
        <h1 className="font-serif text-[24px] font-medium tracking-[-0.015em] mb-2">Bem-vindo ao escritório!</h1>
        <p className="text-[13px] text-muted-foreground">Redirecionando…</p>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Building2 size={22} className="text-primary" />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Convite para</p>
      <h1 className="font-serif text-[26px] font-medium tracking-[-0.015em] mb-1">{convite!.escritorio.nome}</h1>
      <p className="text-[13px] text-muted-foreground mb-6">
        Como <strong className="text-foreground">{ROLE_LABEL[convite!.role] ?? convite!.role}</strong>
        {convite!.email ? ` · enviado para ${convite!.email}` : ''}
      </p>

      {user ? (
        <>
          <button onClick={handleAceitar} disabled={aceitando}
            className="w-full h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 mb-3">
            {aceitando ? 'Entrando…' : 'Aceitar convite e entrar'}
          </button>
          <p className="text-[12px] text-muted-foreground">
            Entrando como <strong className="text-foreground">{(user as any).email}</strong>.{' '}
            <Link href="/login" className="text-primary hover:underline">Trocar de conta</Link>
          </p>
        </>
      ) : (
        <>
          <div className="grid gap-2 w-full">
            <Link href={`/cadastro?next=${encodeURIComponent(next)}`}
              className="w-full flex items-center justify-center h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors">
              Criar conta e aceitar
            </Link>
            <Link href={`/login?next=${encodeURIComponent(next)}`}
              className="w-full flex items-center justify-center h-9 border border-border bg-card rounded-[5px] text-[13px] font-medium hover:bg-accent transition-colors">
              Já tenho conta — entrar
            </Link>
          </div>
          <p className="text-[12px] text-muted-foreground mt-4">
            O convite expira em {new Date(convite!.expires_at).toLocaleDateString('pt-BR')}.
          </p>
        </>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 py-16">
      <Link href="/landing" className="flex items-center gap-2 mb-10">
        <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">V</div>
        <span className="font-serif font-medium text-[15px]">Vetor <em className="text-primary not-italic">Jurídico</em></span>
      </Link>
      <div className="w-full max-w-[380px] text-center flex flex-col items-center">
        {children}
      </div>
    </div>
  )
}
