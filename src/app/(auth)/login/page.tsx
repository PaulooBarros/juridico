'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { getMeuEscritorioId } from '@/lib/supabase/escritorio'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    // Se veio com ?next= (ex: fluxo de convite), respeita o destino
    if (nextParam) {
      router.push(nextParam)
      router.refresh()
      return
    }

    // Sem ?next=: decide pelo escritório do usuário
    const escritorioId = await getMeuEscritorioId()
    router.push(escritorioId ? '/dashboard' : '/gateway')
    router.refresh()
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* Left — brand side */}
      <div className="hidden lg:flex flex-col justify-between border-r border-border px-12 py-12" style={{ backgroundColor: '#1A1714' }}>
        <Link href="/landing">
          <img
            src="/vetor_juridico_opcao4.svg"
            alt="Vetor Jurídico"
            className="w-full max-w-[340px] h-auto"
          />
        </Link>

        <div>
          <p className="font-serif text-[36px] leading-[1.15] tracking-[-0.02em] max-w-[20ch]" style={{ color: '#FBFAF6' }}>
            &ldquo;Quando tudo está sob controle, a advocacia fica{' '}
            <em style={{ color: '#A8231F' }}>inevitável.</em>&rdquo;
          </p>
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase mt-6" style={{ color: '#5C554C' }}>— Vetor Jurídico</p>
        </div>

        <p className="font-mono text-[11px]" style={{ color: '#5C554C' }}>v2026.05 · São Paulo, Brasil</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[360px]">
          {/* Mobile brand */}
          <Link href="/landing" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">V</div>
            <span className="font-serif font-medium text-[15px]">Vetor <em className="text-primary not-italic">Jurídico</em></span>
          </Link>

          <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Entrar</h1>
          <p className="text-[13px] text-muted-foreground mb-6">Acesse sua conta para continuar.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">E-mail</Label>
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
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-medium text-muted-foreground">Senha</Label>
                <Link href="/esqueci-senha" className="text-[11px] text-primary hover:underline">
                  Esqueci a senha
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                className="h-9 text-[13px] bg-card border-border rounded-[5px]"
              />
            </div>

            {erro && (
              <p className="text-[12px] text-destructive">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            <button className="w-full h-9 border border-border rounded-[5px] text-[13px] font-medium bg-card hover:bg-accent transition-colors">
              Continuar com Google
            </button>
            <button className="w-full h-9 border border-border rounded-[5px] text-[13px] font-medium bg-card hover:bg-accent transition-colors">
              Entrar com certificado ICP-Brasil
            </button>
          </div>

          <p className="text-center text-[13px] text-muted-foreground mt-8">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-primary hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
