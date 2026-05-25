'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  listarTodosPrazos, type PrazoComCaso, type PrazoTipo, type PrazoStatus,
  PRAZO_TIPO_LABEL,
} from '@/lib/supabase/prazos'

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
const MONTHS   = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function toLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isOverdue(p: PrazoComCaso) {
  return p.status === 'pending' && toLocalDate(p.data_prazo) < new Date(new Date().toDateString())
}

export default function CalendarioPage() {
  const today = new Date()
  const [year,     setYear]     = useState(today.getFullYear())
  const [month,    setMonth]    = useState(today.getMonth())
  const [prazos,   setPrazos]   = useState<PrazoComCaso[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    listarTodosPrazos().then(data => { setPrazos(data); setLoading(false) })
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

  const todayIso   = isoDate(today)
  const prazosDoMes = prazos.filter(p => {
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
        <button
          onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null) }}
          className="px-3 h-7 border border-border rounded-[5px] text-xs text-muted-foreground hover:bg-accent transition-colors"
        >
          Hoje
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_300px] gap-4">

          {/* Grade do calendário */}
          <div className="border rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b bg-muted/30">
              {WEEKDAYS.map(w => (
                <div key={w} className="py-2 text-center text-[11px] font-medium text-muted-foreground">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) {
                  return <div key={`e-${i}`} className="min-h-[88px] border-b border-r last:border-r-0 bg-muted/10" />
                }
                const iso        = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayPrazos  = prazosByDay[iso] ?? []
                const isToday    = iso === todayIso
                const isSel      = iso === selected

                return (
                  <button
                    key={iso}
                    onClick={() => setSelected(isSel ? null : iso)}
                    className={`min-h-[88px] border-b border-r last:border-r-0 p-1.5 text-left flex flex-col gap-1 transition-colors
                      ${isSel ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : 'hover:bg-muted/30'}
                    `}
                  >
                    <span className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                    `}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                      {dayPrazos.slice(0, 2).map(p => (
                        <div key={p.id} className={`text-[10px] px-1.5 py-0.5 rounded border truncate
                          ${isOverdue(p) ? 'bg-destructive/10 text-destructive border-destructive/20' : TIPO_COLOR[p.tipo]}
                          ${p.status === 'done' ? 'opacity-50' : ''}
                        `}>
                          {p.titulo}
                        </div>
                      ))}
                      {dayPrazos.length > 2 && (
                        <span className="text-[10px] text-muted-foreground px-1">
                          +{dayPrazos.length - 2} mais
                        </span>
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
                  <Badge key={t} className={`text-[10px] border ${TIPO_COLOR[t]}`} variant="outline">
                    {PRAZO_TIPO_LABEL[t]}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/20">
                <p className="text-[12px] font-medium">
                  {selected
                    ? `${String(Number(selected.split('-')[2])).padStart(2, '0')} de ${MONTHS[month]}`
                    : `${MONTHS[month]} · ${prazosDoMes.length} prazo${prazosDoMes.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
              <div className="divide-y max-h-[440px] overflow-y-auto">
                {(prazosSelected ?? prazosDoMes).length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <CalendarDays size={22} className="text-muted-foreground/30" />
                    <p className="text-[12px] text-muted-foreground">
                      {selected ? 'Nenhum prazo neste dia.' : 'Nenhum prazo neste mês.'}
                    </p>
                  </div>
                ) : (
                  (prazosSelected ?? prazosDoMes).map(p => (
                    <div key={p.id} className="px-4 py-3 flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isOverdue(p) ? 'bg-destructive' : STATUS_DOT[p.status]}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-medium truncate ${p.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {p.titulo}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {!selected && (
                            <span className="text-[10px] text-muted-foreground">
                              {toLocalDate(p.data_prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                          <Badge className={`text-[10px] border ${TIPO_COLOR[p.tipo]}`} variant="outline">
                            {PRAZO_TIPO_LABEL[p.tipo]}
                          </Badge>
                          {isOverdue(p) && (
                            <span className="text-[10px] text-destructive font-medium">Atrasado</span>
                          )}
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
    </div>
  )
}
