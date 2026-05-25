'use client'
import { useState } from 'react'
import { Bell, Check, Trash2, AlertCircle, Info, AlertTriangle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notificacoes } from '@/lib/mock'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { NotificationPriority } from '@/lib/types'

const PRIORITY_ICONS: Record<NotificationPriority, React.ElementType> = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: Zap,
  info: Info,
}

const PRIORITY_STYLES: Record<NotificationPriority, { icon: string; border: string; bg: string }> = {
  critical: { icon: 'text-destructive', border: 'border-destructive/20', bg: 'bg-destructive/5' },
  high: { icon: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
  medium: { icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
  info: { icon: 'text-muted-foreground', border: 'border-border', bg: '' },
}

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  info: 'Info',
}

export default function NotificacoesPage() {
  const [items, setItems] = useState(notificacoes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))

  const unread = items.filter(n => !n.read).length

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{unread} não lida{unread !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unread === 0}>
            <Check size={13} className="mr-1.5" /> Marcar todas como lidas
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {items.map((n) => {
          const styles = PRIORITY_STYLES[n.priority]
          const Icon = PRIORITY_ICONS[n.priority]

          return (
            <div
              key={n.id}
              className={cn(
                'flex gap-3 p-4 rounded-lg border transition-all',
                !n.read ? `${styles.bg} ${styles.border}` : 'bg-card border-border opacity-60 hover:opacity-80',
              )}
            >
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-background border', styles.border)}>
                <Icon size={14} className={styles.icon} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={cn('text-xs font-semibold', !n.read && 'text-foreground')}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        title="Marcar como lida"
                      >
                        <Check size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    className={cn('text-[10px] border', PRIORITY_STYLES[n.priority].border)}
                    variant="outline"
                    style={{ color: 'inherit' }}
                  >
                    {PRIORITY_LABELS[n.priority]}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16">
          <Bell size={32} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">Nenhuma notificação</p>
        </div>
      )}
    </div>
  )
}
