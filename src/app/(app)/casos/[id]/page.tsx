import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, FileText, Clock, User, Building, Gavel, ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { PriorityDot } from '@/features/shared/priority-badge'
import { casos, prazos, documentos, timelineEventos } from '@/lib/mock'
import { formatArea, formatPhase, formatDate, formatCurrency, formatDateTime, formatDeadlineType, formatDocType, formatBytes, daysUntil } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  created: Clock,
  updated: Clock,
  document_added: FileText,
  deadline_added: Calendar,
  hearing: Gavel,
  decision: Gavel,
  petition: FileText,
  note: FileText,
}

export default function CasoDetailPage({ params }: { params: { id: string } }) {
  const caso = casos.find(c => c.id === params.id)
  if (!caso) notFound()

  const casoPrazos = prazos.filter(p => p.caseId === params.id)
  const casoDocs = documentos.filter(d => d.caseId === params.id)
  const casoTimeline = timelineEventos.filter(e => e.caseId === params.id)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold tracking-tight">{caso.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{caso.number}</span>
              <span className="text-muted-foreground">·</span>
              <Link href={`/clientes/${caso.clientId}`} className="text-xs text-primary hover:underline">{caso.clientName}</Link>
              <span className="text-muted-foreground">·</span>
              <Badge variant="muted" className="text-[10px]">{formatArea(caso.area)}</Badge>
              <Badge variant="muted" className="text-[10px]">{formatPhase(caso.phase)}</Badge>
              <CaseStatusBadge status={caso.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({casoTimeline.length})</TabsTrigger>
          <TabsTrigger value="prazos">Prazos ({casoPrazos.length})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({casoDocs.length})</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {caso.description && (
                <Card>
                  <CardHeader><CardTitle>Descrição</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">{caso.description}</p>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader><CardTitle>Detalhes processuais</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {caso.court && (
                    <div className="flex items-start gap-2.5">
                      <Building size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Vara / Tribunal</p>
                        <p className="text-xs">{caso.court}</p>
                      </div>
                    </div>
                  )}
                  {caso.judge && (
                    <div className="flex items-start gap-2.5">
                      <Gavel size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Juiz(a)</p>
                        <p className="text-xs">{caso.judge}</p>
                      </div>
                    </div>
                  )}
                  {caso.value !== undefined && caso.value > 0 && (
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-xs text-muted-foreground">Valor da causa</span>
                      <span className="text-xs font-semibold">{formatCurrency(caso.value)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Responsáveis</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {caso.assignedNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <User size={12} className="text-muted-foreground" />
                      </div>
                      <span className="text-xs">{name}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Criado</span>
                    <span className="text-xs">{formatDate(caso.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Atualizado</span>
                    <span className="text-xs">{formatDate(caso.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Prazos</span>
                    <span className="text-xs font-medium">{casoPrazos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Documentos</span>
                    <span className="text-xs font-medium">{casoDocs.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <div className="space-y-1">
            {casoTimeline.length === 0 && (
              <div className="text-center py-12 text-xs text-muted-foreground">Nenhum evento na timeline.</div>
            )}
            {casoTimeline.map((event, i) => {
              const Icon = TIMELINE_ICONS[event.type] ?? Clock
              return (
                <div key={event.id} className="flex gap-4 relative">
                  {i < casoTimeline.length - 1 && (
                    <div className="absolute left-[19px] top-9 bottom-0 w-px bg-border" />
                  )}
                  <div className="w-10 h-10 rounded-full border bg-background flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium">{event.title}</p>
                      <span className="text-[10px] text-muted-foreground">{formatDateTime(event.createdAt)}</span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">por {event.userName}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Prazos */}
        <TabsContent value="prazos">
          <div className="space-y-2">
            {casoPrazos.length === 0 && (
              <div className="text-center py-12 text-xs text-muted-foreground">Nenhum prazo cadastrado para este caso.</div>
            )}
            {casoPrazos.map((prazo) => {
              const days = daysUntil(prazo.dueDate)
              return (
                <div key={prazo.id} className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <PriorityDot priority={prazo.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{prazo.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatDeadlineType(prazo.type)} · {prazo.assignedName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-xs font-semibold', days < 0 ? 'text-destructive' : days <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                      {days < 0 ? `${Math.abs(days)}d atrasado` : days === 0 ? 'Hoje' : `${days} dias`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(prazo.dueDate)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos">
          <div className="space-y-2">
            {casoDocs.length === 0 && (
              <div className="text-center py-12 text-xs text-muted-foreground">Nenhum documento anexado a este caso.</div>
            )}
            {casoDocs.map((doc) => (
              <Link
                key={doc.id}
                href={`/documentos/${doc.id}`}
                className="flex items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={15} className="text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.filename} · {formatBytes(doc.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="muted" className="text-[10px]">{formatDocType(doc.type)}</Badge>
                  <span className="text-[10px] text-muted-foreground">{formatDate(doc.createdAt)}</span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
