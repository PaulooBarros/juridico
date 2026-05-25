'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Search, Briefcase } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { EmptyState } from '@/features/shared/empty-state'
import { casos } from '@/lib/mock'
import { formatArea, formatPhase, formatDate, formatCurrency } from '@/lib/utils'
import type { CaseArea, CaseStatus } from '@/lib/types'

const AREAS: Array<{ value: CaseArea | 'all'; label: string }> = [
  { value: 'all', label: 'Todas as áreas' },
  { value: 'civil', label: 'Cível' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'tributario', label: 'Tributário' },
  { value: 'empresarial', label: 'Empresarial' },
  { value: 'familia', label: 'Família' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'consumidor', label: 'Consumidor' },
  { value: 'previdenciario', label: 'Previdenciário' },
]

const STATUSES: Array<{ value: CaseStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativo' },
  { value: 'pending', label: 'Pendente' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'closed', label: 'Encerrado' },
]

export default function CasosPage() {
  const [search, setSearch] = useState('')
  const [area, setArea] = useState<CaseArea | 'all'>('all')
  const [status, setStatus] = useState<CaseStatus | 'all'>('all')

  const filtered = casos.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.clientName.toLowerCase().includes(search.toLowerCase()) || c.number.includes(search)
    const matchArea = area === 'all' || c.area === area
    const matchStatus = status === 'all' || c.status === status
    return matchSearch && matchArea && matchStatus
  })

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, título ou cliente..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-xs text-foreground min-w-40"
          value={area}
          onChange={(e) => setArea(e.target.value as any)}
        >
          {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-muted/50 border rounded-md p-1">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value as any)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                status === s.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="grid grid-cols-[2fr_1.5fr_100px_100px_1fr_100px] gap-0 border-b bg-muted/30">
          {['Caso / Número', 'Cliente', 'Área', 'Fase', 'Responsável', 'Status'].map((h) => (
            <div key={h} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="Nenhum caso encontrado" description="Tente ajustar os filtros ou cadastre um novo caso." />
        ) : (
          <div className="divide-y">
            {filtered.map((caso) => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="grid grid-cols-[2fr_1.5fr_100px_100px_1fr_100px] gap-0 hover:bg-muted/30 transition-colors group"
              >
                <div className="px-4 py-3">
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{caso.title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{caso.number}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{caso.clientName}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <Badge variant="muted" className="text-[10px]">{formatArea(caso.area)}</Badge>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <span className="text-xs text-muted-foreground">{formatPhase(caso.phase)}</span>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{caso.assignedNames.join(', ')}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <CaseStatusBadge status={caso.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} caso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
