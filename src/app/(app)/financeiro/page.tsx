'use client'
import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { StatsCard } from '@/features/shared/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { listarClientes } from '@/lib/supabase/clientes'
import { listarCasos } from '@/lib/supabase/casos'
import {
  listarTransacoes, criarTransacao, atualizarTransacao, deletarTransacao,
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

type FiltroTipo = 'todos' | TransacaoTipo

// ─── Modal ───────────────────────────────────────────────────────────────────

type ModalProps = {
  transacao?: Transacao
  onClose:    () => void
  onSaved:    (t: Transacao) => void
}

function TransacaoModal({ transacao, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<TransacaoInput>({
    descricao:  transacao?.descricao  ?? '',
    tipo:       transacao?.tipo       ?? 'honorario',
    status:     transacao?.status     ?? 'pending',
    valor:      transacao?.valor      ?? 0,
    vencimento: transacao?.vencimento ?? '',
    pago_em:    transacao?.pago_em    ?? '',
    caso_id:    transacao?.caso_id    ?? '',
    cliente_id: transacao?.cliente_id ?? '',
    notas:      transacao?.notas      ?? '',
  })
  const [clientes, setClientes] = useState<{ id: string; name: string }[]>([])
  const [casos,    setCasos]    = useState<{ id: string; titulo: string }[]>([])
  const [saving,   setSaving]   = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    Promise.all([listarClientes(), listarCasos()]).then(([cls, css]) => {
      setClientes(cls.map(c => ({ id: c.id, name: c.name })))
      setCasos(css.map(c => ({ id: c.id, titulo: c.titulo })))
    })
  }, [])

  const set = (patch: Partial<TransacaoInput>) => setForm(p => ({ ...p, ...patch }))

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
        caso_id:    form.caso_id    || undefined,
        cliente_id: form.cliente_id || undefined,
        notas:      form.notas      || undefined,
      }
      let saved: Transacao
      if (transacao) {
        await atualizarTransacao(transacao.id, input)
        saved = { ...transacao, ...input,
          caso_titulo:  casos.find(c => c.id === input.caso_id)?.titulo ?? transacao.caso_titulo,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-background">
          <h2 className="text-sm font-semibold">{transacao ? 'Editar lançamento' : 'Novo lançamento'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Descrição *</Label>
            <Input value={form.descricao} onChange={e => set({ descricao: e.target.value })}
              placeholder="Ex: Honorários — Fase de Conhecimento" className="h-9 text-[13px]" />
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
                onChange={e => set({ valor: parseFloat(e.target.value) || 0 })}
                placeholder="0,00" className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Vencimento</Label>
              <Input type="date" value={form.vencimento ?? ''} onChange={e => set({ vencimento: e.target.value })}
                className="h-9 text-[13px]" />
            </div>
          </div>

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
            <Label className="text-[12px] text-muted-foreground">Caso</Label>
            <select value={form.caso_id ?? ''} onChange={e => set({ caso_id: e.target.value })}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">— Selecionar caso —</option>
              {casos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
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
  async function confirmar() {
    setLoading(true)
    await deletarTransacao(transacao.id)
    onDeleted()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
          <button onClick={confirmar} disabled={loading}
            className="flex-1 h-9 bg-destructive text-destructive-foreground rounded-[5px] text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
            {loading ? 'Excluindo…' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filtro,     setFiltro]     = useState<FiltroTipo>('todos')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editing,    setEditing]    = useState<Transacao | undefined>()
  const [deleting,   setDeleting]   = useState<Transacao | undefined>()

  useEffect(() => {
    listarTransacoes().then(data => { setTransacoes(data); setLoading(false) })
  }, [])

  function handleSaved(saved: Transacao) {
    setTransacoes(prev => {
      const exists = prev.find(t => t.id === saved.id)
      return exists ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev]
    })
    setModalOpen(false)
    setEditing(undefined)
  }

  function handleDeleted(id: string) {
    setTransacoes(prev => prev.filter(t => t.id !== id))
    setDeleting(undefined)
  }

  const paid    = transacoes.filter(t => t.status === 'paid')
  const pending = transacoes.filter(t => t.status === 'pending')
  const overdue = transacoes.filter(t => t.status === 'overdue')

  const totalPaid    = paid.reduce((s, t) => s + Number(t.valor), 0)
  const totalPending = pending.reduce((s, t) => s + Number(t.valor), 0)
  const totalOverdue = overdue.reduce((s, t) => s + Number(t.valor), 0)

  const filtradas = filtro === 'todos' ? transacoes : transacoes.filter(t => t.tipo === filtro)

  const FILTROS: { key: FiltroTipo; label: string }[] = [
    { key: 'todos',       label: 'Todos' },
    { key: 'honorario',   label: 'Honorários' },
    { key: 'despesa',     label: 'Despesas' },
    { key: 'reembolso',   label: 'Reembolsos' },
    { key: 'adiantamento',label: 'Adiantamentos' },
  ]

  return (
    <>
      {(modalOpen || editing) && (
        <TransacaoModal
          transacao={editing}
          onClose={() => { setModalOpen(false); setEditing(undefined) }}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <ConfirmarExclusao
          transacao={deleting}
          onClose={() => setDeleting(undefined)}
          onDeleted={() => handleDeleted(deleting.id)}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Recebido"  value={formatCurrency(totalPaid)}
            icon={CheckCircle2} variant="success"
            description={`${paid.length} lançamento${paid.length !== 1 ? 's' : ''}`} />
          <StatsCard title="A Receber"       value={formatCurrency(totalPending)}
            icon={DollarSign}
            description={`${pending.length} pendente${pending.length !== 1 ? 's' : ''}`} />
          <StatsCard title="Em Atraso"       value={formatCurrency(totalOverdue)}
            icon={AlertTriangle} variant="critical"
            description={`${overdue.length} vencido${overdue.length !== 1 ? 's' : ''}`} />
          <StatsCard title="Total Lançado"   value={formatCurrency(totalPaid + totalPending + totalOverdue)}
            icon={TrendingUp} description="todos os lançamentos" />
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>Lançamentos</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {FILTROS.map(f => (
                    <button key={f.key} onClick={() => setFiltro(f.key)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors
                        ${filtro === f.key ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground rounded-[5px] text-xs font-medium hover:bg-primary/90 transition-colors">
                  <Plus size={12} /> Novo lançamento
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={18} className="animate-spin text-muted-foreground" />
              </div>
            ) : filtradas.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12">
                <DollarSign size={28} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhum lançamento encontrado.</p>
                <button onClick={() => setModalOpen(true)}
                  className="mt-1 px-3 h-7 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors">
                  Adicionar lançamento
                </button>
              </div>
            ) : (
              <>
                <div className="hidden lg:grid grid-cols-[2fr_1.5fr_100px_110px_120px_110px_60px] border-b bg-muted/30">
                  {['Descrição','Cliente / Caso','Tipo','Vencimento','Valor','Status',''].map(h => (
                    <div key={h} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
                  ))}
                </div>
                <div className="divide-y">
                  {filtradas.map(t => (
                    <div key={t.id}
                      className="group grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_100px_110px_120px_110px_60px] gap-0 hover:bg-muted/20 transition-colors">
                      <div className="px-4 py-3">
                        <p className="text-xs font-medium truncate">{t.descricao}</p>
                        {t.notas && <p className="text-[10px] text-muted-foreground truncate">{t.notas}</p>}
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-xs text-muted-foreground truncate">{t.cliente_nome ?? '—'}</p>
                        {t.caso_titulo && (
                          <p className="text-[10px] text-muted-foreground truncate">{t.caso_titulo}</p>
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
          </CardContent>
        </Card>
      </div>
    </>
  )
}
