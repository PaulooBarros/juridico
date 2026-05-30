'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Briefcase, Plus, Loader2, Pencil, Trash2, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { EmptyState } from '@/features/shared/empty-state'
import { formatArea, formatPhase, formatDate, formatCurrency, cn } from '@/lib/utils'
import { listarClientes, type Cliente } from '@/lib/supabase/clientes'
import {
  listarCasos, criarCaso, atualizarCaso, deletarCaso,
  type Caso, type CasoInput, type CasoStatus, type CasoArea, type CasoFase, type TipoProcesso,
} from '@/lib/supabase/casos'
import { resolverTribunal, normalizarNumero } from '@/lib/datajud'

const AREAS: Array<{ value: CasoArea; label: string }> = [
  { value: 'civil',          label: 'Cível' },
  { value: 'trabalhista',    label: 'Trabalhista' },
  { value: 'tributario',     label: 'Tributário' },
  { value: 'empresarial',    label: 'Empresarial' },
  { value: 'familia',        label: 'Família' },
  { value: 'criminal',       label: 'Criminal' },
  { value: 'consumidor',     label: 'Consumidor' },
  { value: 'previdenciario', label: 'Previdenciário' },
]

const FASES: Array<{ value: CasoFase; label: string }> = [
  { value: 'conhecimento',  label: 'Conhecimento' },
  { value: 'recurso',       label: 'Recurso' },
  { value: 'execucao',      label: 'Execução' },
  { value: 'cumprimento',   label: 'Cumprimento' },
  { value: 'extrajudicial', label: 'Extrajudicial' },
  { value: 'consulta',      label: 'Consulta' },
]

const STATUSES: Array<{ value: CasoStatus | 'all'; label: string }> = [
  { value: 'all',       label: 'Todos' },
  { value: 'active',    label: 'Ativo' },
  { value: 'pending',   label: 'Pendente' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'closed',    label: 'Encerrado' },
]

export default function CasosPage() {
  const [casos, setCasos]           = useState<Caso[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [area, setArea]             = useState<CasoArea | 'all'>('all')
  const [status, setStatus]         = useState<CasoStatus | 'all'>('all')
  const [editando, setEditando]     = useState<Caso | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [excluindo, setExcluindo]   = useState<Caso | null>(null)

  async function carregar() {
    setLoading(true)
    try { setCasos(await listarCasos()) }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  async function handleExcluir(caso: Caso) {
    await deletarCaso(caso.id)
    setExcluindo(null)
    carregar()
  }

  const filtered = casos.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !search
      || c.titulo.toLowerCase().includes(q)
      || (c.cliente_nome ?? '').toLowerCase().includes(q)
      || (c.numero ?? '').includes(search)
    const matchArea   = area === 'all'   || c.area   === area
    const matchStatus = status === 'all' || c.status === status
    return matchSearch && matchArea && matchStatus
  })

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, número ou cliente…"
            className="pl-9 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={area} onValueChange={v => setArea(v as any)}>
          <SelectTrigger className="h-9 text-xs min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            {AREAS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 bg-muted/50 border rounded-md p-1">
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => setStatus(s.value as any)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${status === s.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditando(null); setModalAberto(true) }}
          className="flex items-center justify-center gap-1.5 px-3 h-9 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors shrink-0 w-full sm:w-auto"
        >
          <Plus size={14} /> Novo caso
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card overflow-x-auto">
        <div className="min-w-[680px]">
        <div className="grid grid-cols-[2fr_1.2fr_1fr_110px_100px_72px] gap-0 border-b bg-muted/30">
          {['Caso / Número', 'Cliente', 'Responsável', 'Área', 'Status', ''].map((h, i) => (
            <div key={i} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={search || area !== 'all' || status !== 'all' ? 'Nenhum caso encontrado' : 'Nenhum caso cadastrado'}
            description={search || area !== 'all' || status !== 'all' ? 'Tente ajustar os filtros.' : 'Clique em "Novo caso" para começar.'}
          />
        ) : (
          <div className="divide-y">
            {filtered.map(caso => (
              <div key={caso.id} className="grid grid-cols-[2fr_1.2fr_1fr_110px_100px_72px] gap-0 hover:bg-muted/30 transition-colors group">
                <Link href={`/casos/${caso.id}`} className="px-4 py-3">
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{caso.titulo}</p>
                  {caso.numero && <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{caso.numero}</p>}
                </Link>
                <Link href={`/casos/${caso.id}`} className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{caso.cliente_nome ?? '—'}</p>
                </Link>
                <Link href={`/casos/${caso.id}`} className="px-4 py-3 flex items-center">
                  {caso.responsavel_nome ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                        {caso.responsavel_nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{caso.responsavel_nome.split(' ')[0]}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </Link>
                <Link href={`/casos/${caso.id}`} className="px-4 py-3 flex items-center">
                  <Badge variant="muted" className="text-[10px]">{formatArea(caso.area)}</Badge>
                </Link>
                <Link href={`/casos/${caso.id}`} className="px-4 py-3 flex items-center">
                  <CaseStatusBadge status={caso.status} />
                </Link>
                <div className="px-2 py-3 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditando(caso); setModalAberto(true) }}
                    title="Editar"
                    className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setExcluindo(caso)}
                    title="Excluir"
                    className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>{/* min-w */}
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} caso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {modalAberto && (
        <CasoFormModal
          caso={editando}
          onClose={() => { setModalAberto(false); setEditando(null) }}
          onSalvo={() => { setModalAberto(false); setEditando(null); carregar() }}
        />
      )}

      {excluindo && (
        <ConfirmarExclusao
          titulo={excluindo.titulo}
          onCancelar={() => setExcluindo(null)}
          onConfirmar={() => handleExcluir(excluindo)}
        />
      )}
    </div>
  )
}

// ── Modal criar / editar ──────────────────────────────────────────────────────

function CasoFormModal({
  caso, onClose, onSalvo,
}: {
  caso: Caso | null
  onClose: () => void
  onSalvo: () => void
}) {
  const editMode = !!caso
  const [form, setForm] = useState<CasoInput>({
    cliente_id:     caso?.cliente_id     ?? '',
    responsavel_id: caso?.responsavel_id ?? '',
    numero:         caso?.numero         ?? '',
    titulo:         caso?.titulo         ?? '',
    area:           caso?.area           ?? 'civil',
    fase:           caso?.fase           ?? 'conhecimento',
    status:         caso?.status         ?? 'active',
    vara:           caso?.vara           ?? '',
    juiz:           caso?.juiz           ?? '',
    descricao:      caso?.descricao      ?? '',
    valor_causa:    caso?.valor_causa    ?? null,
    tipo_processo:  caso?.tipo_processo  ?? null,
    notes:          caso?.notes          ?? '',
  })
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [membros,  setMembros]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(false)
  const [erro,     setErro]     = useState('')

  const [datajudInfo, setDatajudInfo] = useState<DatajudAutofill | null>(null)
  const [buscandoDatajud, setBuscandoDatajud] = useState(false)

  const tribunalDoNumero = (() => {
    const digitos = (form.numero ?? '').replace(/\D/g, '')
    if (digitos.length !== 20) return null
    return resolverTribunal(normalizarNumero(form.numero ?? ''))?.toUpperCase() ?? null
  })()

  useEffect(() => {
    listarClientes().then(setClientes).catch(() => {})
    import('@/lib/supabase/equipe').then(m => m.listarMembros()).then(setMembros).catch(() => {})
  }, [])

  useEffect(() => {
    const digitos = (form.numero ?? '').replace(/\D/g, '')
    if (digitos.length !== 20) { setDatajudInfo(null); return }
    setBuscandoDatajud(true)
    setDatajudInfo(null)
    const numero = form.numero ?? ''
    const t = setTimeout(async () => {
      try {
        const res  = await fetch('/api/datajud', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numero }),
        })
        const json = await res.json()
        if (json.ok && json.processo) {
          setDatajudInfo(extrairAutofill(json.processo, numero))
        }
      } catch {
      } finally {
        setBuscandoDatajud(false)
      }
    }, 800)
    return () => clearTimeout(t)
  }, [form.numero])

  const set = (patch: Partial<CasoInput>) => setForm(prev => ({ ...prev, ...patch }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { setErro('Título é obrigatório.'); return }
    setErro(''); setLoading(true)
    try {
      if (editMode) { await atualizarCaso(caso.id, form) } else { await criarCaso(form) }
      onSalvo()
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar.')
      setLoading(false)
    }
  }

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editMode ? 'Editar caso' : 'Novo caso'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <SheetBody className="space-y-4">

            {/* Identificação */}
            <Sec title="Identificação" />
            <F label="Título *">
              <Input value={form.titulo} onChange={e => set({ titulo: e.target.value })}
                placeholder="Ex: Ação de Cobrança — Contrato de Empreitada"
                className="h-9 text-[13px]" autoFocus={!editMode} />
            </F>
            <F label="Número do processo">
              <Input value={form.numero ?? ''} onChange={e => set({ numero: e.target.value })}
                placeholder="0000000-00.0000.0.00.0000 ou 20 dígitos" className="h-9 text-[13px] font-mono" />
              {tribunalDoNumero && (
                <div className="flex items-center justify-between gap-2 px-2.5 py-2 bg-muted/50 border rounded-md mt-1">
                  <div className="text-[11px] leading-snug">
                    <span className="font-medium text-foreground">{tribunalDoNumero}</span>
                    {datajudInfo?.orgaoJulgador && (
                      <span className="text-muted-foreground"> · {datajudInfo.orgaoJulgador}</span>
                    )}
                    {datajudInfo?.descricao && (
                      <p className="text-muted-foreground mt-0.5 truncate max-w-[220px]">{datajudInfo.descricao}</p>
                    )}
                    {buscandoDatajud && (
                      <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Loader2 size={9} className="animate-spin" /> Consultando DataJud…
                      </p>
                    )}
                    {!buscandoDatajud && !datajudInfo && (
                      <p className="text-muted-foreground mt-0.5">Processo não encontrado no DataJud</p>
                    )}
                  </div>
                  {datajudInfo && (
                    <button
                      type="button"
                      onClick={() => preencherComDatajud(datajudInfo, set)}
                      className="flex items-center gap-1 text-[11px] text-primary hover:underline shrink-0 font-medium"
                    >
                      <Sparkles size={10} /> Preencher
                    </button>
                  )}
                </div>
              )}
            </F>

            {/* Classificação */}
            <Sec title="Classificação" />
            <div className="grid grid-cols-2 gap-3">
              <F label="Área *">
                <Select value={form.area} onValueChange={v => set({ area: v as CasoArea })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AREAS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </F>
              <F label="Fase">
                <Select value={form.fase} onValueChange={v => set({ fase: v as CasoFase })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FASES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </F>
            </div>

            {/* Processo */}
            <Sec title="Processo" />
            <div className="grid grid-cols-2 gap-3">
              <F label="Vara">
                <Input value={form.vara ?? ''} onChange={e => set({ vara: e.target.value })}
                  placeholder="5ª Vara Cível" className="h-9 text-[13px]" />
              </F>
              <F label="Tipo">
                <Select value={form.tipo_processo ?? '_none_'} onValueChange={v => set({ tipo_processo: v === '_none_' ? null : v as TipoProcesso })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">—</SelectItem>
                    <SelectItem value="eletronico">Eletrônico</SelectItem>
                    <SelectItem value="fisico">Físico</SelectItem>
                  </SelectContent>
                </Select>
              </F>
            </div>
            <F label="Juiz(a)">
              <Input value={form.juiz ?? ''} onChange={e => set({ juiz: e.target.value })}
                placeholder="Nome do magistrado" className="h-9 text-[13px]" />
            </F>

            {/* Vínculos */}
            <Sec title="Vínculos" />
            <div className="grid grid-cols-2 gap-3">
              <F label="Cliente">
                <Select value={form.cliente_id || '_none_'} onValueChange={v => set({ cliente_id: v === '_none_' ? '' : v })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="— Sem cliente —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">— Sem cliente —</SelectItem>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </F>
              <F label="Responsável">
                <Select value={form.responsavel_id || '_none_'} onValueChange={v => set({ responsavel_id: v === '_none_' ? null : v })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="— Sem responsável —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">— Sem responsável —</SelectItem>
                    {membros.map((m: any) => <SelectItem key={m.user_id} value={m.user_id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </F>
            </div>

            {/* Financeiro */}
            <Sec title="Financeiro" />
            <F label="Valor da causa (R$)">
              <Input type="number" min="0" step="0.01" value={form.valor_causa ?? ''}
                onChange={e => set({ valor_causa: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="0,00" className="h-9 text-[13px]" />
            </F>

            {/* Notas */}
            <Sec title="Notas" />
            <F label="Descrição">
              <Textarea value={form.descricao ?? ''} onChange={e => set({ descricao: e.target.value })}
                rows={2} className="text-[13px] resize-none" placeholder="Resumo do caso…" />
            </F>
            <F label="Notas internas">
              <Textarea value={form.notes ?? ''} onChange={e => set({ notes: e.target.value })}
                rows={2} className="text-[13px] resize-none" placeholder="Observações privadas da equipe…" />
            </F>

          </SheetBody>

          <SheetFooter>
            {erro && <p className="text-[12px] text-destructive mr-auto">{erro}</p>}
            <button type="button" onClick={onClose}
              className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-4 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? 'Salvando…' : editMode ? 'Salvar alterações' : 'Salvar caso'}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ── Confirmação de exclusão ───────────────────────────────────────────────────

function ConfirmarExclusao({ titulo, onCancelar, onConfirmar }: { titulo: string; onCancelar: () => void; onConfirmar: () => void }) {
  const [loading, setLoading] = useState(false)
  return (
    <Dialog open onOpenChange={open => { if (!open) onCancelar() }}>
      <DialogContent className="max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Excluir caso</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong className="text-foreground">{titulo}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button onClick={onCancelar}
            className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button onClick={async () => { setLoading(true); await onConfirmar() }} disabled={loading}
            className="px-4 h-9 bg-destructive text-destructive-foreground rounded-[5px] text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
            {loading ? 'Excluindo…' : 'Excluir'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label className="text-[12px] font-medium text-muted-foreground">{label}</Label>}
      {children}
    </div>
  )
}

function Sec({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{title}</p>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

// ── DataJud auto-fill ─────────────────────────────────────────────────────────

type DatajudAutofill = {
  tribunal?:     string
  orgaoJulgador?: string
  tipoProcesso?: TipoProcesso
  fase?:         CasoFase
  area?:         CasoArea
  descricao?:    string
}

// Extrai string de campos que podem vir como string simples ou objeto {nome, codigo}
function campoStr(v: any): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object' && v.nome) return String(v.nome)
  return ''
}

function extrairAutofill(processo: any, numero: string): DatajudAutofill {
  const info: DatajudAutofill = {
    tribunal:      campoStr(processo.tribunal),
    orgaoJulgador: campoStr(processo.orgaoJulgador?.nome ?? processo.orgaoJulgador),
  }

  // tipo_processo ← formato
  const fmt = campoStr(processo.formato).toUpperCase()
  if (fmt.includes('ELETR') || fmt.includes('DIGIT')) info.tipoProcesso = 'eletronico'
  else if (fmt.includes('FÍSIC') || fmt.includes('FISIC')) info.tipoProcesso = 'fisico'

  // fase ← grau
  const grau = campoStr(processo.grau).toUpperCase()
  if (grau === 'G1' || grau.includes('JE') || grau.includes('ESPECIAL')) info.fase = 'conhecimento'
  else if (grau === 'G2' || grau.includes('RECURSAL') || grau.includes('SUPERIOR')) info.fase = 'recurso'

  // area ← J do número ou classe.nome
  const digitos = numero.replace(/\D/g, '')
  const j = digitos.length === 20 ? digitos[13] : ''
  if (j === '5') {
    info.area = 'trabalhista'
  } else {
    const classe = campoStr(processo.classe?.nome ?? processo.classe).toLowerCase()
    if (classe.includes('trabalhist'))                                       info.area = 'trabalhista'
    else if (classe.includes('penal') || classe.includes('criminal'))        info.area = 'criminal'
    else if (classe.includes('tributar') || classe.includes('fiscal'))       info.area = 'tributario'
    else if (classe.includes('família') || classe.includes('familia') ||
             classe.includes('divórc') || classe.includes('alimento') ||
             classe.includes('guarda'))                                      info.area = 'familia'
    else if (classe.includes('recuperação judicial') || classe.includes('falência') ||
             classe.includes('empresar'))                                    info.area = 'empresarial'
    else if (classe.includes('consumidor'))                                  info.area = 'consumidor'
    else if (classe.includes('previdenciár') || classe.includes('previdenciar') ||
             classe.includes('inss'))                                        info.area = 'previdenciario'
  }

  // descricao ← classe + assunto
  const partes = [
    campoStr(processo.classe?.nome ?? processo.classe),
    campoStr(processo.assuntos?.[0]?.nome ?? processo.assuntos?.[0]),
  ].filter(Boolean)
  if (partes.length) info.descricao = partes.join(' · ')

  return info
}

function preencherComDatajud(info: DatajudAutofill, set: (patch: Partial<CasoInput>) => void) {
  const patch: Partial<CasoInput> = {}
  if (info.orgaoJulgador) patch.vara         = info.orgaoJulgador
  if (info.tipoProcesso)  patch.tipo_processo = info.tipoProcesso
  if (info.fase)          patch.fase          = info.fase
  if (info.area)          patch.area          = info.area
  if (info.descricao)     patch.descricao     = info.descricao
  set(patch)
}
