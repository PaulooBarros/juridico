'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, Circle, Clock, X } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { listarMembros, type Membro } from '@/lib/supabase/equipe'
import {
  listarTarefasDoCaso, criarTarefa, atualizarTarefa, deletarTarefa,
  type Tarefa, type TarefaInput, type TarefaStatus, type TarefaPrioridade,
  STATUS_LABEL, PRIORIDADE_LABEL,
} from '@/lib/supabase/tarefas'

// ─── Estilos ─────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<TarefaStatus, React.ElementType> = {
  pendente:     Circle,
  em_andamento: Clock,
  concluida:    CheckCircle2,
}

const STATUS_COLOR: Record<TarefaStatus, string> = {
  pendente:     'text-muted-foreground',
  em_andamento: 'text-amber-600 dark:text-amber-400',
  concluida:    'text-emerald-600 dark:text-emerald-400',
}

const PRIORIDADE_COLOR: Record<TarefaPrioridade, string> = {
  alta:  'bg-destructive/10 text-destructive border-destructive/20',
  media: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  baixa: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isOverdue(t: Tarefa) {
  return t.status !== 'concluida' && t.data_limite && t.data_limite < new Date().toISOString().slice(0, 10)
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function TarefaModal({
  casoId, tarefa, membros, onClose, onSalvo,
}: {
  casoId:  string
  tarefa?: Tarefa
  membros: Membro[]
  onClose: () => void
  onSalvo: (t: Tarefa) => void
}) {
  const [form, setForm] = useState<TarefaInput>({
    titulo:         tarefa?.titulo         ?? '',
    descricao:      tarefa?.descricao      ?? '',
    responsavel_id: tarefa?.responsavel_id ?? '',
    status:         tarefa?.status         ?? 'pendente',
    prioridade:     tarefa?.prioridade     ?? 'media',
    data_limite:    tarefa?.data_limite    ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (patch: Partial<TarefaInput>) => setForm(p => ({ ...p, ...patch }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { toast.error('Título é obrigatório.'); return }
    setSaving(true)
    try {
      const input = {
        ...form,
        responsavel_id: form.responsavel_id || null,
        data_limite:    form.data_limite    || null,
        descricao:      form.descricao      || null,
      }
      if (tarefa) {
        await atualizarTarefa(tarefa.id, input)
        toast.success('Tarefa salva')
        onSalvo({ ...tarefa, ...input, responsavel_nome: membros.find(m => m.user_id === input.responsavel_id)?.nome ?? null })
      } else {
        const criada = await criarTarefa(casoId, input)
        toast.success('Tarefa salva')
        onSalvo(criada)
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao salvar.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-[14px] font-semibold">{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Título *</Label>
            <Input autoFocus value={form.titulo} onChange={e => set({ titulo: e.target.value })}
              placeholder="Ex: Elaborar petição inicial" className="h-9 text-[13px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Prioridade</Label>
              <select value={form.prioridade} onChange={e => set({ prioridade: e.target.value as TarefaPrioridade })}
                className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30">
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Data limite</Label>
              <Input type="date" value={form.data_limite ?? ''} onChange={e => set({ data_limite: e.target.value || null })}
                className="h-9 text-[13px]" />
            </div>
          </div>

          {tarefa && (
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Status</Label>
              <select value={form.status} onChange={e => set({ status: e.target.value as TarefaStatus })}
                className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30">
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Responsável</Label>
            <select value={form.responsavel_id ?? ''} onChange={e => set({ responsavel_id: e.target.value || null })}
              className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— Sem responsável —</option>
              {membros.map(m => <option key={m.user_id} value={m.user_id}>{m.nome}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Descrição</Label>
            <Textarea value={form.descricao ?? ''} onChange={e => set({ descricao: e.target.value })}
              rows={2} className="text-[13px] resize-none" placeholder="Detalhes da tarefa…" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 border border-border rounded-[6px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-9 bg-primary text-primary-foreground rounded-[6px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? 'Salvando…' : tarefa ? 'Salvar' : 'Criar tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function TarefaRow({
  tarefa, membros, onEdit, onDelete, onStatusChange,
}: {
  tarefa:         Tarefa
  membros:        Membro[]
  onEdit:         () => void
  onDelete:       () => void
  onStatusChange: (s: TarefaStatus) => void
}) {
  const StatusIcon = STATUS_ICON[tarefa.status]
  const overdue    = isOverdue(tarefa)

  const nextStatus: Record<TarefaStatus, TarefaStatus> = {
    pendente:     'em_andamento',
    em_andamento: 'concluida',
    concluida:    'pendente',
  }

  return (
    <div className={cn('group flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors', tarefa.status === 'concluida' && 'opacity-60')}>
      {/* Toggle status */}
      <button
        onClick={() => onStatusChange(nextStatus[tarefa.status])}
        title={`Marcar como ${STATUS_LABEL[nextStatus[tarefa.status]]}`}
        className="mt-0.5 shrink-0"
      >
        <StatusIcon size={15} className={STATUS_COLOR[tarefa.status]} />
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-medium truncate', tarefa.status === 'concluida' && 'line-through text-muted-foreground')}>
          {tarefa.titulo}
        </p>
        {tarefa.descricao && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{tarefa.descricao}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge className={cn('text-[10px] border', PRIORIDADE_COLOR[tarefa.prioridade])} variant="outline">
            {PRIORIDADE_LABEL[tarefa.prioridade]}
          </Badge>
          {tarefa.data_limite && (
            <span className={cn('text-[10px]', overdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
              {overdue ? '⚠ ' : ''}{formatDate(tarefa.data_limite)}
            </span>
          )}
          {tarefa.responsavel_nome && (
            <span className="text-[10px] text-muted-foreground">
              → {tarefa.responsavel_nome.split(' ')[0]}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          <Pencil size={12} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── Tab principal ────────────────────────────────────────────────────────────

export function TarefasTab({ casoId }: { casoId: string }) {
  const [tarefas,    setTarefas]    = useState<Tarefa[]>([])
  const [membros,    setMembros]    = useState<Membro[]>([])
  const [loading,    setLoading]    = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editando,   setEditando]   = useState<Tarefa | undefined>()

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [ts, ms] = await Promise.all([
        listarTarefasDoCaso(casoId),
        listarMembros(),
      ])
      setTarefas(ts)
      setMembros(ms)
    } finally {
      setLoading(false)
    }
  }, [casoId])

  useEffect(() => { carregar() }, [carregar])

  function handleSalvo(t: Tarefa) {
    setTarefas(prev => {
      const idx = prev.findIndex(p => p.id === t.id)
      return idx >= 0 ? prev.map(p => p.id === t.id ? t : p) : [...prev, t]
    })
    setModalOpen(false)
    setEditando(undefined)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta tarefa?')) return
    await deletarTarefa(id)
    setTarefas(prev => prev.filter(t => t.id !== id))
  }

  async function handleStatusChange(tarefa: Tarefa, status: TarefaStatus) {
    await atualizarTarefa(tarefa.id, { status })
    setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status } : t))
  }

  const pendentes    = tarefas.filter(t => t.status === 'pendente')
  const emAndamento  = tarefas.filter(t => t.status === 'em_andamento')
  const concluidas   = tarefas.filter(t => t.status === 'concluida')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {(modalOpen || editando) && (
        <TarefaModal
          casoId={casoId}
          tarefa={editando}
          membros={membros}
          onClose={() => { setModalOpen(false); setEditando(undefined) }}
          onSalvo={handleSalvo}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pendentes.length + emAndamento.length} pendente{pendentes.length + emAndamento.length !== 1 ? 's' : ''}
            {concluidas.length > 0 && ` · ${concluidas.length} concluída${concluidas.length !== 1 ? 's' : ''}`}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={13} /> Nova tarefa
          </button>
        </div>

        {tarefas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
              <CheckCircle2 size={28} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada.</p>
              <button onClick={() => setModalOpen(true)}
                className="mt-1 px-3 h-7 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors">
                Adicionar tarefa
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(pendentes.length > 0 || emAndamento.length > 0) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Em aberto</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {[...emAndamento, ...pendentes].map(t => (
                      <TarefaRow
                        key={t.id}
                        tarefa={t}
                        membros={membros}
                        onEdit={() => setEditando(t)}
                        onDelete={() => handleDelete(t.id)}
                        onStatusChange={s => handleStatusChange(t, s)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {concluidas.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Concluídas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {concluidas.map(t => (
                      <TarefaRow
                        key={t.id}
                        tarefa={t}
                        membros={membros}
                        onEdit={() => setEditando(t)}
                        onDelete={() => handleDelete(t.id)}
                        onStatusChange={s => handleStatusChange(t, s)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  )
}
