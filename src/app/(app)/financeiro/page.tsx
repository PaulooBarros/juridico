import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { StatsCard } from '@/features/shared/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionStatusBadge } from '@/features/shared/status-badge'
import { transacoes } from '@/lib/mock'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const paid = transacoes.filter(t => t.status === 'paid')
const pending = transacoes.filter(t => t.status === 'pending')
const overdue = transacoes.filter(t => t.status === 'overdue')

const totalPaid = paid.reduce((s, t) => s + t.amount, 0)
const totalPending = pending.reduce((s, t) => s + t.amount, 0)
const totalOverdue = overdue.reduce((s, t) => s + t.amount, 0)

const TYPE_LABELS: Record<string, string> = {
  honorario: 'Honorários',
  despesa: 'Despesa',
  reembolso: 'Reembolso',
  adiantamento: 'Adiantamento',
}

const TYPE_COLORS: Record<string, string> = {
  honorario: 'text-primary',
  despesa: 'text-destructive',
  reembolso: 'text-emerald-600 dark:text-emerald-400',
  adiantamento: 'text-amber-600 dark:text-amber-400',
}

export default function FinanceiroPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Recebido"
          value={formatCurrency(totalPaid)}
          icon={CheckCircle2}
          variant="success"
          description={`${paid.length} lançamento${paid.length !== 1 ? 's' : ''}`}
        />
        <StatsCard
          title="A Receber"
          value={formatCurrency(totalPending)}
          icon={DollarSign}
          variant="default"
          description={`${pending.length} pendente${pending.length !== 1 ? 's' : ''}`}
        />
        <StatsCard
          title="Em Atraso"
          value={formatCurrency(totalOverdue)}
          icon={AlertTriangle}
          variant="critical"
          description={`${overdue.length} vencido${overdue.length !== 1 ? 's' : ''}`}
        />
        <StatsCard
          title="Total Lançado"
          value={formatCurrency(totalPaid + totalPending + totalOverdue)}
          icon={TrendingUp}
          description="todos os lançamentos"
        />
      </div>

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lançamentos</CardTitle>
            <div className="flex items-center gap-1">
              {['Todos', 'Honorários', 'Despesas'].map((f) => (
                <button key={f} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${f === 'Todos' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[2fr_1.5fr_100px_120px_120px_100px] gap-0 border-b bg-muted/30">
            {['Descrição', 'Cliente / Caso', 'Tipo', 'Vencimento', 'Valor', 'Status'].map((h) => (
              <div key={h} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
            ))}
          </div>
          <div className="divide-y">
            {transacoes.map((t) => (
              <div key={t.id} className="grid grid-cols-[2fr_1.5fr_100px_120px_120px_100px] gap-0 hover:bg-muted/20 transition-colors">
                <div className="px-4 py-3">
                  <p className="text-xs font-medium truncate">{t.description}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground truncate">{t.clientName ?? '—'}</p>
                  {t.caseName && <p className="text-[10px] text-muted-foreground truncate">{t.caseName.slice(0, 25)}…</p>}
                </div>
                <div className="px-4 py-3 flex items-center">
                  <span className={cn('text-xs font-medium', TYPE_COLORS[t.type])}>
                    {TYPE_LABELS[t.type]}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <span className="text-xs text-muted-foreground">{t.dueDate ? formatDate(t.dueDate) : '—'}</span>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <span className={cn(
                    'text-xs font-semibold',
                    t.type === 'despesa' ? 'text-destructive' : 'text-foreground'
                  )}>
                    {t.type === 'despesa' ? '-' : '+'}{formatCurrency(t.amount)}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <TransactionStatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
