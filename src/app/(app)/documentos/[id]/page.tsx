'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText, Download, ExternalLink, Clock, User, Briefcase, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buscarDocumento, type Documento } from '@/lib/supabase/documentos'
import { formatDate, formatDateTime, formatBytes } from '@/lib/utils'

const TIPO_LABEL: Record<string, string> = {
  peticao: 'Petição', contrato: 'Contrato', procuracao: 'Procuração',
  sentenca: 'Sentença', recurso: 'Recurso', laudo: 'Laudo',
  comprovante: 'Comprovante', outro: 'Outro',
}

export default function DocumentoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params.id as string

  const [doc,      setDoc]      = useState<Documento | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    buscarDocumento(id)
      .then(d => {
        if (!d) router.replace('/documentos')
        else setDoc(d)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleDelete() {
    if (!doc) return
    if (!confirm('Excluir este documento permanentemente? Esta ação não pode ser desfeita.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/documentos/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/documentos')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!doc) return null

  const tipoLabel = TIPO_LABEL[doc.tipo] ?? doc.tipo

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <Link href="/documentos" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={12} /> Documentos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{doc.nome}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="muted" className="text-[10px]">{tipoLabel}</Badge>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatBytes(doc.tamanho)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 h-9 border border-border rounded-[6px] text-[13px] text-muted-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink size={13} /> Abrir
          </a>
          <a
            href={doc.url}
            download={doc.filename}
            className="flex items-center gap-1.5 px-3 h-9 bg-primary text-primary-foreground rounded-[6px] text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Download size={13} /> Baixar
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 h-9 border border-destructive/30 text-destructive rounded-[6px] text-[13px] hover:bg-destructive/5 transition-colors disabled:opacity-60"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Excluir
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* PDF Preview */}
        <div className="lg:col-span-2">
          <div
            className="rounded-lg border bg-muted/10 overflow-hidden"
            style={{ minHeight: 600 }}
          >
            <iframe
              src={`${doc.url}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              style={{ minHeight: 600, border: 'none' }}
              title={doc.nome}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            Problemas ao visualizar?{' '}
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Abrir em nova aba
            </a>
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Nome do arquivo</p>
                <p className="text-xs font-mono break-all">{doc.filename}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Tipo</p>
                <p className="text-xs">{tipoLabel}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Tamanho</p>
                <p className="text-xs">{formatBytes(doc.tamanho)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Formato</p>
                <p className="text-xs">application/pdf</p>
              </div>
            </CardContent>
          </Card>

          {(doc.cliente_nome || doc.caso_titulo) && (
            <Card>
              <CardHeader><CardTitle>Vínculos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {doc.cliente_nome && doc.cliente_id && (
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Cliente</p>
                      <Link
                        href={`/clientes/${doc.cliente_id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {doc.cliente_nome}
                      </Link>
                    </div>
                  </div>
                )}
                {doc.caso_titulo && doc.caso_id && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={13} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Caso</p>
                      <Link
                        href={`/casos/${doc.caso_id}`}
                        className="text-xs text-primary hover:underline truncate block max-w-[180px]"
                      >
                        {doc.caso_titulo}
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Clock size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Enviado em</p>
                  <p className="text-xs">{formatDateTime(doc.created_at)}</p>
                </div>
              </div>
              {doc.updated_at !== doc.created_at && (
                <div className="flex items-start gap-2 pt-2 border-t">
                  <Clock size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Atualizado em</p>
                    <p className="text-xs">{formatDateTime(doc.updated_at)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
