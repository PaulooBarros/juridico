'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Search, FileText, Upload, File } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/features/shared/empty-state'
import { documentos } from '@/lib/mock'
import { formatDate, formatBytes, formatDocType } from '@/lib/utils'
import type { DocumentType } from '@/lib/types'

const DOC_TYPES: Array<{ value: DocumentType | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'peticao', label: 'Petições' },
  { value: 'contrato', label: 'Contratos' },
  { value: 'procuracao', label: 'Procurações' },
  { value: 'sentenca', label: 'Sentenças' },
  { value: 'recurso', label: 'Recursos' },
  { value: 'laudo', label: 'Laudos' },
  { value: 'comprovante', label: 'Comprovantes' },
  { value: 'outro', label: 'Outros' },
]

function DocIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    peticao: 'text-blue-600 dark:text-blue-400',
    contrato: 'text-purple-600 dark:text-purple-400',
    procuracao: 'text-indigo-600 dark:text-indigo-400',
    sentenca: 'text-red-600 dark:text-red-400',
    recurso: 'text-orange-600 dark:text-orange-400',
    laudo: 'text-emerald-600 dark:text-emerald-400',
    comprovante: 'text-teal-600 dark:text-teal-400',
    outro: 'text-zinc-500',
  }
  return <File size={18} className={colors[type] ?? 'text-zinc-500'} />
}

export default function DocumentosPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<DocumentType | 'all'>('all')

  const filtered = documentos.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.clientName?.toLowerCase().includes(search.toLowerCase()) || d.caseName?.toLowerCase().includes(search.toLowerCase())
    const matchType = type === 'all' || d.type === type
    return matchSearch && matchType
  })

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {DOC_TYPES.slice(0, 5).map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value as any)}
              className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                type === t.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_80px_100px_80px] gap-0 border-b bg-muted/30">
          {['Documento', 'Cliente', 'Caso', 'Tipo', 'Data', 'Tamanho'].map((h) => (
            <div key={h} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum documento encontrado"
            description="Tente ajustar os filtros ou faça upload de um documento."
          />
        ) : (
          <div className="divide-y">
            {filtered.map((doc) => (
              <Link
                key={doc.id}
                href={`/documentos/${doc.id}`}
                className="grid grid-cols-[2.5fr_1.5fr_1.5fr_80px_100px_80px] gap-0 hover:bg-muted/30 transition-colors group"
              >
                <div className="px-4 py-3 flex items-center gap-2.5">
                  <DocIcon type={doc.type} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{doc.filename}</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{doc.clientName ?? '—'}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{doc.caseName ? doc.caseName.slice(0, 30) + (doc.caseName.length > 30 ? '…' : '') : '—'}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <Badge variant="muted" className="text-[10px]">{formatDocType(doc.type)}</Badge>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-[10px] text-muted-foreground">{formatDate(doc.createdAt)}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground">{formatBytes(doc.size)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} documento{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
