'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Step = 'email' | 'codigo' | 'nova-senha' | 'ok'

export default function EsqueciSenhaPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const mock = (fn: () => void, ms = 900) => {
    setLoading(true)
    setTimeout(() => { setLoading(false); fn() }, ms)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* Left — brand side */}
      <div className="hidden lg:flex flex-col justify-between bg-muted border-r border-border px-12 py-12">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">
            V
          </div>
          <span className="font-serif font-medium text-[15px] tracking-[-0.01em]">
            Vetor <em className="text-primary not-italic">Jurídico</em>
          </span>
        </Link>

        <div>
          <p className="font-serif text-[36px] leading-[1.15] tracking-[-0.02em] max-w-[20ch]">
            &ldquo;Quando tudo está sob controle, a advocacia fica{' '}
            <em className="text-primary">inevitável.</em>&rdquo;
          </p>
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground mt-6">— Vetor Jurídico</p>
        </div>

        <p className="font-mono text-[11px] text-muted-foreground">v2026.05 · São Paulo, Brasil</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[360px]">

          {/* Mobile brand */}
          <Link href="/login" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">V</div>
            <span className="font-serif font-medium text-[15px]">Vetor <em className="text-primary not-italic">Jurídico</em></span>
          </Link>

          {step === 'email'     && <StepEmail     email={email} setEmail={setEmail} loading={loading} onNext={() => mock(() => setStep('codigo'))} />}
          {step === 'codigo'    && <StepCodigo    email={email} loading={loading}   onNext={() => mock(() => setStep('nova-senha'))} onReenviar={() => mock(() => {})} />}
          {step === 'nova-senha'&& <StepNovaSenha loading={loading} onNext={() => mock(() => setStep('ok'))} />}
          {step === 'ok'        && <StepOk />}

        </div>
      </div>
    </div>
  )
}

// ── Etapa 1 — Informe seu e-mail ──────────────────────────────────────────────
function StepEmail({
  email, setEmail, loading, onNext,
}: {
  email: string
  setEmail: (v: string) => void
  loading: boolean
  onNext: () => void
}) {
  return (
    <>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={12} /> Voltar para o login
      </Link>

      <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Esqueceu a senha?</h1>
      <p className="text-[13px] text-muted-foreground mb-6">
        Informe o e-mail da sua conta. Vamos enviar um código de verificação.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[12px] font-medium text-muted-foreground">E-mail</Label>
          <Input
            type="email"
            placeholder="voce@escritorio.com.br"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-9 text-[13px] bg-card border-border rounded-[5px]"
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!email.includes('@') || loading}
          className="w-full h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando…' : 'Enviar código'}
        </button>
      </div>
    </>
  )
}

// ── Etapa 2 — Código de verificação ──────────────────────────────────────────
const CODE_LENGTH = 6

function StepCodigo({
  email, loading, onNext, onReenviar,
}: {
  email: string
  loading: boolean
  onNext: () => void
  onReenviar: () => void
}) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const refs = Array.from({ length: CODE_LENGTH }, () => useRef<HTMLInputElement>(null))
  const filled = digits.every(d => d !== '')

  const handle = (i: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = char
    setDigits(next)
    if (char && i < CODE_LENGTH - 1) refs[i + 1].current?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = [...digits]
    pasted.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    refs[Math.min(pasted.length, CODE_LENGTH - 1)].current?.focus()
  }

  return (
    <>
      <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Verifique seu e-mail</h1>
      <p className="text-[13px] text-muted-foreground mb-6">
        Enviamos um código de 6 dígitos para{' '}
        <span className="font-medium text-foreground">{email || 'seu e-mail'}</span>.
      </p>

      <div className="flex gap-2 mb-4" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handle(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={cn(
              'w-10 h-12 rounded-[5px] border text-center text-[18px] font-mono bg-card focus:outline-none transition-colors',
              d ? 'border-foreground' : 'border-border focus:border-primary'
            )}
            autoFocus={i === 0}
          />
        ))}
      </div>

      <p className="text-[12px] text-muted-foreground mb-6">
        Código de demonstração:{' '}
        <button
          type="button"
          onClick={() => setDigits('123456'.split(''))}
          className="font-mono font-medium text-primary hover:underline"
        >
          123456
        </button>
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!filled || loading}
          className="w-full h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verificando…' : 'Verificar código'}
        </button>

        <button
          type="button"
          onClick={onReenviar}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Não recebi o código — reenviar
        </button>
      </div>
    </>
  )
}

// ── Etapa 3 — Nova senha ──────────────────────────────────────────────────────
function StepNovaSenha({ loading, onNext }: { loading: boolean; onNext: () => void }) {
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const senhaOk = senha.length >= 8
  const match = senha === confirmar

  return (
    <>
      <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Nova senha</h1>
      <p className="text-[13px] text-muted-foreground mb-6">
        Escolha uma senha com pelo menos 8 caracteres.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[12px] font-medium text-muted-foreground">Nova senha</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="h-9 text-[13px] bg-card border-border rounded-[5px]"
            autoFocus
          />
          {senha && !senhaOk && (
            <p className="text-[11px] text-destructive">Mínimo 8 caracteres.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[12px] font-medium text-muted-foreground">Confirmar senha</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmar}
            onChange={e => setConfirmar(e.target.value)}
            className={cn(
              'h-9 text-[13px] bg-card rounded-[5px]',
              confirmar && !match ? 'border-destructive focus-visible:ring-destructive' : 'border-border'
            )}
          />
          {confirmar && !match && (
            <p className="text-[11px] text-destructive">As senhas não conferem.</p>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!senhaOk || !match || loading}
          className="w-full h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando…' : 'Redefinir senha'}
        </button>
      </div>
    </>
  )
}

// ── Etapa 4 — Confirmação ─────────────────────────────────────────────────────
function StepOk() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <CheckCircle2 size={24} className="text-primary" />
      </div>

      <div>
        <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Senha redefinida</h1>
        <p className="text-[13px] text-muted-foreground">
          Sua senha foi atualizada com sucesso. Use-a no próximo acesso.
        </p>
      </div>

      <Link
        href="/login"
        className="mt-2 w-full flex items-center justify-center h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors"
      >
        Ir para o login
      </Link>
    </div>
  )
}
