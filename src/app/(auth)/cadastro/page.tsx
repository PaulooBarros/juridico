import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'

const BENEFITS = [
  '14 dias grátis em todos os recursos',
  'Sem cartão de crédito',
  'Migração assistida de planilhas e Drive',
  'LGPD nativo, dados no Brasil',
]

export default function CadastroPage() {
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

          <form action="/gateway" className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Nome completo</Label>
              <Input
                type="text"
                placeholder="Como aparece na sua OAB"
                className="h-9 text-[13px] bg-card border-border rounded-[5px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">E-mail profissional</Label>
              <Input
                type="email"
                placeholder="voce@escritorio.com.br"
                className="h-9 text-[13px] bg-card border-border rounded-[5px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Senha</Label>
              <Input
                type="password"
                placeholder="Mínimo 10 caracteres"
                className="h-9 text-[13px] bg-card border-border rounded-[5px]"
              />
              <p className="text-[11px] text-muted-foreground">Use uma combinação de letras, números e símbolos.</p>
            </div>

            <label className="flex items-start gap-2.5 text-[12px] text-muted-foreground cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                Concordo com os{' '}
                <a className="text-primary hover:underline cursor-pointer">Termos de Uso</a>
                {' '}e a{' '}
                <a className="text-primary hover:underline cursor-pointer">Política de Privacidade</a>.
              </span>
            </label>

            <Link
              href="/gateway"
              className="mt-2 w-full flex items-center justify-center h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors"
            >
              Criar conta
            </Link>
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
