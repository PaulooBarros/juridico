'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  const senhaOk = senha.length >= 8
  const match = senha === confirmar

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!senhaOk || !match) return
    setErro('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })

    if (error) {
      setErro('Não foi possível redefinir a senha. O link pode ter expirado.')
      setLoading(false)
      return
    }

    setOk(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

      {/* Left — brand side */}
      <div className="hidden lg:flex flex-col justify-between bg-muted border-r border-border px-12 py-12">
        <div className="flex items-center gap-2.5">
          <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">
            V
          </div>
          <span className="font-serif font-medium text-[15px] tracking-[-0.01em]">
            Vetor <em className="text-primary not-italic">Jurídico</em>
          </span>
        </div>

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

          {ok ? (
            <div className="flex flex-col items-center text-center gap-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-2">Senha redefinida</h1>
                <p className="text-[13px] text-muted-foreground">Redirecionando para o login…</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">Nova senha</h1>
              <p className="text-[13px] text-muted-foreground mb-6">
                Escolha uma senha com pelo menos 8 caracteres.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[12px] font-medium text-muted-foreground">Nova senha</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    required
                    autoFocus
                    className="h-9 text-[13px] bg-card border-border rounded-[5px]"
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
                    required
                    className={cn(
                      'h-9 text-[13px] bg-card rounded-[5px]',
                      confirmar && !match ? 'border-destructive' : 'border-border'
                    )}
                  />
                  {confirmar && !match && (
                    <p className="text-[11px] text-destructive">As senhas não conferem.</p>
                  )}
                </div>

                {erro && <p className="text-[12px] text-destructive">{erro}</p>}

                <button
                  type="submit"
                  disabled={!senhaOk || !match || loading}
                  className="w-full h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando…' : 'Redefinir senha'}
                </button>
              </form>

              <p className="text-center mt-6">
                <Link href="/login" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  ← Voltar para o login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
