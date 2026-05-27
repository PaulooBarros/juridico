import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone, MapPin, Building2, User, FileText, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientStatusBadge } from '@/features/shared/status-badge'
import { formatDocument, formatDate } from '@/lib/utils'
import { createServerAuthClient } from '@/lib/supabase/server'
import { ClienteActions } from './cliente-actions'

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerAuthClient()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !cliente) notFound()

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {cliente.type === 'pj'
            ? <Building2 size={22} className="text-muted-foreground" />
            : <User size={22} className="text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{cliente.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {cliente.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                {cliente.document ? ` · ${formatDocument(cliente.document)}` : ''}
              </p>
            </div>
            <ClientStatusBadge status={cliente.status} />
          </div>
        </div>
        <ClienteActions cliente={cliente} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Informações de contato</CardTitle></CardHeader>
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
                    {cliente.city && (
                      <p className="text-xs text-muted-foreground">
                        {cliente.city}{cliente.state ? `, ${cliente.state}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!cliente.email && !cliente.phone && !cliente.address && !cliente.city && (
                <p className="text-xs text-muted-foreground">Nenhum contato cadastrado.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sobre o cliente</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Cliente desde</span>
                <span className="text-xs font-medium">{formatDate(cliente.created_at)}</span>
              </div>
              {cliente.notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground leading-relaxed">{cliente.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Casos e Documentos — ainda mockados, integrarão na próxima etapa */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase size={14} /> Casos
                </CardTitle>
                <Link href="/casos" className="text-xs text-primary hover:underline">Ver todos</Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground py-6 text-center">
                A integração de casos será conectada na próxima etapa.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText size={14} /> Documentos
                </CardTitle>
                <Link href="/documentos" className="text-xs text-primary hover:underline">Ver todos</Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground py-6 text-center">
                A integração de documentos será conectada na próxima etapa.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
