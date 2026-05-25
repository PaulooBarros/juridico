'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PriorityDot } from '@/features/shared/priority-badge'
import { prazos } from '@/lib/mock'
import { formatDate, formatDeadlineType, daysUntil } from '@/lib/utils'
import { cn } from '@/lib/utils'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function CalendarioPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const getEventsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dateStr = date.toISOString().split('T')[0]
    return prazos.filter(p => p.dueDate.startsWith(dateStr) && p.status !== 'cancelled')
  }

  const upcomingPrazos = prazos
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 8)

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 animate-fade-in">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{MONTHS[currentMonth]} {currentYear}</CardTitle>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()) }}
                className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Hoje
              </button>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-r border-b bg-muted/20 last:border-r-0" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
              const events = getEventsForDay(day)
              const dayOfWeek = (firstDay + i) % 7

              return (
                <div
                  key={day}
                  className={cn(
                    'min-h-[80px] p-1.5 border-b flex flex-col gap-1',
                    dayOfWeek === 6 ? 'border-r-0' : 'border-r',
                    dayOfWeek === 0 || dayOfWeek === 6 ? 'bg-muted/10' : ''
                  )}
                >
                  <span className={cn(
                    'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full self-end',
                    isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  )}>
                    {day}
                  </span>
                  {events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] truncate',
                        event.priority === 'critical' ? 'bg-destructive/15 text-destructive' :
                        event.priority === 'high' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' :
                        'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                      )}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <span className="text-[10px] text-muted-foreground px-1">+{events.length - 2}</span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Legenda */}
        <Card>
          <CardHeader><CardTitle>Legenda</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { color: 'bg-destructive', label: 'Prazo fatal / Crítico' },
              { color: 'bg-amber-500', label: 'Audiência / Alto' },
              { color: 'bg-blue-500', label: 'Prazo comum / Médio' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Próximos eventos */}
        <Card>
          <CardHeader><CardTitle>Próximos prazos</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {upcomingPrazos.map((prazo) => {
                const days = daysUntil(prazo.dueDate)
                return (
                  <div key={prazo.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{prazo.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDeadlineType(prazo.type)}</p>
                        {prazo.clientName && <p className="text-[10px] text-muted-foreground truncate">{prazo.clientName}</p>}
                      </div>
                      <PriorityDot priority={prazo.priority} />
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock size={10} className="text-muted-foreground" />
                      <span className={cn(
                        'text-[10px] font-medium',
                        days < 0 ? 'text-destructive' : days <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                      )}>
                        {days < 0 ? `${Math.abs(days)}d atraso` : days === 0 ? 'Hoje' : `${days} dias`}
                      </span>
                      <span className="text-[10px] text-muted-foreground">· {formatDate(prazo.dueDate)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
