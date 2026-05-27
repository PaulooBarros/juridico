'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Check, AlertCircle, AlertTriangle, CalendarClock, Info, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listarTodosPrazos } from '@/lib/supabase/prazos'
import { formatDateTime, cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Prioridade = 'critical' | 'high' | 'medium' | 'info'

type Notificacao = {
  id:        string
  titulo:    string
  mensagem:  string
  prioridade: Prioridade
  href?:     string
  criadaEm: string
}

// ─── Config visual ────────────────────────────────────────────────────────────

const CONFIG: Record<Prioridade, {
  Icon:   React.ElementType
  label:  string
  iconCn: string
  border: string
  bg:     string
}> = {
  critical: { Icon: AlertCircle,    label: 'Crítico', iconCn: 'text-destructive',                            border: 'border-destructive/20', bg: 'bg-destructive/5'  },
  high:     { Icon: AlertTriangle,  label: 'Alto',    iconCn: 'text-amber-600 dark:text-amber-400',          border: 'border-amber-500/20',   bg: 'bg-amber-500/5'    },
  medium:   { Icon: CalendarClock,  label: 'Médio',   iconCn: 'text-blue-600 dark:text-blue-400',            border: 'border-blue-500/20',    bg: 'bg-blue-500/5'     },
  info:     { Icon: Info,           label: 'Info',    iconCn: 'text-muted-foreground',                       border: 'border-border',         bg: ''                  },
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'notificacoes_lidas_v1'

function getLidas(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set<string>()
  }
}

function salvarLidas(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch {}
}

// ─── Geração de notificações a partir de prazos ───────────────────────────────

function diasAte(data: string): number {
  const diff = new Date(data + 'T12:00:00').getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function NotificacoesPage() {
  const [notifs,  setNotifs]  = useState<Notificacao[]>([])
  const [lidas,   setLidas]   = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLidas(getLidas())

    listarTodosPrazos()
      .then(prazos => {
        const geradas: Notificacao[] = []

        prazos
          .filter(p => p.status === 'pending')
          .forEach(p => {
            const dias = diasAte(p.data_prazo)
            const caso = p.caso_titulo ? ` — ${p.caso_titulo}` : ''

            if (dias < 0) {
              geradas.push({
                id:        `vencido-${p.id}`,
                titulo:    `Prazo vencido: ${p.titulo}`,
                mensagem:  `Venceu há ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''}${caso}. Verifique a situação.`,
                prioridade: 'critical',
                href:      p.caso_id ? `/casos/${p.caso_id}` : '/calendario',
                criadaEm: p.data_prazo + 'T12:00:00',
              })
            } else if (dias <= 3) {
              geradas.push({
                id:        `urgente-${p.id}`,
                titulo:    `Prazo em ${dias === 0 ? 'hoje' : `${dias} dia${dias !== 1 ? 's' : ''}`}: ${p.titulo}`,
                mensagem:  `Atenção imediata necessária${caso}.`,
                prioridade: 'high',
                href:      p.caso_id ? `/casos/${p.caso_id}` : '/calendario',
                criadaEm: p.data_prazo + 'T12:00:00',
              })
            } else if (dias <= 7) {
              geradas.push({
                id:        `proximo-${p.id}`,
                titulo:    `Prazo em ${dias} dias: ${p.titulo}`,
                mensagem:  `Se aproximando${caso}. Planeje com antecedência.`,
                prioridade: 'medium',
                href:      p.caso_id ? `/casos/${p.caso_id}` : '/calendario',
                criadaEm: p.data_prazo + 'T12:00:00',
              })
            }
          })

        const ordem: Record<Prioridade, number> = { critical: 0, high: 1, medium: 2, info: 3 }
        geradas.sort((a, b) => ordem[a.prioridade] - ordem[b.prioridade])
        setNotifs(geradas)
      })
      .finally(() => setLoading(false))
  }, [])

  function marcarLida(id: string) {
    setLidas(prev => {
      const next = new Set(prev)
      next.add(id)
      salvarLidas(next)
      return next
    })
  }

  function marcarTodasLidas() {
    const todas = new Set(notifs.map(n => n.id))
    salvarLidas(todas)
    setLidas(todas)
  }

  const naoLidas = notifs.filter(n => !lidas.has(n.id)).length

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? '…' : `${naoLidas} não lida${naoLidas !== 1 ? 's' : ''}`}
        </p>
        <Button variant="outline" size="sm" onClick={marcarTodasLidas} disabled={naoLidas === 0 || loading}>
          <Check size={13} className="mr-1.5" /> Marcar todas como lidas
        </Button>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={32} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">Nenhuma notificação</p>
          <p className="text-xs text-muted-foreground mt-1">Prazos próximos e vencidos aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const lida = lidas.has(n.id)
            const cfg  = CONFIG[n.prioridade]
            const cls  = cn(
              'flex gap-3 p-4 rounded-lg border transition-all',
              !lida ? `${cfg.bg} ${cfg.border}` : 'bg-card border-border opacity-50',
            )

            const conteudo = (
              <>
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-background border', cfg.border)}>
                  <cfg.Icon size={14} className={cfg.iconCn} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-semibold', !lida && 'text-foreground')}>{n.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.mensagem}</p>
                    </div>
                    {!lida && (
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); marcarLida(n.id) }}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0"
                        title="Marcar como lida"
                      >
                        <Check size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={cn('text-[10px] border', cfg.border)} variant="outline">{cfg.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatDateTime(n.criadaEm)}</span>
                    {!lida && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </div>
              </>
            )

            return n.href ? (
              <Link key={n.id} href={n.href} onClick={() => marcarLida(n.id)} className={cn(cls, 'hover:brightness-95 dark:hover:brightness-110')}>
                {conteudo}
              </Link>
            ) : (
              <div key={n.id} className={cls}>{conteudo}</div>
            )
          })}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Notificações geradas automaticamente a partir dos prazos cadastrados. Estado de leitura salvo neste dispositivo.
      </p>
    </div>
  )
}
