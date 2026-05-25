'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Briefcase, Plus, X, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { EmptyState } from '@/features/shared/empty-state'
import { formatArea, formatPhase, formatDate, formatCurrency, cn } from '@/lib/utils'
import { listarClientes, type Cliente } from '@/lib/supabase/clientes'
import {
  listarCasos, criarCaso, atualizarCaso, deletarCaso,
  type Caso, type CasoInput, type CasoStatus, type CasoArea, type CasoFase,
} from '@/lib/supabase/casos'

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
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, número ou cliente…"
            className="pl-9 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-xs text-foreground min-w-40"
          value={area}
          onChange={e => setArea(e.target.value as any)}
        >
          <option value="all">Todas as áreas</option>
          {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
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
          className="flex items-center gap-1.5 px-3 h-9 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={14} /> Novo caso
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="grid grid-cols-[2fr_1.5fr_110px_110px_100px_72px] gap-0 border-b bg-muted/30">
          {['Caso / Número', 'Cliente', 'Área', 'Fase', 'Status', ''].map((h, i) => (
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
              <div key={caso.id} className="grid grid-cols-[2fr_1.5fr_110px_110px_100px_72px] gap-0 hover:bg-muted/30 transition-colors group">
                <Link href={`/casos/${caso.id}`} className="px-4 py-3">
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{caso.titulo}</p>
                  {caso.numero && <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{caso.numero}</p>}
                </Link>
                <Link href={`/casos/${caso.id}`} className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{caso.cliente_nome ?? '—'}</p>
                </Link>
                <Link href={`/casos/${caso.id}`} className="px-4 py-3 flex items-center">
                  <Badge variant="muted" className="text-[10px]">{formatArea(caso.area)}</Badge>
                </Link>
                <Link href={`/casos/${caso.id}`} className="px-4 py-3 flex items-center">
                  <span className="text-xs text-muted-foreground">{formatPhase(caso.fase)}</span>
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
    cliente_id:  caso?.cliente_id  ?? '',
    numero:      caso?.numero      ?? '',
    titulo:      caso?.titulo      ?? '',
    area:        caso?.area        ?? 'civil',
    fase:        caso?.fase        ?? 'conhecimento',
    status:      caso?.status      ?? 'active',
    vara:        caso?.vara        ?? '',
    juiz:        caso?.juiz        ?? '',
    descricao:   caso?.descricao   ?? '',
    valor_causa: caso?.valor_causa ?? null,
    notes:       caso?.notes       ?? '',
  })
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading]   = useState(false)
  const [erro, setErro]         = useState('')

  useEffect(() => {
    listarClientes().then(setClientes).catch(() => {})
  }, [])

  const set = (patch: Partial<CasoInput>) => setForm(prev => ({ ...prev, ...patch }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { setErro('Título é obrigatório.'); return }
    setErro(''); setLoading(true)
    try {
      if (editMode) {
        await atualizarCaso(caso.id, form)
      } else {
        await criarCaso(form)
      }
      onSalvo()
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-[580px] max-h-[90vh] overflow-y-auto shadow-xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-[18px] font-medium">{editMode ? 'Editar caso' : 'Novo caso'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 grid gap-4">

          <F label="Título *">
            <Input value={form.titulo} onChange={e => set({ titulo: e.target.value })}
              placeholder="Ex: Ação de Cobrança — Contrato de Empreitada"
              className="h-9 text-[13px]" autoFocus={!editMode} />
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Área *">
              <select value={form.area} onChange={e => set({ area: e.target.value as CasoArea })}
                className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] focus:outline-none focus:border-primary">
                {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </F>
            <F label="Fase">
              <select value={form.fase} onChange={e => set({ fase: e.target.value as CasoFase })}
                className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] focus:outline-none focus:border-primary">
                {FASES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Status">
              <select value={form.status} onChange={e => set({ status: e.target.value as CasoStatus })}
                className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] focus:outline-none focus:border-primary">
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="suspended">Suspenso</option>
                <option value="closed">Encerrado</option>
                <option value="archived">Arquivado</option>
              </select>
            </F>
            <F label="Cliente">
              <select value={form.cliente_id ?? ''} onChange={e => set({ cliente_id: e.target.value || undefined })}
                className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] focus:outline-none focus:border-primary">
                <option value="">— Sem cliente —</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </F>
          </div>

          <F label="Número do processo">
            <Input value={form.numero ?? ''} onChange={e => set({ numero: e.target.value })}
              placeholder="0000000-00.0000.0.00.0000" className="h-9 text-[13px] font-mono" />
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Vara / Tribunal">
              <Input value={form.vara ?? ''} onChange={e => set({ vara: e.target.value })}
                placeholder="Ex: 5ª Vara Cível — TJSP" className="h-9 text-[13px]" />
            </F>
            <F label="Juiz">
              <Input value={form.juiz ?? ''} onChange={e => set({ juiz: e.target.value })}
                placeholder="Nome do magistrado" className="h-9 text-[13px]" />
            </F>
          </div>

          <F label="Valor da causa (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.valor_causa ?? ''}
              onChange={e => set({ valor_causa: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="0,00"
              className="h-9 text-[13px]"
            />
          </F>

          <F label="Descrição">
            <Textarea value={form.descricao ?? ''} onChange={e => set({ descricao: e.target.value })}
              rows={2} className="text-[13px] resize-none" placeholder="Resumo do caso…" />
          </F>

          <F label="Observações internas">
            <Textarea value={form.notes ?? ''} onChange={e => set({ notes: e.target.value })}
              rows={2} className="text-[13px] resize-none" placeholder="Notas internas…" />
          </F>

          {erro && <p className="text-[12px] text-destructive">{erro}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-4 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? 'Salvando…' : editMode ? 'Salvar alterações' : 'Salvar caso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Confirmação de exclusão ───────────────────────────────────────────────────

function ConfirmarExclusao({ titulo, onCancelar, onConfirmar }: { titulo: string; onCancelar: () => void; onConfirmar: () => void }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancelar} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-[380px] p-6 shadow-xl">
        <h2 className="font-serif text-[18px] font-medium mb-2">Excluir caso</h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Tem certeza que deseja excluir <strong className="text-foreground">{titulo}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancelar}
            className="px-4 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button onClick={async () => { setLoading(true); await onConfirmar() }} disabled={loading}
            className="px-4 h-9 bg-destructive text-destructive-foreground rounded-[5px] text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
            {loading ? 'Excluindo…' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
