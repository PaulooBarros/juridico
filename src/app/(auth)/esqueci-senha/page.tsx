'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LeeaLogo } from '@/components/ui/leea-logo'
type Step = 'email' | 'enviado'

export default function EsqueciSenhaPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const redirectTo = `${window.location.origin}/redefinir-senha`
    const res = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirectTo }),
    })

    if (!res.ok) {
      setErro('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.')
      setLoading(false)
      return
    }

    setStep('enviado')
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* Left — brand side */}
      <div className="hidden lg:flex flex-col justify-between bg-muted border-r border-border px-12 py-12">
        <Link href="/login" className="flex items-center gap-2.5">
          <img src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png" alt="" className="w-7 h-7" />
          <LeeaLogo variant="light" height={20} />
        </Link>

        <div>
          <p className="font-serif text-[36px] leading-[1.15] tracking-[-0.02em] max-w-[20ch]">
            &ldquo;Quando tudo está sob controle, a advocacia fica{' '}
            <em className="text-primary">inevitável.</em>&rdquo;
          </p>
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground mt-6">— Leea</p>
        </div>

        <p className="font-mono text-[11px] text-muted-foreground">v2026.05 · Aracaju, Brasil</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[360px]">
          {/* Mobile brand */}
          <Link href="/login" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <img src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png" alt="" className="w-6 h-6" />
            <LeeaLogo variant="light" height={20} />
          </Link>

          {step === 'email' && (
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-8">
                <ArrowLeft size={12} /> Voltar para o login
              </Link>

              <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Esqueceu a senha?</h1>
              <p className="text-[13px] text-muted-foreground mb-6">
                Informe seu e-mail. Você receberá um link para redefinir a senha.
              </p>

              <form onSubmit={handleEnviar} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[12px] font-medium text-muted-foreground">E-mail</Label>
                  <Input
                    type="email"
                    placeholder="voce@escritorio.com.br"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="h-9 text-[13px] bg-card border-border rounded-[5px]"
                  />
                </div>

                {erro && <p className="text-[12px] text-destructive">{erro}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando…' : 'Enviar link de redefinição'}
                </button>
              </form>
            </>
          )}

          {step === 'enviado' && (
            <div className="flex flex-col items-center text-center gap-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck size={22} className="text-primary" />
              </div>

              <div>
                <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-2">Verifique seu e-mail</h1>
                <p className="text-[13px] text-muted-foreground leading-[1.6]">
                  Enviamos um link de redefinição para{' '}
                  <span className="font-medium text-foreground">{email}</span>.
                  <br />O link expira em 1 hora.
                </p>
              </div>

              <p className="text-[12px] text-muted-foreground">
                Não recebeu?{' '}
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-primary hover:underline"
                >
                  Tentar novamente
                </button>
              </p>

              <Link
                href="/login"
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
