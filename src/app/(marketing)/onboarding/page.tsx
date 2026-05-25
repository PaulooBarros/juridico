'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Check, Upload, X, Plus, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Escritório' },
  { id: 2, label: 'Identidade' },
  { id: 3, label: 'Advogado' },
  { id: 4, label: 'Equipe' },
  { id: 5, label: 'Plano' },
]

const STEP_TITLES = ['', 'Dados do escritório', 'Identidade visual', 'Perfil profissional', 'Convidar equipe', 'Escolha seu plano']
const STEP_SUBS = [
  '',
  'Informações cadastrais. Aparecem em documentos gerados pelo sistema.',
  'Como o escritório se apresenta para clientes e equipe.',
  'Esses dados aparecem em petições e na comunicação com clientes.',
  'Convide colegas para colaborar. Você pode pular e fazer depois.',
  'Comece com 14 dias grátis em qualquer plano.',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-10 border-b border-border h-[49px] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">
            V
          </div>
          <span className="font-serif font-medium text-[15px] tracking-[-0.01em]">
            Vetor <em className="text-primary not-italic">Jurídico</em>
          </span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                'w-[22px] h-[22px] rounded-full border flex items-center justify-center font-mono text-[11px] transition-colors',
                step > s.id  ? 'bg-foreground text-background border-foreground' :
                step === s.id ? 'bg-primary text-primary-foreground border-primary' :
                                'border-border text-muted-foreground'
              )}>
                {step > s.id ? <Check size={11} /> : s.id}
              </div>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        <Link href="/dashboard" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
          Pular configuração →
        </Link>
      </header>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-[640px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-2">
            Etapa {step} de {STEPS.length}
          </p>
          <h1 className="font-serif text-[32px] font-medium tracking-[-0.02em] mb-1.5">{STEP_TITLES[step]}</h1>
          <p className="text-[14px] text-muted-foreground mb-8 max-w-[60ch]">{STEP_SUBS[step]}</p>

          {step === 1 && <StepEscritorio />}
          {step === 2 && <StepIdentidade />}
          {step === 3 && <StepAdvogado />}
          {step === 4 && <StepEquipe />}
          {step === 5 && <StepPlano />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            {step === 1 ? (
              <Link
                href="/gateway"
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={13} /> Voltar
              </Link>
            ) : (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={13} /> Voltar
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors"
              >
                Continuar <ArrowRight size={13} />
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors"
              >
                Concluir e entrar <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-10 py-4 flex justify-between text-[11px] text-muted-foreground">
        <span className="font-serif italic text-[12px]">
          &ldquo;Quando tudo está sob controle, a advocacia fica inevitável.&rdquo;
        </span>
        <span className="font-mono">Vetor Jurídico v2026.05</span>
      </footer>
    </div>
  )
}

// ── Step 1: Dados do escritório ───────────────────────────────────────────────
function StepEscritorio() {
  return (
    <div className="grid gap-3.5">
      <Field label="Nome do escritório">
        <Input defaultValue="Costa, Furtado & Werneck Advogados" className="h-9 text-[13px]" />
      </Field>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="CNPJ">
          <Input defaultValue="42.881.401/0001-22" className="h-9 text-[13px]" />
        </Field>
        <Field label="Inscrição OAB (sociedade)">
          <Input defaultValue="OAB/SP 12.481" className="h-9 text-[13px]" />
        </Field>
      </div>
      <Field label="Especialidade principal">
        <select className="w-full h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] text-foreground focus:outline-none focus:border-primary">
          <option>Banca generalista</option>
          <option>Contencioso cível</option>
          <option>Trabalhista</option>
          <option>Tributário</option>
          <option>Empresarial / M&A</option>
          <option>Família e sucessões</option>
          <option>Penal</option>
        </select>
      </Field>
      <Field label="Cidade / UF">
        <Input defaultValue="São Paulo / SP" className="h-9 text-[13px]" />
      </Field>
    </div>
  )
}

// ── Step 2: Identidade visual ─────────────────────────────────────────────────
function StepIdentidade() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-5">
        {/* Logo preview + upload zone */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-[120px] h-[120px] rounded-[8px] border border-dashed flex flex-col items-center justify-center gap-2 shrink-0 transition-colors relative overflow-hidden',
            logoPreview ? 'border-border' : 'border-border hover:border-muted-foreground'
          )}
        >
          {logoPreview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload size={18} className="text-white" />
              </div>
            </>
          ) : (
            <>
              <Upload size={18} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground text-center leading-tight">
                Subir<br />logo
              </span>
            </>
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        <div className="flex-1">
          <Field label="Logo do escritório">
            <p className="text-[12px] text-muted-foreground mb-2">PNG ou SVG, fundo transparente. Aparece em petições e e-mails.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 border border-border rounded-[5px] text-[12px] font-medium bg-card hover:bg-accent transition-colors"
              >
                Escolher arquivo
              </button>
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => { setLogoPreview(null); if (inputRef.current) inputRef.current.value = '' }}
                  className="px-3 py-1.5 border border-border rounded-[5px] text-[12px] text-muted-foreground hover:bg-accent transition-colors flex items-center gap-1"
                >
                  <X size={11} /> Remover
                </button>
              )}
            </div>
          </Field>
        </div>
      </div>

      <Field label="Slogan">
        <Input
          defaultValue="Estratégia jurídica para empresas que decidem."
          placeholder="Uma frase curta que captura o escritório"
          className="h-9 text-[13px]"
        />
      </Field>

      <Field label="Descrição pública">
        <Textarea
          rows={3}
          defaultValue="Banca full-service com 18 anos de atuação em contencioso empresarial, trabalhista e tributário. Sede em São Paulo, operação nacional."
          className="text-[13px] resize-none"
        />
      </Field>
    </div>
  )
}

// ── Step 3: Perfil profissional ───────────────────────────────────────────────
const TODAS_AREAS = [
  'Contencioso Cível', 'Empresarial / M&A', 'Tributário', 'Trabalhista',
  'Família e Sucessões', 'Penal', 'Imobiliário', 'Consumidor', 'Previdenciário', 'Ambiental',
]

function StepAdvogado() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [areas, setAreas] = useState<string[]>(['Contencioso Cível', 'Trabalhista', 'Tributário'])
  const photoRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
  }

  const toggleArea = (area: string) => {
    setAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  return (
    <div className="grid gap-5">
      {/* Foto de perfil */}
      <div className="flex items-start gap-5">
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          className="w-16 h-16 rounded-full border border-dashed border-border flex items-center justify-center shrink-0 overflow-hidden hover:border-muted-foreground transition-colors relative"
        >
          {photoPreview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload size={14} className="text-white" />
              </div>
            </>
          ) : (
            <User size={20} className="text-muted-foreground" />
          )}
        </button>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

        <Field label="Foto de perfil">
          <p className="text-[12px] text-muted-foreground mb-2">Aparece em comunicados internos e na assinatura de documentos.</p>
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="px-3 py-1.5 border border-border rounded-[5px] text-[12px] font-medium bg-card hover:bg-accent transition-colors"
          >
            Escolher foto
          </button>
        </Field>
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-3.5">
        <Field label="Nome profissional">
          <Input defaultValue="Marina Costa" className="h-9 text-[13px]" />
        </Field>
        <Field label="OAB">
          <Input defaultValue="OAB/SP 184.221" className="h-9 text-[13px]" />
        </Field>
      </div>

      {/* Áreas de atuação — multi-select */}
      <div>
        <p className="text-[12px] font-medium text-muted-foreground mb-2">
          Áreas de atuação
          <span className="ml-1.5 text-muted-foreground/60">({areas.length} selecionada{areas.length !== 1 ? 's' : ''})</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TODAS_AREAS.map(area => {
            const selected = areas.includes(area)
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-[12px] font-medium border transition-colors',
                  selected
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-card text-muted-foreground border-border hover:border-muted-foreground hover:text-foreground'
                )}
              >
                {selected && <Check size={10} />}
                {area}
              </button>
            )
          })}
        </div>
        {areas.length === 0 && (
          <p className="text-[11px] text-muted-foreground mt-1.5">Selecione ao menos uma área.</p>
        )}
      </div>

      <Field label="Mini-bio">
        <Textarea
          rows={3}
          defaultValue="Sócia titular. 16 anos de atuação em contencioso cível e empresarial. Pós-graduação em Direito Processual Civil pela PUC-SP."
          className="text-[13px] resize-none"
        />
      </Field>
    </div>
  )
}

// ── Step 4: Convidar equipe ───────────────────────────────────────────────────
function StepEquipe() {
  const [invites, setInvites] = useState([
    { email: 'andre@vetorjuridico.com.br', role: 'admin' },
    { email: 'julia@vetorjuridico.com.br', role: 'lawyer' },
    { email: '', role: 'lawyer' },
  ])

  const add = () => setInvites(prev => [...prev, { email: '', role: 'lawyer' }])
  const remove = (i: number) => setInvites(prev => prev.filter((_, j) => j !== i))
  const update = (i: number, field: 'email' | 'role', val: string) =>
    setInvites(prev => prev.map((inv, j) => j === i ? { ...inv, [field]: val } : inv))

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        {invites.map((inv, i) => (
          <div key={i} className="grid grid-cols-[1fr_180px_32px] gap-2">
            <Input
              placeholder="email@exemplo.com"
              value={inv.email}
              onChange={e => update(i, 'email', e.target.value)}
              className="h-9 text-[13px]"
            />
            <select
              value={inv.role}
              onChange={e => update(i, 'role', e.target.value)}
              className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] text-foreground focus:outline-none focus:border-primary"
            >
              <option value="admin">Sócio / Admin</option>
              <option value="lawyer">Advogado</option>
              <option value="assistant">Assistente</option>
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-8 h-9 flex items-center justify-center rounded-[5px] border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        <Plus size={12} /> Adicionar mais um
      </button>

      <div className="flex items-start gap-2.5 p-3 bg-muted rounded-[5px] text-[12px] text-muted-foreground">
        <span className="mt-0.5 text-primary font-medium shrink-0">i</span>
        <span>
          Cada convidado recebe um e-mail com instruções de cadastro. Permissões podem ser ajustadas a qualquer momento em <strong className="text-foreground">Equipe</strong>.
        </span>
      </div>
    </div>
  )
}

// ── Step 5: Plano ─────────────────────────────────────────────────────────────
const PLANS = [
  { id: 'starter',    name: 'Starter',    price: 'R$ 89', period: '/mês',      desc: 'Até 2 advogados · 50 casos · 5 GB de documentos', featured: false },
  { id: 'pro',        name: 'Pro',        price: 'R$ 189', period: '/mês',     desc: 'Até 8 advogados · Casos ilimitados · 50 GB · Relatórios', featured: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Sob consulta', period: '',   desc: 'Equipe ilimitada · SLA · Integrações · Suporte dedicado', featured: false },
]

function StepPlano() {
  const [selected, setSelected] = useState<string>('pro')

  return (
    <div className="grid gap-3">
      {PLANS.map(plan => (
        <button
          key={plan.id}
          type="button"
          onClick={() => setSelected(plan.id)}
          className={cn(
            'w-full text-left p-5 rounded-[8px] border transition-all relative',
            selected === plan.id
              ? 'border-foreground bg-card'
              : 'border-border bg-card hover:border-muted-foreground/50'
          )}
        >
          {plan.featured && (
            <span className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.06em] bg-foreground text-background px-2 py-0.5 rounded-[3px]">
              Recomendado
            </span>
          )}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  selected === plan.id ? 'border-foreground' : 'border-border'
                )}>
                  {selected === plan.id && <div className="w-2 h-2 rounded-full bg-foreground" />}
                </div>
                <span className="text-[15px] font-medium">{plan.name}</span>
              </div>
              <p className="text-[13px] text-muted-foreground ml-6">{plan.desc}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-serif text-[22px] font-medium">{plan.price}</span>
              {plan.period && <span className="text-[13px] text-muted-foreground ml-1">{plan.period}</span>}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Shared Field component ────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
