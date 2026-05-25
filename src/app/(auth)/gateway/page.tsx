import Link from 'next/link'
import { Building2, Mail, ArrowRight } from 'lucide-react'

export default function GatewayPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-8 py-16">
      <div className="w-full max-w-[760px]">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground mb-3">Bem-vinda, Marina</p>
          <h1 className="font-serif text-[36px] font-medium tracking-[-0.02em] leading-[1.15]">Como você quer começar?</h1>
          <p className="text-[14px] text-muted-foreground mt-3 max-w-[52ch] mx-auto">
            Você ainda não está vinculada a nenhum escritório no Vetor Jurídico.
          </p>
        </div>

        {/* Options */}
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
                Insira o código que recebeu por e-mail para entrar em um escritório existente.
              </p>
            </div>
            <div className="flex gap-2 mt-auto">
              <input
                className="flex-1 h-9 px-3 text-[13px] bg-background border border-border rounded-[5px] focus:outline-none focus:border-primary"
                placeholder="Código do convite"
              />
              <button className="px-3 h-9 border border-border bg-card rounded-[5px] text-[13px] font-medium hover:bg-accent transition-colors">
                Validar
              </button>
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
