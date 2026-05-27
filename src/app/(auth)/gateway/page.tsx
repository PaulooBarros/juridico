'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Mail, ArrowRight } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { getMeuEscritorioId } from '@/lib/supabase/escritorio'
import { createClient } from '@/lib/supabase/client'

function extrairToken(input: string): string {
  try {
    const url = new URL(input)
    return url.searchParams.get('token') ?? input.trim()
  } catch {
    return input.trim()
  }
}

export default function GatewayPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('você')
  const [codigoInput, setCodigoInput] = useState('')
  const [validando, setValidando] = useState(false)
  const [erroConvite, setErroConvite] = useState('')

  useEffect(() => {
    async function init() {
      const session = await authClient.getSession()
      const user = session.data?.user
      if (user?.name) setFirstName(user.name.trim().split(' ')[0])

      const escritorioId = await getMeuEscritorioId()
      if (escritorioId) router.replace('/dashboard')
    }
    init()
  }, [router])

  async function handleValidar() {
    const token = extrairToken(codigoInput)
    if (!token) return
    setErroConvite('')
    setValidando(true)

    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_convite_by_token', { p_token: token })

    if (error || !data) {
      setErroConvite('Convite não encontrado. Verifique o código e tente novamente.')
      setValidando(false)
      return
    }
    if (data.accepted_at) {
      setErroConvite('Este convite já foi utilizado.')
      setValidando(false)
      return
    }
    if (new Date(data.expires_at) < new Date()) {
      setErroConvite('Este convite expirou.')
      setValidando(false)
      return
    }

    router.push(`/convite?token=${token}`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-8 py-16">
      <div className="w-full max-w-[760px]">

        <div className="text-center mb-10">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground mb-3">
            Olá, {firstName}
          </p>
          <h1 className="font-serif text-[36px] font-medium tracking-[-0.02em] leading-[1.15]">Como você quer começar?</h1>
          <p className="text-[14px] text-muted-foreground mt-3 max-w-[52ch] mx-auto">
            Você ainda não está vinculado a nenhum escritório na Leea.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/onboarding"
            className="flex flex-col gap-4 p-7 rounded-[8px] border border-border bg-card hover:border-foreground/30 hover:shadow-sm transition-all group"
          >
            <Building2 size={22} className="text-primary" />
            <div>
              <h3 className="font-serif text-[20px] font-medium tracking-[-0.01em] mb-1.5">Criar um escritório</h3>
              <p className="text-[13px] text-muted-foreground leading-[1.55]">
                Configure um novo escritório do zero. Você será titular e poderá convidar a equipe depois.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-primary mt-auto">
              Começar configuração
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <div className="flex flex-col gap-4 p-7 rounded-[8px] border border-border bg-card">
            <Mail size={22} className="text-muted-foreground" />
            <div>
              <h3 className="font-serif text-[20px] font-medium tracking-[-0.01em] mb-1.5">Tenho um convite</h3>
              <p className="text-[13px] text-muted-foreground leading-[1.55]">
                Cole o link ou código que recebeu para entrar em um escritório existente.
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <div className="flex gap-2">
                <input
                  value={codigoInput}
                  onChange={e => { setCodigoInput(e.target.value); setErroConvite('') }}
                  onKeyDown={e => e.key === 'Enter' && handleValidar()}
                  className="flex-1 h-9 px-3 text-[13px] bg-background border border-border rounded-[5px] focus:outline-none focus:border-primary"
                  placeholder="Link ou código do convite"
                />
                <button
                  onClick={handleValidar}
                  disabled={!codigoInput.trim() || validando}
                  className="px-3 h-9 border border-border bg-card rounded-[5px] text-[13px] font-medium hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {validando ? '…' : 'Validar'}
                </button>
              </div>
              {erroConvite && <p className="text-[11px] text-destructive">{erroConvite}</p>}
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-[12px] text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">← Sair e entrar com outra conta</Link>
        </p>
      </div>
    </div>
  )
}
