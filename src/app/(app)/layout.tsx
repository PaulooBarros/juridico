'use client'
import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { usePathname } from 'next/navigation'

const COLLAPSED_WIDTH = 56
const EXPANDED_WIDTH = 220

const PAGE_META: Record<string, { title: string; breadcrumb?: Array<{ label: string; href?: string }> }> = {
  '/dashboard': { title: 'Dashboard' },
  '/clientes': { title: 'Clientes', breadcrumb: [] },
  '/casos': { title: 'Casos', breadcrumb: [] },
  '/calendario': { title: 'Calendário', breadcrumb: [] },
  '/documentos': { title: 'Documentos', breadcrumb: [] },
  '/modelos': { title: 'Modelos', breadcrumb: [] },
  '/equipe': { title: 'Equipe', breadcrumb: [] },
  '/financeiro': { title: 'Financeiro', breadcrumb: [] },
  '/notificacoes': { title: 'Notificações', breadcrumb: [] },
  '/configuracoes': { title: 'Configurações', breadcrumb: [] },
  '/perfil': { title: 'Meu Perfil', breadcrumb: [] },
  '/escritorio': { title: 'Escritório', breadcrumb: [] },
  '/planos': { title: 'Planos & Assinaturas', breadcrumb: [] },
}

const ACTION_MAP: Record<string, { label: string; href?: string }> = {
  '/clientes': { label: 'Novo Cliente', href: '#' },
  '/casos': { label: 'Novo Caso', href: '#' },
  '/documentos': { label: 'Upload', href: '#' },
  '/modelos': { label: 'Novo Modelo', href: '#' },
  '/equipe': { label: 'Convidar Membro', href: '#' },
  '/financeiro': { label: 'Lançamento', href: '#' },
}

function getPageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]

  if (pathname.startsWith('/clientes/')) return {
    title: 'Detalhe do Cliente',
    breadcrumb: [{ label: 'Clientes', href: '/clientes' }],
  }
  if (pathname.startsWith('/casos/')) return {
    title: 'Detalhe do Caso',
    breadcrumb: [{ label: 'Casos', href: '/casos' }],
  }
  if (pathname.startsWith('/documentos/')) return {
    title: 'Documento',
    breadcrumb: [{ label: 'Documentos', href: '/documentos' }],
  }
  return { title: 'Vetor Jurídico' }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH

  const meta = getPageMeta(pathname)
  const action = ACTION_MAP[pathname]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Topbar
        title={meta.title}
        breadcrumb={meta.breadcrumb}
        action={action}
        sidebarWidth={sidebarWidth}
      />
      <main
        className="min-h-screen pt-14 transition-all duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
