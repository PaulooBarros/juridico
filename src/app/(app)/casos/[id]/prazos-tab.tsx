'use client'
import { useEffect, useState } from 'react'
import { CalendarDays, Plus, Pencil, Trash2, CalendarCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  listarPrazosDoCaso, criarPrazo, atualizarPrazo, deletarPrazo,
  type Prazo, type PrazoInput, type PrazoTipo, type PrazoStatus,
  PRAZO_TIPO_LABEL,
} from '@/lib/supabase/prazos'

const STATUS_LABEL: Record<PrazoStatus, string> = {
  pending:   'Pendente',
  done:      'Concluído',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<PrazoStatus, string> = {
  pending:   'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  done:      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isOverdue(prazo: Prazo) {
  return prazo.status === 'pending' && new Date(prazo.data_prazo) < new Date(new Date().toDateString())
}

type ModalProps = {
  casoId:   string
  prazo?:   Prazo
  onClose:  () => void
  onSaved:  (p: Prazo) => void
}

function PrazoModal({ casoId, prazo, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<PrazoInput>({
    titulo:     prazo?.titulo     ?? '',
    descricao:  prazo?.descricao  ?? '',
    data_prazo: prazo?.data_prazo ?? '',
    hora:       prazo?.hora       ?? '',
    tipo:       prazo?.tipo       ?? 'prazo',
    caso_id:    casoId,
    status:     prazo?.status     ?? 'pending',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { toast.error('Título é obrigatório.'); return }
    if (!form.data_prazo)    { toast.error('Data é obrigatória.'); return }
    setSaving(true)
    try {
      let saved: Prazo
      if (prazo) {
        await atualizarPrazo(prazo.id, form)
        saved = { ...prazo, ...form }
      } else {
        saved = await criarPrazo(form)
      }
      toast.success('Prazo salvo')
      onSaved(saved)
      // Sync com Google Calendar em background (best-effort)
      fetch('/api/google/sync-prazo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prazoId: saved.id }),
      }).catch(() => {})
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao salvar.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-sm font-semibold">{prazo ? 'Editar prazo' : 'Novo prazo'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Título *</Label>
            <Input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Prazo para contestação" className="h-9 text-[13px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Data *</Label>
              <Input type="date" value={form.data_prazo} onChange={e => setForm(p => ({ ...p, data_prazo: e.target.value }))}
                className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Horário <span className="text-muted-foreground/50">(opcional)</span></Label>
              <Input type="time" value={form.hora ?? ''} onChange={e => setForm(p => ({ ...p, hora: e.target.value || null }))}
                className="h-9 text-[13px]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Tipo</Label>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as PrazoTipo }))}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring">
              {(Object.keys(PRAZO_TIPO_LABEL) as PrazoTipo[]).map(t => (
                <option key={t} value={t}>{PRAZO_TIPO_LABEL[t]}</option>
              ))}
            </select>
          </div>
          {prazo && (
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Status</Label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as PrazoStatus }))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring">
                {(Object.keys(STATUS_LABEL) as PrazoStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Observações</Label>
            <Textarea value={form.descricao ?? ''} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              rows={2} className="text-[13px] resize-none" placeholder="Detalhes adicionais…" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {saving ? 'Salvando…' : prazo ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type ConfirmarProps = {
  prazo:    Prazo
  onClose:  () => void
  onDeleted: () => void
}

function ConfirmarExclusao({ prazo, onClose, onDeleted }: ConfirmarProps) {
  const [loading, setLoading] = useState(false)

  async function confirmar() {
    setLoading(true)
    // Remove evento do Google Calendar (best-effort)
    await fetch('/api/google/sync-prazo', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prazoId: prazo.id }),
    }).catch(() => {})
    await deletarPrazo(prazo.id)
    onDeleted()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold">Excluir prazo?</h2>
        <p className="text-[13px] text-muted-foreground">
          "<strong>{prazo.titulo}</strong>" será removido permanentemente. Se estiver no Google Calendar, o evento também será excluído.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} disabled={loading}
            className="flex-1 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button onClick={confirmar} disabled={loading}
            className="flex-1 h-9 bg-destructive text-destructive-foreground rounded-[5px] text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
            {loading ? 'Excluindo…' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PrazosTab({ casoId }: { casoId: string }) {
  const [prazos,    setPrazos]    = useState<Prazo[]>([])
  const [loading,   setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState<Prazo | undefined>()
  const [deleting,  setDeleting]  = useState<Prazo | undefined>()

  useEffect(() => {
    listarPrazosDoCaso(casoId).then(data => { setPrazos(data); setLoading(false) })
  }, [casoId])

  function handleSaved(saved: Prazo) {
    setPrazos(prev => {
      const exists = prev.find(p => p.id === saved.id)
      return exists ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]
    })
    setModalOpen(false)
    setEditing(undefined)
  }

  function handleDeleted(id: string) {
    setPrazos(prev => prev.filter(p => p.id !== id))
    setDeleting(undefined)
  }

  const pendentes  = prazos.filter(p => p.status === 'pending')
  const concluidos = prazos.filter(p => p.status !== 'pending')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {(modalOpen || editing) && (
        <PrazoModal
          casoId={casoId}
          prazo={editing}
          onClose={() => { setModalOpen(false); setEditing(undefined) }}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <ConfirmarExclusao
          prazo={deleting}
          onClose={() => setDeleting(undefined)}
          onDeleted={() => handleDeleted(deleting.id)}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}
          </p>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors">
            <Plus size={13} /> Novo prazo
          </button>
        </div>

        {prazos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
              <CalendarDays size={28} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum prazo cadastrado.</p>
              <button onClick={() => setModalOpen(true)}
                className="mt-1 px-3 h-7 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors">
                Adicionar prazo
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendentes.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Pendentes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {pendentes.map(p => (
                      <PrazoRow key={p.id} prazo={p}
                        onEdit={() => setEditing(p)}
                        onDelete={() => setDeleting(p)} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {concluidos.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Histórico</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {concluidos.map(p => (
                      <PrazoRow key={p.id} prazo={p}
                        onEdit={() => setEditing(p)}
                        onDelete={() => setDeleting(p)} />
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

function PrazoRow({ prazo, onEdit, onDelete }: { prazo: Prazo; onEdit: () => void; onDelete: () => void }) {
  const overdue = isOverdue(prazo)
  return (
    <div className="group flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
      <div className={`shrink-0 w-1.5 h-1.5 rounded-full mt-0.5 ${overdue ? 'bg-destructive' : prazo.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${prazo.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
          {prazo.titulo}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[10px] font-medium ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
            {formatDate(prazo.data_prazo)}{prazo.hora ? ` · ${prazo.hora}` : ''}{overdue ? ' · Atrasado' : ''}
          </span>
          <Badge className={`text-[10px] border ${STATUS_COLOR[prazo.status]}`} variant="outline">
            {STATUS_LABEL[prazo.status]}
          </Badge>
          <span className="text-[10px] text-muted-foreground/60">{PRAZO_TIPO_LABEL[prazo.tipo]}</span>
          {prazo.google_event_id && (
            <span title="Sincronizado com Google Calendar">
              <CalendarCheck size={10} className="text-emerald-500" />
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
