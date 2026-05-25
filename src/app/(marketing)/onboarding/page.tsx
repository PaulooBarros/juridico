'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Scale, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Escritório' },
  { id: 2, label: 'Identidade' },
  { id: 3, label: 'Advogado' },
  { id: 4, label: 'Equipe' },
  { id: 5, label: 'Plano' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b flex items-center px-6 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Scale size={15} className="text-white" />
          </div>
          <span className="text-sm font-bold">Vetor Jurídico</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors',
                    step > s.id
                      ? 'bg-primary text-primary-foreground'
                      : step === s.id
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step > s.id ? <Check size={12} /> : s.id}
                </div>
                <span className={cn('text-xs hidden sm:block', step === s.id ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {step === 1 && <StepEscritorio />}
          {step === 2 && <StepIdentidade />}
          {step === 3 && <StepAdvogado />}
          {step === 4 && <StepEquipe />}
          {step === 5 && <StepPlano />}

          {step < 5 && (
            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" size="sm" disabled={step === 1} onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={14} className="mr-1" /> Voltar
              </Button>
              <Button size="sm" onClick={() => setStep(s => s + 1)}>
                Continuar <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          )}
          {step === 5 && (
            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={14} className="mr-1" /> Voltar
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard">Finalizar configuração <ArrowRight size={14} className="ml-1" /></Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StepEscritorio() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Dados do escritório</h2>
        <p className="text-sm text-muted-foreground mt-1">Informações básicas do seu escritório de advocacia.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nome do escritório</Label>
          <Input placeholder="Ex: Mendes & Ferreira Advocacia" defaultValue="Mendes & Ferreira Advocacia" />
        </div>
        <div className="space-y-1.5">
          <Label>CNPJ (opcional)</Label>
          <Input placeholder="00.000.000/0001-00" />
        </div>
        <div className="space-y-1.5">
          <Label>Telefone</Label>
          <Input placeholder="(11) 3456-7890" />
        </div>
        <div className="space-y-1.5">
          <Label>Endereço</Label>
          <Input placeholder="Av. Paulista, 1200, conj. 101 — São Paulo, SP" />
        </div>
      </div>
    </div>
  )
}

function StepIdentidade() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Identidade visual</h2>
        <p className="text-sm text-muted-foreground mt-1">Logo e slogan do seu escritório.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Logo do escritório</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg border-2 border-dashed bg-muted/50 flex items-center justify-center">
              <Scale size={24} className="text-muted-foreground" />
            </div>
            <div>
              <Button variant="outline" size="sm">Fazer upload</Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 2MB</p>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Slogan (opcional)</Label>
          <Input placeholder="Ex: Estratégia. Precisão. Resultado." defaultValue="Estratégia. Precisão. Resultado." />
        </div>
        <div className="space-y-1.5">
          <Label>URL do escritório (slug)</Label>
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground bg-muted border border-r-0 rounded-l-md px-3 h-9 flex items-center">vetor.app/</span>
            <Input className="rounded-l-none" placeholder="mendes-ferreira" defaultValue="mendes-ferreira" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepAdvogado() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Seu perfil de advogado</h2>
        <p className="text-sm text-muted-foreground mt-1">Informações que aparecem nos documentos e perfil público.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Número OAB</Label>
          <Input placeholder="OAB/SP 000.000" defaultValue="OAB/SP 234.567" />
        </div>
        <div className="space-y-1.5">
          <Label>Áreas de atuação</Label>
          <div className="flex flex-wrap gap-2">
            {['Cível', 'Empresarial', 'Tributário', 'Trabalhista', 'Família', 'Criminal'].map((area) => (
              <button
                key={area}
                className="px-3 py-1.5 text-xs rounded-full border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Bio profissional</Label>
          <Textarea
            placeholder="Descreva sua experiência e especialidades..."
            className="h-24"
            defaultValue="Advogado com 12 anos de experiência nas áreas cível, empresarial e tributário."
          />
        </div>
      </div>
    </div>
  )
}

function StepEquipe() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Convidar equipe</h2>
        <p className="text-sm text-muted-foreground mt-1">Adicione membros ao escritório. Pode pular e fazer depois.</p>
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Input placeholder="email@escritorio.com.br" className="flex-1" />
            <select className="h-9 rounded-md border border-input bg-transparent px-3 text-xs text-muted-foreground">
              <option>Advogado</option>
              <option>Assistente</option>
              <option>Admin</option>
            </select>
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full">+ Adicionar outro</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Os convites serão enviados por e-mail. Membros pagam conforme o plano escolhido.
      </p>
    </div>
  )
}

function StepPlano() {
  const [selected, setSelected] = useState<'starter' | 'pro' | 'enterprise'>('pro')
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Escolha seu plano</h2>
        <p className="text-sm text-muted-foreground mt-1">Cancele ou mude quando quiser. 14 dias grátis.</p>
      </div>
      <div className="space-y-3">
        {[
          { id: 'starter', name: 'Starter', price: 'R$ 89/mês', desc: 'Até 2 advogados, 50 casos, 5GB de documentos.', highlight: false },
          { id: 'pro', name: 'Pro', price: 'R$ 189/mês', desc: 'Até 8 advogados, casos ilimitados, 50GB, relatórios.', highlight: true },
          { id: 'enterprise', name: 'Enterprise', price: 'Sob consulta', desc: 'Equipe ilimitada, SLA, integração, suporte dedicado.', highlight: false },
        ].map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelected(plan.id as any)}
            className={cn(
              'w-full text-left p-4 rounded-lg border transition-all',
              selected === plan.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{plan.name}</p>
                  {plan.highlight && <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-medium">Recomendado</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
              </div>
              <p className="text-sm font-bold shrink-0 ml-4">{plan.price}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
