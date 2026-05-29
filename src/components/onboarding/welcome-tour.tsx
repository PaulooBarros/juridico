'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase, CalendarDays, FileText, Users, UserCircle, X, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    icon:  Briefcase,
    title: 'Casos',
    desc:  'Todos os processos do escritório em um lugar. Clique em qualquer caso para ver prazos, documentos, tarefas e histórico.',
    href:  '/casos',
  },
  {
    icon:  CalendarDays,
    title: 'Calendário e prazos',
    desc:  'Prazos e audiências aparecem automaticamente no calendário. Você também recebe notificações quando uma data se aproxima.',
    href:  '/calendario',
  },
  {
    icon:  FileText,
    title: 'Documentos',
    desc:  'Envie PDFs diretamente nos casos e clientes. Tudo organizado por tipo, com visualização inline sem precisar baixar.',
    href:  '/documentos',
  },
  {
    icon:  Users,
    title: 'Equipe',
    desc:  'Veja os membros do escritório, seus papéis e como entrar em contato. O gestor pode convidar novos membros por aqui.',
    href:  '/equipe',
  },
  {
    icon:  UserCircle,
    title: 'Seu perfil',
    desc:  'Adicione sua foto, número OAB e áreas de especialidade. Isso aparece para toda a equipe e nos documentos.',
    href:  '/perfil',
  },
]

interface WelcomeTourProps {
  nomeEscritorio: string
  role:           string
  onClose:        () => void
}

const ROLE_LABEL: Record<string, string> = {
  owner:     'Titular',
  admin:     'Administrador',
  lawyer:    'Advogado',
  assistant: 'Assistente',
}

export function WelcomeTour({ nomeEscritorio, role, onClose }: WelcomeTourProps) {
  const router  = useRouter()
  const [step,  setStep]  = useState(-1) // -1 = tela inicial

  function handleIr(href: string) {
    onClose()
    router.push(href)
  }

  function handleFinalizar() {
    onClose()
    router.push('/perfil')
  }

  // Tela inicial
  if (step === -1) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-bold text-2xl mx-auto mb-5">
            L
          </div>
          <h2 className="text-xl font-bold mb-1">Bem-vindo à Leea!</h2>
          <p className="text-sm text-muted-foreground mb-1">
            Você entrou em <strong className="text-foreground">{nomeEscritorio}</strong>
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Como <span className="text-foreground font-medium">{ROLE_LABEL[role] ?? role}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
            Em menos de 2 minutos você vai conhecer as principais ferramentas do sistema.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setStep(0)}
              className="w-full h-9 bg-primary text-primary-foreground rounded-[6px] text-[13px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Ver o tour <ArrowRight size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-full h-9 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular e explorar por conta própria
            </button>
          </div>
        </div>
      </Overlay>
    )
  }

  const current   = STEPS[step]
  const isLast    = step === STEPS.length - 1
  const Icon      = current.icon

  return (
    <Overlay onClose={onClose}>
      {/* Progresso */}
      <div className="flex items-center gap-1.5 mb-6 justify-center">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 rounded-full transition-all',
              i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-border'
            )}
          />
        ))}
      </div>

      {/* Conteúdo */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon size={22} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-2">{current.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          {current.desc}
        </p>
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-2">
        {isLast ? (
          <>
            <button
              onClick={handleFinalizar}
              className="w-full h-9 bg-primary text-primary-foreground rounded-[6px] text-[13px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} /> Completar meu perfil
            </button>
            <button
              onClick={onClose}
              className="w-full h-9 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Ir para o dashboard
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep(s => s + 1)}
              className="w-full h-9 bg-primary text-primary-foreground rounded-[6px] text-[13px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Próximo <ArrowRight size={14} />
            </button>
            <button
              onClick={() => handleIr(current.href)}
              className="w-full h-9 border border-border rounded-[6px] text-[13px] text-muted-foreground hover:bg-accent transition-colors"
            >
              Ir para {current.title} agora
            </button>
          </>
        )}
      </div>

      {/* Navegação anterior */}
      {step > 0 && (
        <button
          onClick={() => setStep(s => s - 1)}
          className="mt-3 w-full text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          ← Voltar
        </button>
      )}
    </Overlay>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  )
}
