import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText, Download, Eye, Clock, User, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { documentos } from '@/lib/mock'
import { formatDate, formatDateTime, formatBytes, formatDocType } from '@/lib/utils'

export default function DocumentoDetailPage({ params }: { params: { id: string } }) {
  const doc = documentos.find(d => d.id === params.id)
  if (!doc) notFound()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{doc.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="muted" className="text-[10px]">{formatDocType(doc.type)}</Badge>
              <span className="text-xs text-muted-foreground">v{doc.version}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatBytes(doc.size)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Eye size={13} /> Visualizar
          </Button>
          <Button size="sm" className="gap-1.5">
            <Download size={13} /> Baixar
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview area */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-muted/20 flex items-center justify-center" style={{ minHeight: 480 }}>
            <div className="text-center">
              <FileText size={48} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Preview do documento</p>
              <p className="text-xs text-muted-foreground mt-1">{doc.filename}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatBytes(doc.size)} · {doc.mimeType}</p>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                <Eye size={13} /> Abrir visualizador
              </Button>
            </div>
          </div>
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
                <p className="text-[10px] text-muted-foreground mb-0.5">Tipo MIME</p>
                <p className="text-xs">{doc.mimeType}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Tamanho</p>
                <p className="text-xs">{formatBytes(doc.size)}</p>
              </div>
              {doc.tags && doc.tags.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map(tag => (
                      <Badge key={tag} variant="muted" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Vínculos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {doc.clientName && (
                <div className="flex items-center gap-2">
                  <User size={13} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Cliente</p>
                    <Link href={`/clientes/${doc.clientId}`} className="text-xs text-primary hover:underline">{doc.clientName}</Link>
                  </div>
                </div>
              )}
              {doc.caseName && (
                <div className="flex items-center gap-2">
                  <Briefcase size={13} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Caso</p>
                    <Link href={`/casos/${doc.caseId}`} className="text-xs text-primary hover:underline truncate block max-w-[180px]">{doc.caseName}</Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Versões</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: doc.version }).reverse().map((_, i) => {
                const v = doc.version - i
                return (
                  <div key={v} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${v === doc.version ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {v}
                      </div>
                      <span className="text-xs text-muted-foreground">v{v}{v === doc.version ? ' (atual)' : ''}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatDate(doc.createdAt)}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Enviado por</p>
                  <p className="text-xs">{doc.uploadedByName}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateTime(doc.createdAt)}</p>
                </div>
              </div>
              {doc.updatedAt !== doc.createdAt && (
                <div className="flex items-center gap-2 pt-1 border-t">
                  <Clock size={12} className="text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Atualizado</p>
                    <p className="text-[10px] text-muted-foreground">{formatDateTime(doc.updatedAt)}</p>
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
