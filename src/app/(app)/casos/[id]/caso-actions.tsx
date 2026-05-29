'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { listarClientes, type Cliente } from '@/lib/supabase/clientes'
import { listarMembros, type Membro } from '@/lib/supabase/equipe'
import { atualizarCaso, deletarCaso, type Caso, type CasoInput, type CasoStatus, type CasoArea, type CasoFase, type TipoProcesso } from '@/lib/supabase/casos'

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
    tipo_processo:  caso.tipo_processo  ?? null,
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
    <Sheet open onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar caso</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <SheetBody className="space-y-4">

            <Sec title="Caso" />
            <F label="Título *">
              <Input value={form.titulo} onChange={e => set({ titulo: e.target.value })}
                placeholder="Ex: Ação de Cobrança — Contrato de Empreitada"
                className="h-9 text-[13px]" />
            </F>
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

            <Sec title="Processo" />
            <div className="grid grid-cols-[1fr_148px] gap-3">
              <F label="Número">
                <Input value={form.numero ?? ''} onChange={e => set({ numero: e.target.value })}
                  placeholder="0000000-00.0000.0.00.0000" className="h-9 text-[13px] font-mono" />
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
            <div className="grid grid-cols-2 gap-3">
              <F label="Vara / Tribunal">
                <Input value={form.vara ?? ''} onChange={e => set({ vara: e.target.value })}
                  placeholder="5ª Vara Cível — TJSP" className="h-9 text-[13px]" />
              </F>
              <F label="Juiz">
                <Input value={form.juiz ?? ''} onChange={e => set({ juiz: e.target.value })}
                  placeholder="Nome do magistrado" className="h-9 text-[13px]" />
              </F>
            </div>

            <Sec title="Vínculos" />
            <div className="grid grid-cols-2 gap-3">
              <F label="Status">
                <Select value={form.status} onValueChange={v => set({ status: v as CasoStatus })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                    <SelectItem value="closed">Encerrado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </F>
              <F label="Cliente">
                <Select value={form.cliente_id || '_none_'} onValueChange={v => set({ cliente_id: v === '_none_' ? '' : v })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="— Sem cliente —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">— Sem cliente —</SelectItem>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </F>
            </div>
            <F label="Responsável">
              <Select value={form.responsavel_id || '_none_'} onValueChange={v => set({ responsavel_id: v === '_none_' ? null : v })}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="— Sem responsável —" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">— Sem responsável —</SelectItem>
                  {membros.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </F>

            <Sec title="Financeiro" />
            <F label="Valor da causa (R$)">
              <Input type="number" min="0" step="0.01" value={form.valor_causa ?? ''}
                onChange={e => set({ valor_causa: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="0,00" className="h-9 text-[13px]" />
            </F>

            <Sec title="Notas" />
            <F label="Descrição">
              <Textarea value={form.descricao ?? ''} onChange={e => set({ descricao: e.target.value })}
                rows={2} className="text-[13px] resize-none" placeholder="Resumo do caso…" />
            </F>
            <F label="Observações internas">
              <Textarea value={form.notes ?? ''} onChange={e => set({ notes: e.target.value })}
                rows={2} className="text-[13px] resize-none" placeholder="Notas internas…" />
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
              {loading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

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
