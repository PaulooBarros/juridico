import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText, Building, Gavel, User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CaseStatusBadge } from '@/features/shared/status-badge'
import { createServerAuthClient } from '@/lib/supabase/server'
import { formatArea, formatPhase, formatDate, formatCurrency } from '@/lib/utils'
import { CasoActions } from './caso-actions'
import { PrazosTab } from './prazos-tab'
import { DocumentosTab } from './documentos-tab'

export default async function CasoDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerAuthClient()

  const { data: caso, error } = await supabase
    .from('casos')
    .select('*, clientes(id, name)')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !caso) notFound()

  const clienteNome: string | null = (caso.clientes as any)?.name ?? null
  const clienteId:   string | null = (caso.clientes as any)?.id   ?? null

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{caso.titulo}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {caso.numero && (
              <>
                <span className="text-xs font-mono text-muted-foreground">{caso.numero}</span>
                <span className="text-muted-foreground">·</span>
              </>
            )}
            {clienteNome && clienteId ? (
              <Link href={`/clientes/${clienteId}`} className="text-xs text-primary hover:underline">
                {clienteNome}
              </Link>
            ) : clienteNome ? (
              <span className="text-xs text-muted-foreground">{clienteNome}</span>
            ) : null}
            {clienteNome && <span className="text-muted-foreground">·</span>}
            <Badge variant="muted" className="text-[10px]">{formatArea(caso.area)}</Badge>
            <Badge variant="muted" className="text-[10px]">{formatPhase(caso.fase)}</Badge>
            <CaseStatusBadge status={caso.status} />
          </div>
        </div>
        <CasoActions caso={caso} clienteNome={clienteNome} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="prazos">Prazos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid lg:grid-cols-3 gap-6 mt-4">
            <div className="lg:col-span-2 space-y-4">
              {caso.descricao && (
                <Card>
                  <CardHeader><CardTitle>Descrição</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">{caso.descricao}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Detalhes processuais</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {caso.vara && (
                    <div className="flex items-start gap-2.5">
                      <Building size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Vara / Tribunal</p>
                        <p className="text-xs">{caso.vara}</p>
                      </div>
                    </div>
                  )}
                  {caso.juiz && (
                    <div className="flex items-start gap-2.5">
                      <Gavel size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Juiz(a)</p>
                        <p className="text-xs">{caso.juiz}</p>
                      </div>
                    </div>
                  )}
                  {!caso.vara && !caso.juiz && (
                    <p className="text-xs text-muted-foreground">Nenhum detalhe processual cadastrado.</p>
                  )}
                  {caso.valor_causa && caso.valor_causa > 0 && (
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-xs text-muted-foreground">Valor da causa</span>
                      <span className="text-xs font-semibold">{formatCurrency(caso.valor_causa)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {caso.notes && (
                <Card>
                  <CardHeader><CardTitle>Observações internas</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">{caso.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              {clienteNome && (
                <Card>
                  <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User size={13} className="text-muted-foreground" />
                      </div>
                      {clienteId ? (
                        <Link href={`/clientes/${clienteId}`} className="text-xs font-medium text-primary hover:underline truncate">
                          {clienteNome}
                        </Link>
                      ) : (
                        <span className="text-xs font-medium truncate">{clienteNome}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Cadastrado</span>
                    <span className="text-xs">{formatDate(caso.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Atualizado</span>
                    <span className="text-xs">{formatDate(caso.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Prazos */}
        <TabsContent value="prazos">
          <div className="mt-4">
            <PrazosTab casoId={params.id} />
          </div>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos">
          <div className="mt-4">
            <DocumentosTab casoId={params.id} clienteId={clienteId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
