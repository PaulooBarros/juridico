import Link from 'next/link'
import { Briefcase, AlertTriangle, DollarSign, Users, Clock, ArrowRight } from 'lucide-react'
import { StatsCard } from '@/features/shared/stats-card'
import { PriorityDot } from '@/features/shared/priority-badge'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { casos, prazos, notificacoes, transacoes } from '@/lib/mock'
import { formatDate, formatArea, formatCurrency, daysUntil } from '@/lib/utils'
import { cn } from '@/lib/utils'

const activeCases       = casos.filter(c => c.status === 'active').length
const overduePrazos     = prazos.filter(p => p.status === 'overdue').length
const pendingPrazos     = prazos.filter(p => p.status === 'pending' && p.priority === 'critical').length
const pendingRevenue    = transacoes.filter(t => t.status === 'pending' || t.status === 'overdue').reduce((s, t) => s + t.amount, 0)
const recentCases       = casos.filter(c => c.status === 'active').slice(0, 5)
const urgentPrazos      = prazos.filter(p => p.status !== 'done' && p.status !== 'cancelled').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 6)
const criticalAlerts    = notificacoes.filter(n => !n.read && (n.priority === 'critical' || n.priority === 'high')).slice(0, 3)

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Alertas críticos */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-1.5">
          {criticalAlerts.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-3 px-4 py-2.5 rounded-[5px] border text-[13px]',
                n.priority === 'critical'
                  ? 'bg-destructive/5 border-destructive/20 text-destructive'
                  : 'bg-warning/5 border-warning/20 text-warning'
              )}
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{n.title}</span>
                <span className="text-[12px] opacity-75 ml-2 truncate">{n.message}</span>
              </div>
              {n.link && (
                <Link href={n.link} className="text-[12px] font-medium hover:underline shrink-0">Ver →</Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Casos Ativos"
          value={activeCases}
          description="processos em andamento"
          trend={{ value: 8, label: 'vs. mês ant.' }}
        />
        <StatsCard
          title="Prazos Críticos"
          value={pendingPrazos + overduePrazos}
          variant={pendingPrazos + overduePrazos > 3 ? 'critical' : pendingPrazos + overduePrazos > 0 ? 'warning' : 'default'}
          description={`${overduePrazos} vencido${overduePrazos !== 1 ? 's' : ''}`}
        />
        <StatsCard
          title="A Receber"
          value={formatCurrency(pendingRevenue)}
          variant="warning"
          description="honorários pendentes"
        />
        <StatsCard
          title="Clientes Ativos"
          value={10}
          description="clientes em carteira"
          trend={{ value: 15, label: 'vs. mês ant.' }}
        />
      </div>

      {/* Prazos urgentes + Casos recentes */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Prazos */}
        <div className="bg-card border border-border rounded-[8px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-medium">Próximos Prazos</h2>
            <Link href="/calendario" className="text-[12px] text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {urgentPrazos.map((prazo) => {
              const days     = daysUntil(prazo.dueDate)
              const isOverdue = days < 0
              const isUrgent  = days <= 3 && !isOverdue

              return (
                <div key={prazo.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-accent transition-colors">
                  <PriorityDot priority={prazo.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{prazo.title}</p>
                    {prazo.clientName && (
                      <p className="font-mono text-[10px] text-muted-foreground truncate">{prazo.clientName}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      'font-mono text-[12px] font-medium',
                      isOverdue ? 'text-destructive' : isUrgent ? 'text-warning' : 'text-muted-foreground'
                    )}>
                      {isOverdue ? `${Math.abs(days)}d atraso` : days === 0 ? 'Hoje' : `${days}d`}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">{formatDate(prazo.dueDate)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Casos recentes */}
        <div className="bg-card border border-border rounded-[8px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-medium">Casos Recentes</h2>
            <Link href="/casos" className="text-[12px] text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentCases.map((caso) => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-accent transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate group-hover:text-primary transition-colors">{caso.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{caso.clientName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[3px] border border-border bg-muted text-muted-foreground">
                    {formatArea(caso.area)}
                  </span>
                  <CaseStatusBadge status={caso.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
