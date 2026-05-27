'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, ArrowRight, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { listarCasos, type Caso } from '@/lib/supabase/casos'
import { formatArea, formatDate } from '@/lib/utils'

interface CasosSectionProps {
  clienteId: string
}

export function CasosSection({ clienteId }: CasosSectionProps) {
  const [casos,   setCasos]   = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const todos = await listarCasos()
      setCasos(todos.filter(c => c.cliente_id === clienteId))
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = casos.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.titulo.toLowerCase().includes(q) ||
      c.numero?.toLowerCase().includes(q) ||
      formatArea(c.area).toLowerCase().includes(q)
    )
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase size={14} /> Casos
            {!loading && casos.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground">({casos.length})</span>
            )}
          </CardTitle>
          <Link href="/casos" className="text-xs text-primary hover:underline">
            Ver todos
          </Link>
        </div>

        {/* Busca — só aparece quando há casos */}
        {!loading && casos.length > 0 && (
          <div className="relative mt-2">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título, número ou área…"
              className="w-full h-8 pl-8 pr-3 rounded-[6px] border border-border bg-background text-[12px] outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-muted-foreground/60"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-6 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : casos.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Nenhum caso vinculado a este cliente.
          </p>
        ) : filtrados.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Nenhum caso encontrado para "{search}".
          </p>
        ) : (
          <div className="divide-y -mx-5">
            {filtrados.slice(0, 8).map(caso => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                    {caso.titulo}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatArea(caso.area)}
                    {caso.numero ? ` · ${caso.numero}` : ''}
                    {` · ${formatDate(caso.created_at)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CaseStatusBadge status={caso.status} />
                  <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
            {filtrados.length > 8 && (
              <div className="px-5 py-2.5">
                <Link href="/casos" className="text-xs text-primary hover:underline">
                  Ver mais {filtrados.length - 8} caso{filtrados.length - 8 !== 1 ? 's' : ''}
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
