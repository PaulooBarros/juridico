'use client'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Search, FileText, Upload, File, Trash2, HardDrive } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/features/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { listarDocumentos, type Documento } from '@/lib/supabase/documentos'
import { formatDate, formatBytes, cn } from '@/lib/utils'
import { UploadDialog } from './upload-dialog'

const DOC_TIPOS = [
  { value: 'all',         label: 'Todos' },
  { value: 'peticao',     label: 'Petições' },
  { value: 'contrato',    label: 'Contratos' },
  { value: 'procuracao',  label: 'Procurações' },
  { value: 'sentenca',    label: 'Sentenças' },
  { value: 'recurso',     label: 'Recursos' },
  { value: 'laudo',       label: 'Laudos' },
  { value: 'comprovante', label: 'Comprovantes' },
  { value: 'outro',       label: 'Outros' },
]

const TIPO_LABEL: Record<string, string> = {
  peticao: 'Petição', contrato: 'Contrato', procuracao: 'Procuração',
  sentenca: 'Sentença', recurso: 'Recurso', laudo: 'Laudo',
  comprovante: 'Comprovante', outro: 'Outro',
}

const TIPO_COLORS: Record<string, string> = {
  peticao:     'text-blue-600 dark:text-blue-400',
  contrato:    'text-purple-600 dark:text-purple-400',
  procuracao:  'text-indigo-600 dark:text-indigo-400',
  sentenca:    'text-red-600 dark:text-red-400',
  recurso:     'text-orange-600 dark:text-orange-400',
  laudo:       'text-emerald-600 dark:text-emerald-400',
  comprovante: 'text-teal-600 dark:text-teal-400',
  outro:       'text-zinc-500',
}

function DocIcon({ tipo }: { tipo: string }) {
  return <File size={17} className={TIPO_COLORS[tipo] ?? 'text-zinc-500'} />
}

export default function DocumentosPage() {
  const [docs,      setDocs]      = useState<Documento[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [tipo,      setTipo]      = useState('all')
  const [uploading, setUploading] = useState(false)
  const [quota,     setQuota]     = useState({ usada: 0, total: 100 * 1024 * 1024 })
  const [deleting,  setDeleting]  = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarDocumentos({ tipo: tipo !== 'all' ? tipo : undefined })
      setDocs(data)
    } finally {
      setLoading(false)
    }
  }, [tipo])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    fetch('/api/documentos/quota')
      .then(r => r.json())
      .then(d => setQuota({ usada: d.usada ?? 0, total: d.total ?? 100 * 1024 * 1024 }))
      .catch(() => {})
  }, [docs])

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Excluir este documento? A ação não pode ser desfeita.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/documentos/${id}`, { method: 'DELETE' })
      if (res.ok) setDocs(prev => prev.filter(d => d.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const filtered = docs.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      d.nome.toLowerCase().includes(q) ||
      d.filename.toLowerCase().includes(q) ||
      d.cliente_nome?.toLowerCase().includes(q) ||
      d.caso_titulo?.toLowerCase().includes(q)
    )
  })

  const quotaPct    = Math.round((quota.usada / quota.total) * 100)
  const quotaUsadaMB = (quota.usada / (1024 * 1024)).toFixed(1)
  const quotaTotalMB = (quota.total / (1024 * 1024)).toFixed(0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos…"
            className="pl-9 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Quota badge */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 px-3 h-9 rounded-[6px] border border-border">
          <HardDrive size={12} />
          <span className="font-mono">{quotaUsadaMB} / {quotaTotalMB} MB</span>
          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', quotaPct >= 90 ? 'bg-destructive' : quotaPct >= 70 ? 'bg-amber-500' : 'bg-primary')}
              style={{ width: `${Math.min(quotaPct, 100)}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setUploading(true)}
          className="flex items-center gap-1.5 px-3 h-9 bg-primary text-primary-foreground rounded-[6px] text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          <Upload size={13} />
          Enviar PDF
        </button>
      </div>

      {/* Type filters */}
      <div className="flex items-center gap-1 flex-wrap">
        {DOC_TIPOS.map(t => (
          <button
            key={t.value}
            onClick={() => setTipo(t.value)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-md border font-medium transition-colors',
              tipo === t.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_100px_90px_80px_40px] gap-0 border-b bg-muted/30">
          {['Documento', 'Cliente', 'Caso', 'Tipo', 'Data', 'Tamanho', ''].map((h, i) => (
            <div key={i} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum documento encontrado"
            description={search ? 'Tente ajustar a busca.' : 'Faça upload do primeiro PDF do escritório.'}
            action={!search ? { label: 'Enviar PDF', onClick: () => setUploading(true) } : undefined}
          />
        ) : (
          <div className="divide-y">
            {filtered.map(doc => (
              <Link
                key={doc.id}
                href={`/documentos/${doc.id}`}
                className="grid grid-cols-[2.5fr_1.5fr_1.5fr_100px_90px_80px_40px] gap-0 hover:bg-muted/30 transition-colors group"
              >
                <div className="px-4 py-3 flex items-center gap-2.5">
                  <DocIcon tipo={doc.tipo} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{doc.nome}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{doc.filename}</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{doc.cliente_nome ?? '—'}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground truncate">{doc.caso_titulo ? doc.caso_titulo.slice(0, 30) + (doc.caso_titulo.length > 30 ? '…' : '') : '—'}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <Badge variant="muted" className="text-[10px]">{TIPO_LABEL[doc.tipo] ?? doc.tipo}</Badge>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-[10px] text-muted-foreground">{formatDate(doc.created_at)}</p>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <p className="text-xs text-muted-foreground">{formatBytes(doc.tamanho)}</p>
                </div>
                <div className="px-4 py-3 flex items-center justify-center">
                  <button
                    onClick={e => handleDelete(e, doc.id)}
                    disabled={deleting === doc.id}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50"
                    title="Excluir documento"
                  >
                    {deleting === doc.id
                      ? <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} documento{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      <UploadDialog
        open={uploading}
        onClose={() => setUploading(false)}
        onSuccess={doc => {
          setDocs(prev => [doc, ...prev])
          setUploading(false)
        }}
        quotaUsada={quota.usada}
        quotaTotal={quota.total}
      />
    </div>
  )
}
