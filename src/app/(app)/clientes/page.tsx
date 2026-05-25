'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Search, SlidersHorizontal, Building2, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClientStatusBadge } from '@/features/shared/status-badge'
import { EmptyState } from '@/features/shared/empty-state'
import { clientes } from '@/lib/mock'
import { formatDocument, formatDate } from '@/lib/utils'

type FilterStatus = 'all' | 'active' | 'inactive' | 'prospect'

export default function ClientesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<FilterStatus>('all')

  const filtered = clientes.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.document.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'all' || c.status === status
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 border rounded-md p-1">
          {(['all', 'active', 'inactive', 'prospect'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                status === s ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'inactive' ? 'Inativos' : 'Prospects'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_80px_80px_100px] gap-0 border-b bg-muted/30">
          {['Cliente', 'Documento / Contato', 'Cidade', 'Casos', 'Desde', 'Status'].map((h) => (
            <div key={h} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={User}
            title="Nenhum cliente encontrado"
            description="Tente ajustar os filtros ou adicione um novo cliente."
          />
        ) : (
          <div className="divide-y">
            {filtered.map((cliente) => (
              <Link
                key={cliente.id}
                href={`/clientes/${cliente.id}`}
                className="grid grid-cols-[2fr_1.5fr_1fr_80px_80px_100px] gap-0 hover:bg-muted/30 transition-colors group"
              >
                <div className="px-4 py-3 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {cliente.type === 'pj' ? <Building2 size={13} className="text-muted-foreground" /> : <User size={13} className="text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{cliente.name}</p>
                    <p className="text-[10px] text-muted-foreground">{cliente.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex flex-col justify-center min-w-0">
                  <p className="text-xs font-mono text-muted-foreground truncate">{formatDocument(cliente.document)}</p>
                  {cliente.email && <p className="text-[10px] text-muted-foreground truncate">{cliente.email}</p>}
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{cliente.city}, {cliente.state}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <Badge variant="muted" className="text-[10px]">{cliente.caseCount ?? 0}</Badge>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-[10px] text-muted-foreground">{formatDate(cliente.createdAt)}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <ClientStatusBadge status={cliente.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
