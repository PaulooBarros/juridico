'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Upload, File, Trash2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listarDocumentos, type Documento } from '@/lib/supabase/documentos'
import { formatDate, formatBytes, cn } from '@/lib/utils'
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

interface DocumentosSectionProps {
  clienteId: string
}

export function DocumentosSection({ clienteId }: DocumentosSectionProps) {
  const [docs,     setDocs]     = useState<Documento[]>([])
  const [loading,  setLoading]  = useState(true)
  const [upload,   setUpload]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [quota,    setQuota]    = useState({ usada: 0, total: 100 * 1024 * 1024 })

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarDocumentos({ clienteId })
      setDocs(data)
    } finally {
      setLoading(false)
    }
  }, [clienteId])

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText size={14} /> Documentos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Link href="/documentos" className="text-xs text-primary hover:underline">
                Ver todos
              </Link>
              <button
                onClick={() => setUpload(true)}
                className="flex items-center gap-1.5 px-2.5 h-7 bg-primary text-primary-foreground rounded-[5px] text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Upload size={11} />
                Enviar
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : docs.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Nenhum documento vinculado a este cliente.
            </p>
          ) : (
            <div className="divide-y -mx-5">
              {docs.slice(0, 5).map(doc => (
                <Link
                  key={doc.id}
                  href={`/documentos/${doc.id}`}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors group"
                >
                  <File size={15} className={cn('shrink-0', TIPO_COLORS[doc.tipo] ?? 'text-zinc-500')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{doc.nome}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {TIPO_LABEL[doc.tipo] ?? doc.tipo} · {formatBytes(doc.tamanho)} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={e => handleDelete(e, doc.id)}
                      disabled={deleting === doc.id}
                      className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      {deleting === doc.id
                        ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        : <Trash2 size={12} />
                      }
                    </button>
                  </div>
                </Link>
              ))}
              {docs.length > 5 && (
                <div className="px-5 py-2.5">
                  <Link href="/documentos" className="text-xs text-primary hover:underline">
                    Ver mais {docs.length - 5} documento{docs.length - 5 !== 1 ? 's' : ''}
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <UploadDialog
        open={upload}
        onClose={() => setUpload(false)}
        onSuccess={doc => { setDocs(prev => [doc, ...prev]); setUpload(false) }}
        clienteId={clienteId}
        quotaUsada={quota.usada}
        quotaTotal={quota.total}
      />
    </>
  )
}
