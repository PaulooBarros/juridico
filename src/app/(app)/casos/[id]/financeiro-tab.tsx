'use client'
import { useEffect, useState } from 'react'
import { DollarSign, Plus, Pencil, Trash2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { listarClientes } from '@/lib/supabase/clientes'
import {
  listarTransacoesPorCaso, criarTransacao, atualizarTransacao, deletarTransacao,
  type Transacao, type TransacaoInput, type TransacaoTipo, type TransacaoStatus,
  TIPO_LABEL, STATUS_LABEL,
} from '@/lib/supabase/financeiro'

const TIPO_COLOR: Record<TransacaoTipo, string> = {
  honorario:    'text-primary',
  despesa:      'text-destructive',
  reembolso:    'text-emerald-600 dark:text-emerald-400',
  adiantamento: 'text-amber-600 dark:text-amber-400',
}

const STATUS_COLOR: Record<TransacaoStatus, string> = {
  paid:      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  pending:   'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  overdue:   'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function TransacaoModal({ casoId, valorCausa, transacao, onClose, onSaved }: {
  casoId:      string
  valorCausa?: number | null
  transacao?:  Transacao
  onClose:     () => void
  onSaved:     (t: Transacao) => void
}) {
  const [form, setForm] = useState<TransacaoInput>({
    descricao:  transacao?.descricao  ?? '',
    tipo:       transacao?.tipo       ?? 'honorario',
    status:     transacao?.status     ?? 'pending',
    valor:      transacao?.valor      ?? 0,
    vencimento: transacao?.vencimento ?? '',
    pago_em:    transacao?.pago_em    ?? '',
    caso_id:    casoId,
    cliente_id: transacao?.cliente_id ?? '',
    notas:      transacao?.notas      ?? '',
  })
  const [pct,      setPct]      = useState('')
  const [clientes, setClientes] = useState<{ id: string; name: string }[]>([])
  const [saving,   setSaving]   = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    listarClientes().then(cls => setClientes(cls.map(c => ({ id: c.id, name: c.name }))))
  }, [])

  const set = (patch: Partial<TransacaoInput>) => setForm(p => ({ ...p, ...patch }))

  function aplicarPct(p: number) {
    if (!valorCausa) return
    setPct(String(p))
    set({ valor: Math.round(valorCausa * p / 100 * 100) / 100 })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.descricao.trim()) { setErro('Descrição é obrigatória.'); return }
    if (!form.valor || form.valor <= 0) { setErro('Informe um valor válido.'); return }
    setErro(''); setSaving(true)
    try {
      const input: TransacaoInput = {
        ...form,
        vencimento: form.vencimento || undefined,
        pago_em:    form.pago_em    || undefined,
        cliente_id: form.cliente_id || undefined,
        notas:      form.notas      || undefined,
      }
      let saved: Transacao
      if (transacao) {
        await atualizarTransacao(transacao.id, input)
        saved = {
          ...transacao, ...input,
          cliente_nome: clientes.find(c => c.id === input.cliente_id)?.name ?? transacao.cliente_nome,
        }
      } else {
        saved = await criarTransacao(input)
      }
      onSaved(saved)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-background">
          <h2 className="text-sm font-semibold">{transacao ? 'Editar lançamento' : 'Novo lançamento'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Descrição *</Label>
            <Input value={form.descricao} onChange={e => set({ descricao: e.target.value })}
              placeholder="Ex: Honorários — Fase de Conhecimento" className="h-9 text-[13px]" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Tipo</Label>
              <select value={form.tipo} onChange={e => set({ tipo: e.target.value as TransacaoTipo })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring">
                {(Object.keys(TIPO_LABEL) as TransacaoTipo[]).map(t => (
                  <option key={t} value={t}>{TIPO_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Status</Label>
              <select value={form.status} onChange={e => set({ status: e.target.value as TransacaoStatus })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring">
                {(Object.keys(STATUS_LABEL) as TransacaoStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Valor (R$) *</Label>
              <Input type="number" min="0" step="0.01" value={form.valor || ''}
                onChange={e => { setPct(''); set({ valor: parseFloat(e.target.value) || 0 }) }}
                placeholder="0,00" className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Vencimento</Label>
              <Input type="date" value={form.vencimento ?? ''} onChange={e => set({ vencimento: e.target.value })}
                className="h-9 text-[13px]" />
            </div>
          </div>

          {/* % do valor da causa */}
          {valorCausa && valorCausa > 0 && (
            <div className="rounded-md bg-muted/40 border border-border px-3 py-2.5 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                % do valor da causa <span className="font-medium text-foreground">{formatCurrency(valorCausa)}</span>
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[10, 20, 30].map(p => (
                    <button key={p} type="button" onClick={() => aplicarPct(p)}
                      className={cn(
                        'px-2.5 h-7 rounded border text-xs transition-colors',
                        pct === String(p)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:bg-accent'
                      )}>
                      {p}%
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <Input
                    type="number" min="0" max="100" step="0.5"
                    value={pct}
                    onChange={e => {
                      setPct(e.target.value)
                      const p = parseFloat(e.target.value)
                      if (!isNaN(p) && p > 0) set({ valor: Math.round(valorCausa * p / 100 * 100) / 100 })
                    }}
                    placeholder="outro %"
                    className="h-7 text-[12px]"
                  />
                  <span className="text-[12px] text-muted-foreground shrink-0">%</span>
                </div>
              </div>
            </div>
          )}

          {form.status === 'paid' && (
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Data do pagamento</Label>
              <Input type="date" value={form.pago_em ?? ''} onChange={e => set({ pago_em: e.target.value })}
                className="h-9 text-[13px]" />
            </div>
          )}

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Cliente</Label>
            <select value={form.cliente_id ?? ''} onChange={e => set({ cliente_id: e.target.value })}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">— Selecionar cliente —</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Observações</Label>
            <Textarea value={form.notas ?? ''} onChange={e => set({ notas: e.target.value })}
              rows={2} className="text-[13px] resize-none" placeholder="Detalhes adicionais…" />
          </div>

          {erro && <p className="text-[12px] text-destructive">{erro}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-9 bg-primary text-primary-foreground rounded-[5px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {saving ? 'Salvando…' : transacao ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Confirmação exclusão ─────────────────────────────────────────────────────

function ConfirmarExclusao({ transacao, onClose, onDeleted }: {
  transacao: Transacao; onClose: () => void; onDeleted: () => void
}) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold">Excluir lançamento?</h2>
        <p className="text-[13px] text-muted-foreground">
          "<strong>{transacao.descricao}</strong>" será removido permanentemente.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} disabled={loading}
            className="flex-1 h-9 border border-border rounded-[5px] text-[13px] text-muted-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button onClick={async () => { setLoading(true); await deletarTransacao(transacao.id); onDeleted() }}
            disabled={loading}
            className="flex-1 h-9 bg-destructive text-destructive-foreground rounded-[5px] text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
            {loading ? 'Excluindo…' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab principal ────────────────────────────────────────────────────────────

export function FinanceiroTab({ casoId, valorCausa }: {
  casoId:      string
  valorCausa?: number | null
}) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading,    setLoading]    = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editing,    setEditing]    = useState<Transacao | undefined>()
  const [deleting,   setDeleting]   = useState<Transacao | undefined>()

  useEffect(() => {
    listarTransacoesPorCaso(casoId)
      .then(data => { setTransacoes(data); setLoading(false) })
  }, [casoId])

  function handleSaved(saved: Transacao) {
    setTransacoes(prev => {
      const exists = prev.find(t => t.id === saved.id)
      return exists ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev]
    })
    setModalOpen(false)
    setEditing(undefined)
  }

  const ativos       = transacoes.filter(t => t.status !== 'cancelled')
  const totalRecebido = ativos.filter(t => t.status === 'paid').reduce((s, t) => s + Number(t.valor), 0)
  const totalPendente = ativos.filter(t => t.status === 'pending').reduce((s, t) => s + Number(t.valor), 0)
  const totalAtraso   = ativos.filter(t => t.status === 'overdue').reduce((s, t) => s + Number(t.valor), 0)
  const totalLancado  = ativos.reduce((s, t) => s + Number(t.valor), 0)
  const pctCausa      = valorCausa && valorCausa > 0 ? Math.min(totalLancado / valorCausa * 100, 100) : 0

  return (
    <>
      {(modalOpen || editing) && (
        <TransacaoModal
          casoId={casoId}
          valorCausa={valorCausa}
          transacao={editing}
          onClose={() => { setModalOpen(false); setEditing(undefined) }}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <ConfirmarExclusao
          transacao={deleting}
          onClose={() => setDeleting(undefined)}
          onDeleted={() => { setTransacoes(prev => prev.filter(t => t.id !== deleting.id)); setDeleting(undefined) }}
        />
      )}

      <div className="space-y-4">

        {/* Stats + referência ao valor da causa */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Recebido',      value: totalRecebido, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'A receber',     value: totalPendente, icon: DollarSign,   color: 'text-foreground' },
            { label: 'Em atraso',     value: totalAtraso,   icon: AlertTriangle,color: 'text-destructive' },
            { label: 'Valor da causa',value: valorCausa ?? 0, icon: DollarSign, color: 'text-muted-foreground', muted: true },
          ].map(({ label, value, icon: Icon, color, muted }) => (
            <div key={label} className={cn('rounded-lg border bg-card px-4 py-3 flex items-center gap-3', muted && 'opacity-60')}>
              <Icon size={16} className={cn('shrink-0', color)} />
              <div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className={cn('text-sm font-semibold', color)}>{formatCurrency(value)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de progresso lançado vs causa */}
        {valorCausa && valorCausa > 0 && (
          <div className="rounded-lg border bg-card px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Total lançado: <span className="font-medium text-foreground">{formatCurrency(totalLancado)}</span>
                <span className="text-muted-foreground"> de </span>
                <span className="font-medium text-foreground">{formatCurrency(valorCausa)}</span>
              </span>
              <span className="font-medium text-foreground">{pctCausa.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pctCausa}%` }}
              />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {transacoes.length} lançamento{transacoes.length !== 1 ? 's' : ''} neste caso
          </p>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground rounded-[5px] text-xs font-medium hover:bg-primary/90 transition-colors">
            <Plus size={12} /> Novo lançamento
          </button>
        </div>

        {/* Lista */}
        <div className="rounded-lg border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={18} className="animate-spin text-muted-foreground" />
            </div>
          ) : transacoes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <DollarSign size={28} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhum lançamento neste caso.</p>
              <button onClick={() => setModalOpen(true)}
                className="mt-1 px-3 h-7 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors">
                Adicionar lançamento
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2fr_100px_110px_120px_110px_56px] border-b bg-muted/30">
                {['Descrição', 'Tipo', 'Vencimento', 'Valor', 'Status', ''].map(h => (
                  <div key={h} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
                ))}
              </div>
              <div className="divide-y">
                {transacoes.map(t => (
                  <div key={t.id}
                    className="group grid grid-cols-[2fr_100px_110px_120px_110px_56px] hover:bg-muted/20 transition-colors">
                    <div className="px-4 py-3">
                      <p className="text-xs font-medium truncate">{t.descricao}</p>
                      {t.cliente_nome && (
                        <p className="text-[10px] text-muted-foreground truncate">{t.cliente_nome}</p>
                      )}
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <span className={cn('text-xs font-medium', TIPO_COLOR[t.tipo])}>
                        {TIPO_LABEL[t.tipo]}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <span className="text-xs text-muted-foreground">
                        {t.vencimento ? formatDate(t.vencimento) : '—'}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <span className={cn('text-xs font-semibold',
                        t.tipo === 'despesa' ? 'text-destructive' : 'text-foreground')}>
                        {t.tipo === 'despesa' ? '-' : '+'}{formatCurrency(Number(t.valor))}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <Badge className={cn('text-[10px] border', STATUS_COLOR[t.status])} variant="outline">
                        {STATUS_LABEL[t.status]}
                      </Badge>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(t)}
                        className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setDeleting(t)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
