import Link from 'next/link'
import { ArrowRight, Briefcase, Users, DollarSign, Clock } from 'lucide-react'
import { StatsCard } from '@/features/shared/stats-card'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { EmptyState } from '@/features/shared/empty-state'
import { createClient } from '@/lib/supabase/server'
import { formatArea, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { count: casosAtivos },
    { count: clientesAtivos },
    { data: casosRecentes },
  ] = await Promise.all([
    supabase
      .from('casos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('casos')
      .select('id, titulo, numero, area, status, clientes(name)')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const recentes = (casosRecentes ?? []).map((c: any) => ({
    ...c,
    cliente_nome: c.clientes?.name ?? null,
  }))

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Casos Ativos"
          value={casosAtivos ?? 0}
          description="processos em andamento"
        />
        <StatsCard
          title="Clientes Ativos"
          value={clientesAtivos ?? 0}
          description="clientes em carteira"
        />
        <StatsCard
          title="Prazos Críticos"
          value={0}
          variant="warning"
          description="em breve disponível"
        />
        <StatsCard
          title="A Receber"
          value={formatCurrency(0)}
          variant="warning"
          description="em breve disponível"
        />
      </div>

      {/* Casos recentes */}
      <div className="bg-card border border-border rounded-[8px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-[16px] font-medium">Casos Recentes</h2>
          <Link href="/casos" className="text-[12px] text-primary hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={11} />
          </Link>
        </div>

        {recentes.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Nenhum caso cadastrado"
            description='Vá para "Casos" e crie o primeiro caso do escritório.'
          />
        ) : (
          <div className="divide-y divide-border">
            {recentes.map((caso) => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-accent transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate group-hover:text-primary transition-colors">
                    {caso.titulo}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">
                    {caso.cliente_nome ?? '—'}{caso.numero ? ` · ${caso.numero}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="muted" className="text-[10px]">{formatArea(caso.area)}</Badge>
                  <CaseStatusBadge status={caso.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Seções em breve */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-[8px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-medium">Próximos Prazos</h2>
            <Link href="/calendario" className="text-[12px] text-primary hover:underline flex items-center gap-1">
              Ver calendário <ArrowRight size={11} />
            </Link>
          </div>
          <EmptyState
            icon={Clock}
            title="Em breve"
            description="O módulo de prazos será integrado na próxima etapa."
          />
        </div>

        <div className="bg-card border border-border rounded-[8px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-medium">Financeiro</h2>
            <Link href="/financeiro" className="text-[12px] text-primary hover:underline flex items-center gap-1">
              Ver lançamentos <ArrowRight size={11} />
            </Link>
          </div>
          <EmptyState
            icon={DollarSign}
            title="Em breve"
            description="O módulo financeiro será integrado na próxima etapa."
          />
        </div>
      </div>
    </div>
  )
}
