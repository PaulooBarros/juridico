import Link from 'next/link'
import { headers } from 'next/headers'
import { ArrowRight, Briefcase, Clock, DollarSign } from 'lucide-react'
import { StatsCard } from '@/features/shared/stats-card'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { EmptyState } from '@/features/shared/empty-state'
import { RevenueChart, type RevenueDataPoint } from '@/components/dashboard/revenue-chart'
import { CasesAreaChart, type AreaDataPoint } from '@/components/dashboard/cases-area-chart'
import { createClient } from '@/lib/supabase/server'
import { formatArea, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/lib/auth'

const PRAZO_TIPO_LABEL: Record<string, string> = {
  prazo:     'Prazo',
  audiencia: 'Audiência',
  reuniao:   'Reunião',
  protocolo: 'Protocolo',
  recurso:   'Recurso',
  outro:     'Outro',
}

const PRAZO_TIPO_COLOR: Record<string, string> = {
  prazo:     'bg-red-500/10 text-red-700 dark:text-red-400',
  audiencia: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  reuniao:   'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  protocolo: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  recurso:   'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  outro:     'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
}

const TRANSACAO_STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-600 dark:text-amber-400',
  overdue: 'text-destructive',
  paid:    'text-emerald-600 dark:text-emerald-400',
}

const TRANSACAO_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  overdue: 'Em atraso',
  paid:    'Pago',
}

function toLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default async function DashboardPage() {
  // ── 1. Obter userId e escritorio_id do usuário logado ─────────────────────
  const session = await auth.api.getSession({ headers: headers() })
  const userId  = session?.user?.id ?? null

  // createClient(userId) injeta x-user-id → ativa RLS sem precisar de service role
  const supabase = createClient(userId ?? undefined)

  let escritorioId: string | null = null
  if (userId) {
    const { data: membro } = await supabase
      .from('membros')
      .select('escritorio_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    escritorioId = membro?.escritorio_id ?? null
  }

  if (!escritorioId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Nenhum escritório associado à sua conta.</p>
      </div>
    )
  }

  // ── 2. Datas de referência ────────────────────────────────────────────────
  const today      = new Date().toISOString().split('T')[0]
  const em7dias    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const ha6meses   = new Date(new Date().setMonth(new Date().getMonth() - 5))
  ha6meses.setDate(1)
  const ha6mesesISO = ha6meses.toISOString().split('T')[0]

  // ── 3. Todas as queries paralelas, filtradas por escritorio_id ────────────
  const [
    { count: casosAtivos },
    { count: clientesAtivos },
    { count: prazosCriticos },
    { data: casosRecentes },
    { data: prazosData },
    { data: financeiroData },
    { data: receitaData },
    { data: casosParaArea },
  ] = await Promise.all([
    supabase
      .from('casos')
      .select('*', { count: 'exact', head: true })
      .eq('escritorio_id', escritorioId)
      .eq('status', 'active'),

    supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('escritorio_id', escritorioId)
      .eq('status', 'active'),

    // Prazos críticos = pendentes vencendo em até 7 dias (inclui atrasados)
    supabase
      .from('prazos')
      .select('*', { count: 'exact', head: true })
      .eq('escritorio_id', escritorioId)
      .eq('status', 'pending')
      .lte('data_prazo', em7dias),

    supabase
      .from('casos')
      .select('id, titulo, numero, area, status, clientes(name)')
      .eq('escritorio_id', escritorioId)
      .order('created_at', { ascending: false })
      .limit(6),

    // Próximos 5 prazos pendentes a partir de hoje
    supabase
      .from('prazos')
      .select('id, titulo, data_prazo, tipo, status, caso_id, casos(titulo)')
      .eq('escritorio_id', escritorioId)
      .eq('status', 'pending')
      .gte('data_prazo', today)
      .order('data_prazo', { ascending: true })
      .limit(5),

    // Transações pendentes/atrasadas — sem limit para somar corretamente
    supabase
      .from('transacoes')
      .select('id, descricao, valor, status, vencimento, tipo, clientes(name)')
      .eq('escritorio_id', escritorioId)
      .in('status', ['pending', 'overdue'])
      .order('vencimento', { ascending: true }),

    // Receita dos últimos 6 meses (pagas)
    supabase
      .from('transacoes')
      .select('valor, pago_em')
      .eq('escritorio_id', escritorioId)
      .eq('status', 'paid')
      .not('pago_em', 'is', null)
      .gte('pago_em', ha6mesesISO),

    // Casos ativos para gráfico de área
    supabase
      .from('casos')
      .select('area')
      .eq('escritorio_id', escritorioId)
      .eq('status', 'active'),
  ])

  // ── 4. Processar dados ────────────────────────────────────────────────────
  const recentes = (casosRecentes ?? []).map((c: any) => ({
    ...c,
    cliente_nome: c.clientes?.name ?? null,
  }))

  const proxPrazos = (prazosData ?? []).map((p: any) => ({
    ...p,
    caso_titulo: p.casos?.titulo ?? null,
  }))

  const transacoesPendentes = (financeiroData ?? []).map((t: any) => ({
    ...t,
    cliente_nome: t.clientes?.name ?? null,
  }))

  const totalAReceber = transacoesPendentes
    .filter((t: any) => t.status === 'pending')
    .reduce((s: number, t: any) => s + Number(t.valor), 0)

  const totalAtrasado = transacoesPendentes
    .filter((t: any) => t.status === 'overdue')
    .reduce((s: number, t: any) => s + Number(t.valor), 0)

  const totalFinanceiro = totalAReceber + totalAtrasado

  // ── Dados para gráfico de receita (últimos 6 meses) ───────────────────────
  const revenueChartData: RevenueDataPoint[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    return {
      mes: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      total: 0,
    }
  })
  for (const t of receitaData ?? []) {
    if (!t.pago_em) continue
    const key = (t.pago_em as string).slice(0, 7)
    const ponto = revenueChartData.find(p => (p as any).key === key)
    if (ponto) ponto.total += Number(t.valor)
  }

  // ── Dados para gráfico de casos por área ─────────────────────────────────
  const areaCounts: Record<string, number> = {}
  for (const c of casosParaArea ?? []) {
    areaCounts[c.area] = (areaCounts[c.area] ?? 0) + 1
  }
  const areaChartData: AreaDataPoint[] = Object.entries(areaCounts)
    .map(([area, count]) => ({ area: formatArea(area as any), count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
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
          value={prazosCriticos ?? 0}
          variant={(prazosCriticos ?? 0) > 0 ? 'warning' : undefined}
          description="vencendo em 7 dias"
        />
        <StatsCard
          title="A Receber"
          value={formatCurrency(totalFinanceiro)}
          variant={totalAtrasado > 0 ? 'warning' : undefined}
          description={totalAtrasado > 0 ? `${formatCurrency(totalAtrasado)} em atraso` : 'sem atrasos'}
        />
      </div>

      {/* ── Gráficos ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">

        {/* Receita mensal */}
        <div className="bg-card border border-border rounded-[8px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-medium">Receita Recebida</h2>
            <span className="text-[11px] text-muted-foreground">últimos 6 meses</span>
          </div>
          <div className="px-4 py-4">
            <RevenueChart data={revenueChartData} />
          </div>
        </div>

        {/* Casos por área */}
        <div className="bg-card border border-border rounded-[8px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-medium">Casos por Área</h2>
            <span className="text-[11px] text-muted-foreground">ativos</span>
          </div>
          <div className="px-4 py-4">
            <CasesAreaChart data={areaChartData} />
          </div>
        </div>

      </div>

      {/* ── Casos recentes ───────────────────────────────────────────────── */}
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
            {recentes.map((caso: any) => (
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

      {/* ── Prazos e Financeiro ──────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Próximos Prazos */}
        <div className="bg-card border border-border rounded-[8px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-medium">Próximos Prazos</h2>
            <Link href="/calendario" className="text-[12px] text-primary hover:underline flex items-center gap-1">
              Ver calendário <ArrowRight size={11} />
            </Link>
          </div>

          {proxPrazos.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Sem prazos próximos"
              description="Nenhum prazo pendente a partir de hoje."
            />
          ) : (
            <div className="divide-y divide-border">
              {proxPrazos.map((p: any) => {
                const data    = toLocalDate(p.data_prazo)
                const diffDays = Math.round((data.getTime() - new Date(new Date().toDateString()).getTime()) / 86400000)
                const urgente  = diffDays <= 3
                return (
                  <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{p.titulo}</p>
                      {p.caso_titulo && p.caso_id ? (
                        <Link href={`/casos/${p.caso_id}`} className="text-[10px] text-primary hover:underline truncate block">
                          {p.caso_titulo}
                        </Link>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">Sem caso vinculado</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-medium ${urgente ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {diffDays === 0 ? 'Hoje' : diffDays === 1 ? 'Amanhã' : `em ${diffDays}d`}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${PRAZO_TIPO_COLOR[p.tipo] ?? PRAZO_TIPO_COLOR.outro}`}>
                        {PRAZO_TIPO_LABEL[p.tipo] ?? p.tipo}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Financeiro */}
        <div className="bg-card border border-border rounded-[8px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-[16px] font-medium">A Receber</h2>
            <Link href="/financeiro" className="text-[12px] text-primary hover:underline flex items-center gap-1">
              Ver lançamentos <ArrowRight size={11} />
            </Link>
          </div>

          {transacoesPendentes.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Sem pendências"
              description="Nenhum lançamento pendente ou em atraso."
            />
          ) : (
            <div className="divide-y divide-border">
              {transacoesPendentes.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{t.descricao}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.cliente_nome ?? '—'}
                      {t.vencimento ? ` · vence ${toLocalDate(t.vencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[12px] font-semibold ${TRANSACAO_STATUS_COLOR[t.status] ?? ''}`}>
                      {formatCurrency(Number(t.valor))}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.status === 'overdue' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                      {TRANSACAO_STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
