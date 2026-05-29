'use client'
import { Suspense, useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { OnboardingHandler } from '@/components/onboarding/onboarding-handler'
import { GlobalSearch } from '@/components/search/global-search'
import { usePathname } from 'next/navigation'

const COLLAPSED_WIDTH = 56
const EXPANDED_WIDTH  = 232

const PAGE_META: Record<string, { title: string; breadcrumb?: Array<{ label: string; href?: string }> }> = {
  '/dashboard':    { title: 'Dashboard' },
  '/clientes':     { title: 'Clientes',              breadcrumb: [] },
  '/casos':        { title: 'Casos',                 breadcrumb: [] },
  '/calendario':   { title: 'Calendário',            breadcrumb: [] },
  '/documentos':   { title: 'Documentos',            breadcrumb: [] },
  '/modelos':      { title: 'Modelos',               breadcrumb: [] },
  '/equipe':       { title: 'Equipe',                breadcrumb: [] },
  '/financeiro':   { title: 'Financeiro',            breadcrumb: [] },
  '/notificacoes': { title: 'Notificações',          breadcrumb: [] },
  '/configuracoes':{ title: 'Configurações',         breadcrumb: [] },
  '/perfil':       { title: 'Meu Perfil',            breadcrumb: [] },
  '/escritorio':   { title: 'Escritório',            breadcrumb: [] },
  '/planos':       { title: 'Planos & Assinaturas',  breadcrumb: [] },
}

const ACTION_MAP: Record<string, { label: string; href?: string }> = {
  '/documentos': { label: 'Upload',        href: '#' },
  '/modelos':    { label: 'Novo Modelo',   href: '/modelos/novo' },
  '/equipe':     { label: 'Convidar Membro', href: '#' },
  '/financeiro': { label: 'Lançamento',   href: '#' },
}

function getPageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  if (pathname.startsWith('/clientes/'))  return { title: 'Detalhe do Cliente',  breadcrumb: [{ label: 'Clientes',   href: '/clientes' }] }
  if (pathname.startsWith('/casos/'))     return { title: 'Detalhe do Caso',     breadcrumb: [{ label: 'Casos',      href: '/casos' }] }
  if (pathname.startsWith('/documentos/'))return { title: 'Documento',           breadcrumb: [{ label: 'Documentos', href: '/documentos' }] }
  if (pathname === '/modelos/novo')        return { title: 'Novo Modelo',         breadcrumb: [{ label: 'Modelos',    href: '/modelos' }] }
  if (pathname.startsWith('/modelos/'))   return { title: 'Editor de Modelo',    breadcrumb: [{ label: 'Modelos',    href: '/modelos' }] }
  return { title: 'Leea' }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const [collapsed,     setCollapsed]     = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [isMobile,      setIsMobile]      = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Atalho Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Fecha drawer ao navegar
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const sidebarWidth = isMobile ? 0 : (collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH)

  const meta   = getPageMeta(pathname)
  const action = ACTION_MAP[pathname]

  return (
    <div className="min-h-screen bg-background">
      <Suspense>
        <OnboardingHandler />
      </Suspense>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Topbar
        title={meta.title}
        breadcrumb={meta.breadcrumb}
        action={action}
        sidebarWidth={sidebarWidth}
        onMenuOpen={() => setMobileOpen(o => !o)}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <main
        className="min-h-screen pt-[49px] transition-all duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
