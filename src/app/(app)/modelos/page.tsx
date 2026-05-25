'use client'
import { useState } from 'react'
import { Search, FileStack, Clock, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { modelos } from '@/lib/mock'
import { formatDate, formatArea } from '@/lib/utils'

const CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'peticoes', label: 'Petições' },
  { value: 'contratos', label: 'Contratos' },
  { value: 'procuracoes', label: 'Procurações' },
  { value: 'correspondencias', label: 'Correspondências' },
  { value: 'outros', label: 'Outros' },
]

const CATEGORY_COLORS: Record<string, string> = {
  peticoes: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  contratos: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
  procuracoes: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10',
  correspondencias: 'text-teal-600 dark:text-teal-400 bg-teal-500/10',
  outros: 'text-zinc-500 bg-zinc-500/10',
}

export default function ModelosPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = modelos.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || m.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar modelos..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                category === c.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-xs text-muted-foreground">
          <FileStack size={32} className="mx-auto mb-3 opacity-30" />
          Nenhum modelo encontrado.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((modelo) => (
            <Card key={modelo.id} className="hover:border-primary/40 transition-colors cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${CATEGORY_COLORS[modelo.category] ?? 'bg-muted text-muted-foreground'}`}>
                    <FileStack size={15} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Star size={10} className="text-amber-500" />
                    {modelo.usageCount}×
                  </div>
                </div>
                <h3 className="text-xs font-semibold mb-1 group-hover:text-primary transition-colors leading-snug">{modelo.name}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">{modelo.description}</p>
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  <Badge variant="muted" className="text-[10px]">{CATEGORIES.find(c => c.value === modelo.category)?.label}</Badge>
                  {modelo.area && <Badge variant="muted" className="text-[10px]">{formatArea(modelo.area)}</Badge>}
                </div>
                {modelo.tags && (
                  <div className="flex flex-wrap gap-1">
                    {modelo.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{formatDate(modelo.updatedAt)}</span>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">Usar modelo</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{filtered.length} modelo{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
