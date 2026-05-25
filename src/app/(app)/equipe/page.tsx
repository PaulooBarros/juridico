import { User, Shield, Mail, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { equipe } from '@/lib/mock'
import { formatDate, formatRole, getInitials } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-primary/10 text-primary border-primary/20',
  admin: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  lawyer: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  assistant: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
}

export default function EquipePage() {
  const active = equipe.filter(m => m.active)
  const inactive = equipe.filter(m => !m.active)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: equipe.length },
          { label: 'Ativos', value: active.length },
          { label: 'Advogados', value: equipe.filter(m => m.role === 'lawyer' || m.role === 'owner').length },
          { label: 'Assistentes', value: equipe.filter(m => m.role === 'assistant' || m.role === 'admin').length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Membros ativos</p>
          <p className="text-xs text-muted-foreground">{active.length} membros</p>
        </div>
        <div className="divide-y">
          {active.map((membro) => (
            <div key={membro.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarFallback>{getInitials(membro.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{membro.name}</p>
                  {membro.oab && (
                    <span className="text-[10px] text-muted-foreground font-mono">{membro.oab}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Mail size={11} className="text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">{membro.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} className="text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Desde {formatDate(membro.joinedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  className={`text-[10px] border ${ROLE_COLORS[membro.role]}`}
                  variant="outline"
                >
                  {formatRole(membro.role)}
                </Badge>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Ativo" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles info */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground">Permissões por função</p>
        </div>
        <div className="divide-y">
          {[
            { role: 'owner', permissions: ['Todos os módulos', 'Faturamento', 'Exclusão de dados', 'Gestão de planos', 'Transferência de titularidade'] },
            { role: 'admin', permissions: ['Todos os módulos', 'Faturamento', 'Exclusão de dados', 'Gestão de membros'] },
            { role: 'lawyer', permissions: ['Clientes', 'Casos', 'Documentos', 'Calendário', 'Modelos', 'Financeiro (leitura)'] },
            { role: 'assistant', permissions: ['Clientes (leitura)', 'Documentos', 'Calendário', 'Modelos'] },
          ].map((row) => (
            <div key={row.role} className="flex items-start gap-4 px-5 py-3">
              <Badge className={`text-[10px] border shrink-0 ${ROLE_COLORS[row.role]}`} variant="outline">
                {formatRole(row.role)}
              </Badge>
              <div className="flex flex-wrap gap-1">
                {row.permissions.map((p) => (
                  <span key={p} className="text-[11px] text-muted-foreground after:content-['·'] after:mx-1 last:after:content-['']">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
