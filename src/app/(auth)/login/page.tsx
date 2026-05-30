'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { getMeuEscritorioId } from '@/lib/supabase/escritorio'
import { LeeaLogo } from '@/components/ui/leea-logo'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
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

    const { error } = await authClient.signIn.email({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    if (nextParam) {
      router.push(nextParam)
      router.refresh()
      return
    }

    const escritorioId = await getMeuEscritorioId()
    router.push(escritorioId ? '/dashboard' : '/gateway')
    router.refresh()
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* Left — brand side */}
      <div className="hidden lg:flex flex-col justify-between border-r border-border px-12 py-12" style={{ backgroundColor: '#1A1714' }}>
        <Link href="/landing" className="flex items-center gap-3">
          <img src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png" alt="" className="w-8 h-8" />
          <LeeaLogo variant="dark" height={24} />
        </Link>

        <div>
          <p className="font-serif text-[36px] leading-[1.15] tracking-[-0.02em] max-w-[20ch]" style={{ color: '#FBFAF6' }}>
            &ldquo;Quando tudo está sob controle, a advocacia fica{' '}
            <em style={{ color: '#A8231F' }}>inevitável.</em>&rdquo;
          </p>
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase mt-6" style={{ color: '#5C554C' }}>— Leea · Software Jurídico</p>
        </div>

        <p className="font-mono text-[11px]" style={{ color: '#5C554C' }}>v2026.05 · Aracaju, Brasil</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[360px]">
          {/* Mobile brand */}
          <Link href="/landing" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <img src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png" alt="" className="w-6 h-6" />
            <LeeaLogo variant="light" height={20} />
          </Link>

          <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Entrar</h1>
          <p className="text-[13px] text-muted-foreground mb-6">Acesse sua conta para continuar.</p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/completar-perfil` })}
            className="w-full flex items-center justify-center gap-2.5 h-9 border border-border rounded-[5px] text-[13px] font-medium text-foreground hover:bg-accent transition-colors mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

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

          <p className="text-center text-[13px] text-muted-foreground mt-8">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-primary hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
