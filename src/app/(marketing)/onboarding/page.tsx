'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check, Upload, X, Plus, User, Copy, CheckCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { criarEscritorioCompleto, type ConviteCriado } from '@/lib/supabase/escritorio'

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

type Dados = {
  nome: string; cnpj: string; oab_sociedade: string; especialidade: string; cidade_uf: string
  logoFile: File | null; logoPreview: string | null; slug: string; slogan: string; descricao: string
  fotoFile: File | null; fotoPreview: string | null; nomeAdvogado: string; oabAdvogado: string; areas: string[]; bio: string
  convites: { email: string; role: string }[]
  plano: string
}

const DADOS_INIT: Dados = {
  nome: '', cnpj: '', oab_sociedade: '', especialidade: '', cidade_uf: '',
  logoFile: null, logoPreview: null, slug: '', slogan: '', descricao: '',
  fotoFile: null, fotoPreview: null, nomeAdvogado: '', oabAdvogado: '', areas: [], bio: '',
  convites: [{ email: '', role: 'lawyer' }, { email: '', role: 'lawyer' }],
  plano: 'pro',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [dados, setDados] = useState<Dados>(DADOS_INIT)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [convitesCriados, setConvitesCriados] = useState<ConviteCriado[]>([])
  const [concluido, setConcluido] = useState(false)

  const set = (patch: Partial<Dados>) => setDados(prev => ({ ...prev, ...patch }))

  async function handleFinalizar() {
    setErro('')
    setLoading(true)
    try {
      const { convitesCriados: criados } = await criarEscritorioCompleto(dados)
      setConvitesCriados(criados)
      setConcluido(true)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao criar escritório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (concluido) {
    return <TelaConcluido convites={convitesCriados} onEntrar={() => router.push('/dashboard')} />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-10 border-b border-border h-[49px] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">V</div>
          <span className="font-serif font-medium text-[15px] tracking-[-0.01em]">
            Vetor <em className="text-primary not-italic">Jurídico</em>
          </span>
        </div>
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

      <div className="flex-1 flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-[640px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-2">Etapa {step} de {STEPS.length}</p>
          <h1 className="font-serif text-[32px] font-medium tracking-[-0.02em] mb-1.5">{STEP_TITLES[step]}</h1>
          <p className="text-[14px] text-muted-foreground mb-8 max-w-[60ch]">{STEP_SUBS[step]}</p>

          {step === 1 && <StepEscritorio dados={dados} set={set} />}
          {step === 2 && <StepIdentidade dados={dados} set={set} />}
          {step === 3 && <StepAdvogado   dados={dados} set={set} />}
          {step === 4 && <StepEquipe     dados={dados} set={set} />}
          {step === 5 && <StepPlano      dados={dados} set={set} />}

          {erro && <p className="mt-4 text-[12px] text-destructive">{erro}</p>}

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            {step === 1 ? (
              <Link href="/gateway" className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={13} /> Voltar
              </Link>
            ) : (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={13} /> Voltar
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !dados.nome.trim()}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleFinalizar}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando escritório…' : 'Finalizar configuração'} <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-border px-10 py-4 flex justify-between text-[11px] text-muted-foreground">
        <span className="font-serif italic text-[12px]">&ldquo;Quando tudo está sob controle, a advocacia fica inevitável.&rdquo;</span>
        <span className="font-mono">Leea v2026.05</span>
      </footer>
    </div>
  )
}

// ── Step 1 ────────────────────────────────────────────────────────────────────
function StepEscritorio({ dados, set }: { dados: Dados; set: (p: Partial<Dados>) => void }) {
  return (
    <div className="grid gap-3.5">
      <Field label="Nome do escritório *">
        <Input value={dados.nome} onChange={e => set({ nome: e.target.value })} placeholder="Ex: Costa, Furtado & Werneck Advogados" className="h-9 text-[13px]" />
      </Field>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="CNPJ">
          <Input value={dados.cnpj} onChange={e => set({ cnpj: e.target.value })} placeholder="00.000.000/0001-00" className="h-9 text-[13px]" />
        </Field>
        <Field label="OAB (sociedade)">
          <Input value={dados.oab_sociedade} onChange={e => set({ oab_sociedade: e.target.value })} placeholder="OAB/SP 12.481" className="h-9 text-[13px]" />
        </Field>
      </div>
      <Field label="Especialidade principal">
        <select value={dados.especialidade} onChange={e => set({ especialidade: e.target.value })} className="w-full h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] text-foreground focus:outline-none focus:border-primary">
          <option value="">Selecione…</option>
          {['Banca generalista','Contencioso cível','Trabalhista','Tributário','Empresarial / M&A','Família e sucessões','Penal'].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Cidade / UF">
        <Input value={dados.cidade_uf} onChange={e => set({ cidade_uf: e.target.value })} placeholder="São Paulo / SP" className="h-9 text-[13px]" />
      </Field>
    </div>
  )
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
function StepIdentidade({ dados, set }: { dados: Dados; set: (p: Partial<Dados>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    set({ logoFile: file, logoPreview: URL.createObjectURL(file) })
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-5">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-[120px] h-[120px] rounded-[8px] border border-dashed border-border flex flex-col items-center justify-center gap-2 shrink-0 overflow-hidden relative hover:border-muted-foreground transition-colors">
          {dados.logoPreview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dados.logoPreview} alt="Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload size={18} className="text-white" />
              </div>
            </>
          ) : (
            <><Upload size={18} className="text-muted-foreground" /><span className="text-[11px] text-muted-foreground text-center leading-tight">Subir<br />logo</span></>
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <div className="flex-1">
          <Field label="Logo do escritório">
            <p className="text-[12px] text-muted-foreground mb-2">PNG ou SVG, fundo transparente.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-1.5 border border-border rounded-[5px] text-[12px] font-medium bg-card hover:bg-accent transition-colors">Escolher arquivo</button>
              {dados.logoPreview && (
                <button type="button" onClick={() => { set({ logoFile: null, logoPreview: null }); if (inputRef.current) inputRef.current.value = '' }}
                  className="px-3 py-1.5 border border-border rounded-[5px] text-[12px] text-muted-foreground hover:bg-accent transition-colors flex items-center gap-1">
                  <X size={11} /> Remover
                </button>
              )}
            </div>
          </Field>
        </div>
      </div>
      <Field label="Slogan">
        <Input value={dados.slogan} onChange={e => set({ slogan: e.target.value })} placeholder="Uma frase que captura o escritório" className="h-9 text-[13px]" />
      </Field>
      <Field label="URL do escritório">
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground bg-muted border border-r-0 rounded-l-[5px] px-3 h-9 flex items-center">vetor.app/</span>
          <Input value={dados.slug} onChange={e => set({ slug: e.target.value })} placeholder="nome-do-escritorio" className="rounded-l-none h-9 text-[13px]" />
        </div>
      </Field>
      <Field label="Descrição pública">
        <Textarea value={dados.descricao} onChange={e => set({ descricao: e.target.value })} rows={3} placeholder="Breve descrição do escritório…" className="text-[13px] resize-none" />
      </Field>
    </div>
  )
}

// ── Step 3 ────────────────────────────────────────────────────────────────────
const TODAS_AREAS = ['Contencioso Cível','Empresarial / M&A','Tributário','Trabalhista','Família e Sucessões','Penal','Imobiliário','Consumidor','Previdenciário','Ambiental']

function StepAdvogado({ dados, set }: { dados: Dados; set: (p: Partial<Dados>) => void }) {
  const photoRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    set({ fotoFile: file, fotoPreview: URL.createObjectURL(file) })
  }

  const toggleArea = (area: string) =>
    set({ areas: dados.areas.includes(area) ? dados.areas.filter(a => a !== area) : [...dados.areas, area] })

  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-5">
        <button type="button" onClick={() => photoRef.current?.click()}
          className="w-16 h-16 rounded-full border border-dashed border-border flex items-center justify-center shrink-0 overflow-hidden hover:border-muted-foreground transition-colors relative">
          {dados.fotoPreview
            ? <><img src={dados.fotoPreview} alt="Foto" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"><Upload size={14} className="text-white" /></div></>
            : <User size={20} className="text-muted-foreground" />}
        </button>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <Field label="Foto de perfil">
          <p className="text-[12px] text-muted-foreground mb-2">Aparece em documentos e comunicações.</p>
          <button type="button" onClick={() => photoRef.current?.click()} className="px-3 py-1.5 border border-border rounded-[5px] text-[12px] font-medium bg-card hover:bg-accent transition-colors">Escolher foto</button>
        </Field>
      </div>
      <div className="grid grid-cols-[1.5fr_1fr] gap-3.5">
        <Field label="Nome profissional">
          <Input value={dados.nomeAdvogado} onChange={e => set({ nomeAdvogado: e.target.value })} className="h-9 text-[13px]" />
        </Field>
        <Field label="OAB">
          <Input value={dados.oabAdvogado} onChange={e => set({ oabAdvogado: e.target.value })} placeholder="OAB/SP 000.000" className="h-9 text-[13px]" />
        </Field>
      </div>
      <div>
        <p className="text-[12px] font-medium text-muted-foreground mb-2">
          Áreas de atuação <span className="text-muted-foreground/60">({dados.areas.length} selecionada{dados.areas.length !== 1 ? 's' : ''})</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TODAS_AREAS.map(area => {
            const sel = dados.areas.includes(area)
            return (
              <button key={area} type="button" onClick={() => toggleArea(area)}
                className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-[12px] font-medium border transition-colors',
                  sel ? 'bg-primary/10 text-primary border-primary/30' : 'bg-card text-muted-foreground border-border hover:border-muted-foreground hover:text-foreground')}>
                {sel && <Check size={10} />}{area}
              </button>
            )
          })}
        </div>
      </div>
      <Field label="Mini-bio">
        <Textarea value={dados.bio} onChange={e => set({ bio: e.target.value })} rows={3} placeholder="Sua experiência e especialidades…" className="text-[13px] resize-none" />
      </Field>
    </div>
  )
}

// ── Step 4 ────────────────────────────────────────────────────────────────────
function StepEquipe({ dados, set }: { dados: Dados; set: (p: Partial<Dados>) => void }) {
  const updateConvite = (i: number, field: 'email' | 'role', val: string) =>
    set({ convites: dados.convites.map((c, j) => j === i ? { ...c, [field]: val } : c) })
  const addConvite = () => set({ convites: [...dados.convites, { email: '', role: 'lawyer' }] })
  const removeConvite = (i: number) => set({ convites: dados.convites.filter((_, j) => j !== i) })

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        {dados.convites.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_180px_32px] gap-2">
            <Input type="email" placeholder="email@escritorio.com.br" value={c.email} onChange={e => updateConvite(i, 'email', e.target.value)} className="h-9 text-[13px]" />
            <select value={c.role} onChange={e => updateConvite(i, 'role', e.target.value)} className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] text-foreground focus:outline-none focus:border-primary">
              <option value="admin">Sócio / Admin</option>
              <option value="lawyer">Advogado</option>
              <option value="assistant">Assistente</option>
            </select>
            <button type="button" onClick={() => removeConvite(i)} className="w-8 h-9 flex items-center justify-center rounded-[5px] border border-border text-muted-foreground hover:bg-accent transition-colors">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addConvite} className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors self-start">
        <Plus size={12} /> Adicionar mais um
      </button>
      <div className="flex items-start gap-2.5 p-3 bg-muted rounded-[5px] text-[12px] text-muted-foreground">
        <span className="mt-0.5 text-primary font-medium shrink-0">i</span>
        <span>Os convites são gerados com um link único. Você poderá compartilhá-los na próxima tela.</span>
      </div>
    </div>
  )
}

// ── Step 5 ────────────────────────────────────────────────────────────────────
const PLANS = [
  { id: 'starter',    name: 'Starter',    price: 'R$ 89',      period: '/mês', desc: 'Até 2 advogados · 50 casos · 5 GB' },
  { id: 'pro',        name: 'Pro',        price: 'R$ 189',     period: '/mês', desc: 'Até 8 advogados · Casos ilimitados · 50 GB', featured: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Sob consulta', period: '',   desc: 'Equipe ilimitada · SLA · Suporte dedicado' },
]

function StepPlano({ dados, set }: { dados: Dados; set: (p: Partial<Dados>) => void }) {
  return (
    <div className="grid gap-3">
      {PLANS.map(plan => (
        <button key={plan.id} type="button" onClick={() => set({ plano: plan.id })}
          className={cn('w-full text-left p-5 rounded-[8px] border transition-all relative',
            dados.plano === plan.id ? 'border-foreground bg-card' : 'border-border bg-card hover:border-muted-foreground/50')}>
          {plan.featured && (
            <span className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.06em] bg-foreground text-background px-2 py-0.5 rounded-[3px]">Recomendado</span>
          )}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0', dados.plano === plan.id ? 'border-foreground' : 'border-border')}>
                  {dados.plano === plan.id && <div className="w-2 h-2 rounded-full bg-foreground" />}
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

// ── Tela de conclusão ─────────────────────────────────────────────────────────
function TelaConcluido({ convites, onEntrar }: { convites: ConviteCriado[]; onEntrar: () => void }) {
  const [copiados, setCopiados] = useState<Record<string, boolean>>({})

  const copiar = (token: string) => {
    const link = `${window.location.origin}/convite?token=${token}`
    navigator.clipboard.writeText(link)
    setCopiados(prev => ({ ...prev, [token]: true }))
    setTimeout(() => setCopiados(prev => ({ ...prev, [token]: false })), 2000)
  }

  const roleLabel: Record<string, string> = { admin: 'Sócio / Admin', lawyer: 'Advogado', assistant: 'Assistente' }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-10 py-16">
      <div className="w-full max-w-[520px] text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Check size={22} className="text-primary" />
        </div>
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.02em] mb-2">Escritório criado!</h1>
        <p className="text-[14px] text-muted-foreground mb-8">
          Tudo pronto. Compartilhe os links abaixo com sua equipe para que eles entrem no escritório.
        </p>

        {convites.length > 0 && (
          <div className="border border-border rounded-[8px] overflow-hidden mb-8 text-left">
            <div className="px-4 py-2.5 border-b border-border bg-muted">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Links de convite</p>
            </div>
            {convites.map(c => (
              <div key={c.token} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate">{c.email}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{roleLabel[c.role] ?? c.role}</p>
                </div>
                <button type="button" onClick={() => copiar(c.token)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-[5px] text-[12px] text-muted-foreground hover:bg-accent transition-colors shrink-0">
                  {copiados[c.token] ? <><CheckCheck size={12} className="text-primary" /> Copiado</> : <><Copy size={12} /> Copiar link</>}
                </button>
              </div>
            ))}
          </div>
        )}

        {convites.length === 0 && (
          <p className="text-[13px] text-muted-foreground mb-8">
            Nenhum convite foi adicionado. Você pode convidar sua equipe depois em <strong className="text-foreground">Equipe → Convidar</strong>.
          </p>
        )}

        <button onClick={onEntrar} className="w-full h-10 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors">
          Entrar no escritório →
        </button>
      </div>
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
