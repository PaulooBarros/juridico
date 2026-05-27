'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Upload, File, Trash2, ExternalLink } from 'lucide-react'
import { listarDocumentos, type Documento } from '@/lib/supabase/documentos'
import { formatDate, formatBytes, cn } from '@/lib/utils'
import { EmptyState } from '@/features/shared/empty-state'
import { UploadDialog } from '@/app/(app)/documentos/upload-dialog'

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

interface DocumentosTabProps {
  casoId:    string
  clienteId?: string | null
}

export function DocumentosTab({ casoId, clienteId }: DocumentosTabProps) {
  const [docs,     setDocs]     = useState<Documento[]>([])
  const [loading,  setLoading]  = useState(true)
  const [upload,   setUpload]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [quota,    setQuota]    = useState({ usada: 0, total: 100 * 1024 * 1024 })

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarDocumentos({ casoId })
      setDocs(data)
    } finally {
      setLoading(false)
    }
  }, [casoId])

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
    if (!confirm('Excluir este documento?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/documentos/${id}`, { method: 'DELETE' })
      if (res.ok) setDocs(prev => prev.filter(d => d.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {docs.length} documento{docs.length !== 1 ? 's' : ''} neste caso
          </p>
          <button
            onClick={() => setUpload(true)}
            className="flex items-center gap-1.5 px-3 h-8 bg-primary text-primary-foreground rounded-[6px] text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Upload size={12} />
            Enviar PDF
          </button>
        </div>

        {docs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum documento"
            description="Envie PDFs vinculados a este caso."
            action={{ label: 'Enviar PDF', onClick: () => setUpload(true) }}
          />
        ) : (
          <div className="rounded-lg border overflow-hidden bg-card divide-y">
            {docs.map(doc => (
              <Link
                key={doc.id}
                href={`/documentos/${doc.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
              >
                <File size={16} className={cn('shrink-0', TIPO_COLORS[doc.tipo] ?? 'text-zinc-500')} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{doc.nome}</p>
                  <p className="text-[10px] text-muted-foreground">{TIPO_LABEL[doc.tipo] ?? doc.tipo} · {formatBytes(doc.tamanho)} · {formatDate(doc.created_at)}</p>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="Abrir PDF"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={e => handleDelete(e, doc.id)}
                    disabled={deleting === doc.id}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {deleting === doc.id
                      ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <UploadDialog
        open={upload}
        onClose={() => setUpload(false)}
        onSuccess={doc => { setDocs(prev => [doc, ...prev]); setUpload(false) }}
        casoId={casoId}
        clienteId={clienteId ?? undefined}
        quotaUsada={quota.usada}
        quotaTotal={quota.total}
      />
    </>
  )
}
