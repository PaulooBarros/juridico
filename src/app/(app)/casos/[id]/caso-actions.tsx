'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { listarClientes, type Cliente } from '@/lib/supabase/clientes'
import { listarMembros, type Membro } from '@/lib/supabase/equipe'
import { atualizarCaso, deletarCaso, type Caso, type CasoInput, type CasoStatus, type CasoArea, type CasoFase } from '@/lib/supabase/casos'

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

export function CasoActions({ caso, clienteNome }: { caso: any; clienteNome: string | null }) {
  const router   = useRouter()
  const [editando,  setEditando]  = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditando(true)}
          className="flex items-center gap-1.5 px-3 h-8 border border-border rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Pencil size={12} /> Editar
        </button>
        <button
          onClick={() => setExcluindo(true)}
          className="flex items-center gap-1.5 px-3 h-8 border border-border rounded-md text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 size={12} /> Excluir
        </button>
      </div>

      {editando && (
        <CasoFormModal
          caso={caso}
          onClose={() => setEditando(false)}
          onSalvo={() => { setEditando(false); router.refresh() }}
        />
      )}

      {excluindo && (
        <ConfirmarExclusao
          titulo={caso.titulo}
          onCancelar={() => setExcluindo(false)}
          onConfirmar={async () => { await deletarCaso(caso.id); router.push('/casos') }}
        />
      )}
    </>
  )
}

function CasoFormModal({
  caso, onClose, onSalvo,
}: {
  caso: any
  onClose: () => void
  onSalvo: () => void
}) {
  const [form, setForm] = useState<CasoInput>({
    cliente_id:     caso.cliente_id     ?? '',
    responsavel_id: caso.responsavel_id ?? '',
    numero:         caso.numero         ?? '',
    titulo:         caso.titulo         ?? '',
    area:           caso.area           ?? 'civil',
    fase:           caso.fase           ?? 'conhecimento',
    status:         caso.status         ?? 'active',
    vara:           caso.vara           ?? '',
    juiz:           caso.juiz           ?? '',
    descricao:      caso.descricao      ?? '',
    valor_causa:    caso.valor_causa    ?? null,
    notes:          caso.notes          ?? '',
  })
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [membros,  setMembros]  = useState<Membro[]>([])
  const [loading,  setLoading]  = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    listarClientes().then(setClientes).catch(() => {})
    listarMembros().then(setMembros).catch(() => {})
  }, [])

  const set = (patch: Partial<CasoInput>) => setForm(prev => ({ ...prev, ...patch }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { setErro('Título é obrigatório.'); return }
    setErro(''); setLoading(true)
    try {
      await atualizarCaso(caso.id, form)
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
          <h2 className="font-serif text-[18px] font-medium">Editar caso</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-[5px] text-muted-foreground hover:bg-accent transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 grid gap-4">
          <F label="Título *">
            <Input value={form.titulo} onChange={e => set({ titulo: e.target.value })}
              placeholder="Ex: Ação de Cobrança — Contrato de Empreitada"
              className="h-9 text-[13px]" />
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

          <F label="Responsável">
            <select value={form.responsavel_id ?? ''} onChange={e => set({ responsavel_id: e.target.value || null })}
              className="h-9 px-3 text-[13px] bg-card border border-border rounded-[5px] focus:outline-none focus:border-primary">
              <option value="">— Sem responsável —</option>
              {membros.map(m => <option key={m.user_id} value={m.user_id}>{m.nome}</option>)}
            </select>
          </F>

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
              type="number" min="0" step="0.01"
              value={form.valor_causa ?? ''}
              onChange={e => set({ valor_causa: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="0,00" className="h-9 text-[13px]"
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
              {loading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

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
