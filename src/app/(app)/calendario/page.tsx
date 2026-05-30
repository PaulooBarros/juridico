'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays, Plus, X, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  listarTodosPrazos, criarPrazo,
  type PrazoComCaso, type PrazoTipo, type PrazoStatus, PRAZO_TIPO_LABEL,
} from '@/lib/supabase/prazos'
import { listarCasos, type Caso } from '@/lib/supabase/casos'
import { cn } from '@/lib/utils'

// ─── Config visual ────────────────────────────────────────────────────────────

const TIPO_COLOR: Record<PrazoTipo, string> = {
  prazo:     'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25',
  audiencia: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/25',
  reuniao:   'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25',
  protocolo: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25',
  recurso:   'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/25',
  outro:     'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/25',
}

const STATUS_DOT: Record<PrazoStatus, string> = {
  pending:   'bg-amber-500',
  done:      'bg-emerald-500',
  cancelled: 'bg-zinc-400',
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isOverdue(p: PrazoComCaso) {
  return p.status === 'pending' && p.data_prazo < isoDate(new Date())
}

// ─── Modal novo prazo ─────────────────────────────────────────────────────────

interface NovoPrazoModalProps {
  dataInicial: string
  casos:       Caso[]
  onClose:     () => void
  onSalvo:     (p: PrazoComCaso) => void
}

function NovoPrazoModal({ dataInicial, casos, onClose, onSalvo }: NovoPrazoModalProps) {
  const [titulo,   setTitulo]   = useState('')
  const [data,     setData]     = useState(dataInicial)
  const [hora,     setHora]     = useState('')
  const [tipo,     setTipo]     = useState<PrazoTipo>('prazo')
  const [casoId,   setCasoId]   = useState('')
  const [descricao,setDescricao]= useState('')
  const [saving,   setSaving]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) { toast.error('Título é obrigatório.'); return }
    if (!data)          { toast.error('Informe a data.'); return }
    setSaving(true)
    try {
      const prazo = await criarPrazo({
        titulo:     titulo.trim(),
        data_prazo: data,
        hora:       hora || null,
        tipo,
        descricao:  descricao.trim() || undefined,
        caso_id:    casoId || undefined,
      })
      const casoTitulo = casos.find(c => c.id === casoId)?.titulo ?? null
      toast.success('Prazo salvo')
      onSalvo({ ...prazo, caso_titulo: casoTitulo })
    } catch {
      toast.error('Erro ao salvar. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-[14px] font-semibold">Novo prazo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">Título *</label>
            <input
              autoFocus
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Audiência de instrução"
              className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground font-medium">Data *</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground font-medium">
                Horário <span className="text-muted-foreground/50">(opcional)</span>
              </label>
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as PrazoTipo)}
              className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition"
            >
              {(Object.entries(PRAZO_TIPO_LABEL) as [PrazoTipo, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">Caso (opcional)</label>
            <select
              value={casoId}
              onChange={e => setCasoId(e.target.value)}
              className="w-full h-9 px-3 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition"
            >
              <option value="">— Nenhum —</option>
              {casos.map(c => (
                <option key={c.id} value={c.id}>{c.titulo}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">Descrição (opcional)</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={2}
              placeholder="Detalhes adicionais…"
              className="w-full px-3 py-2 rounded-[6px] border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 border border-border rounded-[6px] text-[13px] text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 h-9 bg-primary text-primary-foreground rounded-[6px] text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {saving ? 'Salvando…' : 'Salvar prazo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const today = new Date()
  const [year,     setYear]     = useState(today.getFullYear())
  const [month,    setMonth]    = useState(today.getMonth())
  const [prazos,   setPrazos]   = useState<PrazoComCaso[]>([])
  const [casos,    setCasos]    = useState<Caso[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [modal,    setModal]    = useState<string | null>(null) // data pré-selecionada ao abrir modal

  useEffect(() => {
    Promise.all([
      listarTodosPrazos(),
      listarCasos(),
    ]).then(([ps, cs]) => {
      setPrazos(ps)
      setCasos(cs.filter(c => ['active', 'pending', 'suspended'].includes(c.status)))
      setLoading(false)
    })
  }, [])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  function abrirModal(iso?: string) {
    setModal(iso ?? isoDate(today))
  }

  function handleSalvo(p: PrazoComCaso) {
    setPrazos(prev => [...prev, p].sort((a, b) => a.data_prazo.localeCompare(b.data_prazo)))
    setModal(null)
  }

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const prazosByDay: Record<string, PrazoComCaso[]> = {}
  for (const p of prazos) {
    if (!prazosByDay[p.data_prazo]) prazosByDay[p.data_prazo] = []
    prazosByDay[p.data_prazo].push(p)
  }

  const todayIso      = isoDate(today)
  const prazosDoMes   = prazos.filter(p => {
    const [y, m] = p.data_prazo.split('-').map(Number)
    return y === year && m === month + 1
  })
  const prazosSelected = selected ? (prazosByDay[selected] ?? []) : null

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} />
          </button>
          <h1 className="text-base font-semibold min-w-[180px] text-center">
            {MONTHS[month]} {year}
          </h1>
          <button onClick={nextMonth} className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null) }}
            className="px-3 h-7 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => abrirModal(selected ?? undefined)}
            className="flex items-center gap-1.5 px-3 h-7 bg-primary text-primary-foreground rounded-[5px] text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={12} /> Novo prazo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_300px] gap-4">

          {/* Grade */}
          <div className="border rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b bg-muted/30">
              {WEEKDAYS.map(w => (
                <div key={w} className="py-2 text-center text-[11px] font-medium text-muted-foreground">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="min-h-[88px] border-b border-r last:border-r-0 bg-muted/10" />
                const iso       = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayPrazos = prazosByDay[iso] ?? []
                const isToday   = iso === todayIso
                const isSel     = iso === selected

                return (
                  <button
                    key={iso}
                    onClick={() => setSelected(isSel ? null : iso)}
                    onDoubleClick={() => abrirModal(iso)}
                    title="Clique para ver · Duplo clique para novo prazo"
                    className={cn(
                      'min-h-[88px] border-b border-r last:border-r-0 p-1.5 text-left flex flex-col gap-1 transition-colors',
                      isSel ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : 'hover:bg-muted/30',
                    )}
                  >
                    <span className={cn(
                      'text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full',
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                    )}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                      {dayPrazos.slice(0, 2).map(p => (
                        <div key={p.id} className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded border truncate',
                          isOverdue(p) ? 'bg-destructive/10 text-destructive border-destructive/20' : TIPO_COLOR[p.tipo],
                          p.status === 'done' && 'opacity-50',
                        )}>
                          {p.titulo}
                        </div>
                      ))}
                      {dayPrazos.length > 2 && (
                        <span className="text-[10px] text-muted-foreground px-1">+{dayPrazos.length - 2} mais</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Painel lateral */}
          <div className="space-y-3">
            <div className="border rounded-xl p-4 space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Legenda</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PRAZO_TIPO_LABEL) as PrazoTipo[]).map(t => (
                  <Badge key={t} className={cn('text-[10px] border', TIPO_COLOR[t])} variant="outline">
                    {PRAZO_TIPO_LABEL[t]}
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                Duplo clique em um dia para adicionar prazo
              </p>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
                <p className="text-[12px] font-medium">
                  {selected
                    ? `${String(Number(selected.split('-')[2])).padStart(2, '0')} de ${MONTHS[month]}`
                    : `${MONTHS[month]} · ${prazosDoMes.length} prazo${prazosDoMes.length !== 1 ? 's' : ''}`
                  }
                </p>
                <button
                  onClick={() => abrirModal(selected ?? undefined)}
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="Novo prazo"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="divide-y max-h-[440px] overflow-y-auto">
                {(prazosSelected ?? prazosDoMes).length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <CalendarDays size={22} className="text-muted-foreground/30" />
                    <p className="text-[12px] text-muted-foreground">
                      {selected ? 'Nenhum prazo neste dia.' : 'Nenhum prazo neste mês.'}
                    </p>
                    <button
                      onClick={() => abrirModal(selected ?? undefined)}
                      className="text-[11px] text-primary hover:underline"
                    >
                      + Adicionar prazo
                    </button>
                  </div>
                ) : (
                  (prazosSelected ?? prazosDoMes).map(p => (
                    <div key={p.id} className="px-4 py-3 flex items-start gap-2.5">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                        isOverdue(p) ? 'bg-destructive' : STATUS_DOT[p.status],
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-[12px] font-medium truncate',
                          p.status === 'done' && 'line-through text-muted-foreground',
                        )}>
                          {p.titulo}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {!selected && (
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(p.data_prazo + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                          {p.hora && (
                            <span className="text-[10px] text-muted-foreground font-mono">{p.hora}</span>
                          )}
                          <Badge className={cn('text-[10px] border', TIPO_COLOR[p.tipo])} variant="outline">
                            {PRAZO_TIPO_LABEL[p.tipo]}
                          </Badge>
                          {isOverdue(p) && <span className="text-[10px] text-destructive font-medium">Atrasado</span>}
                        </div>
                        {p.caso_titulo && p.caso_id && (
                          <Link href={`/casos/${p.caso_id}`} className="text-[10px] text-primary hover:underline truncate block mt-0.5">
                            {p.caso_titulo}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo prazo */}
      {modal !== null && (
        <NovoPrazoModal
          dataInicial={modal}
          casos={casos}
          onClose={() => setModal(null)}
          onSalvo={handleSalvo}
        />
      )}
    </div>
  )
}
