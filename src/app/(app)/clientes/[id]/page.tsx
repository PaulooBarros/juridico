import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone, MapPin, Building2, User, FileText, Briefcase, Calendar, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClientStatusBadge, CaseStatusBadge } from '@/features/shared/status-badge'
import { clientes, casos, documentos } from '@/lib/mock'
import { formatDocument, formatDate, formatArea } from '@/lib/utils'

export default function ClienteDetailPage({ params }: { params: { id: string } }) {
  const cliente = clientes.find(c => c.id === params.id)
  if (!cliente) notFound()

  const clienteCasos = casos.filter(c => c.clientId === params.id)
  const clienteDocs = documentos.filter(d => d.clientId === params.id)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {cliente.type === 'pj' ? <Building2 size={22} className="text-muted-foreground" /> : <User size={22} className="text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{cliente.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{cliente.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'} · {formatDocument(cliente.document)}</p>
            </div>
            <ClientStatusBadge status={cliente.status} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cliente.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-xs truncate">{cliente.email}</span>
                </div>
              )}
              {cliente.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-xs">{cliente.phone}</span>
                </div>
              )}
              {(cliente.address || cliente.city) && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    {cliente.address && <p className="text-xs">{cliente.address}</p>}
                    {cliente.city && <p className="text-xs text-muted-foreground">{cliente.city}, {cliente.state}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre o cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cliente desde</span>
                <span className="text-xs font-medium">{formatDate(cliente.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Processos</span>
                <span className="text-xs font-medium">{clienteCasos.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Documentos</span>
                <span className="text-xs font-medium">{clienteDocs.length}</span>
              </div>
              {cliente.notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground leading-relaxed">{cliente.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Casos e Documentos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Casos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase size={14} />
                  Casos ({clienteCasos.length})
                </CardTitle>
                <Link href="/casos" className="text-xs text-primary hover:underline">Ver todos</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {clienteCasos.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-muted-foreground">
                  Nenhum caso cadastrado para este cliente.
                </div>
              ) : (
                <div className="divide-y">
                  {clienteCasos.map((caso) => (
                    <Link
                      key={caso.id}
                      href={`/casos/${caso.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{caso.title}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{caso.number}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="muted" className="text-[10px]">{formatArea(caso.area)}</Badge>
                        <CaseStatusBadge status={caso.status} />
                        <ExternalLink size={12} className="text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText size={14} />
                  Documentos ({clienteDocs.length})
                </CardTitle>
                <Link href="/documentos" className="text-xs text-primary hover:underline">Ver todos</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {clienteDocs.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-muted-foreground">
                  Nenhum documento cadastrado para este cliente.
                </div>
              ) : (
                <div className="divide-y">
                  {clienteDocs.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documentos/${doc.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={14} className="text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(doc.createdAt)}</p>
                        </div>
                      </div>
                      <Badge variant="muted" className="text-[10px] shrink-0">{doc.type}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
