'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

const BENEFITS = [
  'Plano Free para sempre, sem cartão',
  '14 dias grátis nos planos pagos',
  'Migração assistida de planilhas e Drive',
  'LGPD nativo, dados no Brasil',
]

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroContent />
    </Suspense>
  )
}

function CadastroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/gateway'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [aceite, setAceite] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!aceite) { setErro('Aceite os termos para continuar.'); return }
    if (senha.length < 10) { setErro('A senha deve ter no mínimo 10 caracteres.'); return }

    setErro('')
    setLoading(true)

    const { error } = await (authClient.signUp.email as any)({
      name:     nome,
      email,
      password: senha,
    })

    if (error) {
      setErro(
        error.message?.includes('already') || error.message?.includes('email')
          ? 'Este e-mail já está cadastrado.'
          : 'Não foi possível criar a conta. Tente novamente.'
      )
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* Left — brand side */}
      <div className="hidden lg:flex flex-col justify-between bg-muted border-r border-border px-12 py-12">
        <Link href="/landing" className="flex items-center gap-2.5">
          <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">
            V
          </div>
          <span className="font-serif font-medium text-[15px] tracking-[-0.01em]">
            Vetor <em className="text-primary not-italic">Jurídico</em>
          </span>
        </Link>

        <div>
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground mb-3.5">
            Você está a 30 segundos de
          </p>
          <p className="font-serif text-[32px] leading-[1.15] tracking-[-0.02em] max-w-[18ch]">
            organizar a operação inteira do escritório em{' '}
            <em className="text-primary">um lugar só.</em>
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {BENEFITS.map(t => (
              <div key={t} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                <Check size={14} className="text-primary shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[11px] text-muted-foreground">v2026.05 · São Paulo, Brasil</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[360px]">
          {/* Mobile brand */}
          <Link href="/landing" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">V</div>
            <span className="font-serif font-medium text-[15px]">Vetor <em className="text-primary not-italic">Jurídico</em></span>
          </Link>

          <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Criar conta</h1>
          <p className="text-[13px] text-muted-foreground mb-6">Comece agora. Configure o escritório no próximo passo.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Nome completo</Label>
              <Input
                type="text"
                placeholder="Como aparece na sua OAB"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                className="h-9 text-[13px] bg-card border-border rounded-[5px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">E-mail profissional</Label>
              <Input
                type="email"
                placeholder="voce@escritorio.com.br"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-9 text-[13px] bg-card border-border rounded-[5px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Senha</Label>
              <Input
                type="password"
                placeholder="Mínimo 10 caracteres"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                className="h-9 text-[13px] bg-card border-border rounded-[5px]"
              />
              <p className="text-[11px] text-muted-foreground">Use uma combinação de letras, números e símbolos.</p>
            </div>

            <label className="flex items-start gap-2.5 text-[12px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={aceite}
                onChange={e => setAceite(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Concordo com os{' '}
                <a className="text-primary hover:underline cursor-pointer">Termos de Uso</a>
                {' '}e a{' '}
                <a className="text-primary hover:underline cursor-pointer">Política de Privacidade</a>.
              </span>
            </label>

            {erro && (
              <p className="text-[12px] text-destructive">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-[13px] text-muted-foreground mt-8">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
