'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { getMeuEscritorioId } from '@/lib/supabase/escritorio'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, Briefcase, Calendar, FileText, FileStack,
  DollarSign, UsersRound, Bell, Settings, Building2, CreditCard,
  CircleUser, LogOut, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV: Array<
  | { section: string }
  | { href: string; icon: React.ElementType; label: string }
> = [
  { section: 'Operação' },
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/casos',        icon: Briefcase,       label: 'Casos' },
  { href: '/clientes',     icon: Users,           label: 'Clientes' },
  { href: '/calendario',   icon: Calendar,        label: 'Calendário' },
  { href: '/notificacoes', icon: Bell,            label: 'Notificações' },
  { section: 'Conteúdo' },
  { href: '/documentos',   icon: FileText,        label: 'Documentos' },
  { href: '/modelos',      icon: FileStack,       label: 'Modelos' },
  { section: 'Escritório' },
  { href: '/equipe',       icon: UsersRound,      label: 'Equipe' },
  { href: '/financeiro',   icon: DollarSign,      label: 'Financeiro' },
  { href: '/escritorio',   icon: Building2,       label: 'Perfil do escritório' },
  { href: '/planos',       icon: CreditCard,      label: 'Plano' },
  { href: '/configuracoes',icon: Settings,        label: 'Configurações' },
]

interface SidebarProps {
  collapsed:     boolean
  onToggle:      () => void
  mobileOpen:    boolean
  onMobileClose: () => void
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const [userName,   setUserName]   = useState('')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [officeName, setOfficeName] = useState('')
  const [officePlan, setOfficePlan] = useState('')

  // Re-busca sessão e escritório a cada navegação para refletir atualizações
  // de avatar/logo feitas em outras páginas (ex: /perfil, /escritorio)
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      const user = data?.user as any
      setUserName(user?.nome_profissional || user?.name || user?.email || '')
      setUserAvatar(user?.image ?? null)
    })

    getMeuEscritorioId().then(escritorioId => {
      if (!escritorioId) return
      createClient()
        .from('escritorios')
        .select('nome, plano')
        .eq('id', escritorioId)
        .single()
        .then(({ data: esc }) => {
          if (esc) {
            setOfficeName(esc.nome)
            setOfficePlan(esc.plano ?? 'starter')
          }
        })
    })
  }, [pathname])

  async function handleLogout() {
    await authClient.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const officeInitials = officeName
    ? officeName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase()
    : '…'

  const planLabel = officePlan === 'pro' ? 'Plano Pro' : officePlan === 'enterprise' ? 'Enterprise' : 'Starter'

  // Em mobile, sempre mostra expandido (sem collapse)
  const isCollapsed = collapsed

  return (
    <>
      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full flex flex-col bg-sidebar border-r border-sidebar-border z-40',
          'transition-all duration-200 ease-in-out',
          // Mobile: drawer (sempre largura total, desliza)
          'w-[232px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: sempre visível, colapsa
          'lg:translate-x-0',
          isCollapsed ? 'lg:w-[56px]' : 'lg:w-[232px]',
        )}
      >
        {/* Brand */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center border-b border-sidebar-border shrink-0 overflow-hidden',
            isCollapsed ? 'lg:justify-center lg:min-h-[49px] lg:px-[17px]' : 'p-0'
          )}
        >
          {isCollapsed ? (
            <div className="hidden lg:flex w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground items-center justify-center font-serif italic font-semibold text-[13px]">
              L
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-4">
              <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px] shrink-0">
                L
              </div>
              <span className="font-serif font-medium text-[16px] tracking-[-0.01em]">Leea</span>
            </div>
          )}
        </Link>

        {/* Office selector */}
        {(!isCollapsed || mobileOpen) && (
          <button className="mx-3 my-2.5 px-2.5 py-2 border border-border rounded-[5px] bg-card flex items-center gap-2 hover:bg-accent transition-colors text-left">
            <div className="w-6 h-6 rounded-[3px] bg-foreground text-background flex items-center justify-center font-semibold text-[11px] shrink-0">
              {officeInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate text-foreground">{officeName || '…'}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.04em]">{planLabel}</div>
            </div>
            <ChevronDown size={12} className="text-muted-foreground shrink-0" />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pb-3">
          {NAV.map((item, i) => {
            if ('section' in item) {
              return (isCollapsed && !mobileOpen) ? (
                <div key={i} className="my-2 mx-3 h-px bg-sidebar-border" />
              ) : (
                <div key={i} className="px-4 pt-3 pb-1 text-[10px] font-medium font-mono uppercase tracking-[0.1em] text-muted-foreground">
                  {item.section}
                </div>
              )
            }
            const active = isActive(item.href)
            const showLabel = !isCollapsed || mobileOpen
            return (
              <div key={item.href} className={cn('px-2', !showLabel && 'px-1.5')}>
                <Link
                  href={item.href}
                  title={!showLabel ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-[9px] px-2 py-1.5 rounded-[5px] text-[13px] transition-colors',
                    !showLabel && 'justify-center px-0 py-2',
                    active
                      ? 'bg-sidebar-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  <item.icon size={15} className={cn('shrink-0', active && 'text-primary')} />
                  {showLabel && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className={cn(
          'shrink-0 border-t border-sidebar-border',
          (!isCollapsed || mobileOpen) ? 'px-2 py-2' : 'px-1.5 py-2'
        )}>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-[9px] px-2 py-1.5 rounded-[5px] hover:bg-sidebar-accent transition-colors text-left',
              (!isCollapsed || mobileOpen) ? '' : 'lg:justify-center lg:px-0'
            )}
          >
            <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center font-semibold text-[10px] shrink-0 overflow-hidden">
              {userAvatar
                ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                : (userName ? getInitials(userName) : '?')
              }
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate text-foreground">{userName || '…'}</div>
              </div>
            )}
            {(!isCollapsed || mobileOpen) && <LogOut size={13} className="text-muted-foreground shrink-0" />}
          </button>
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggle}
          className={cn(
            'hidden lg:flex absolute -right-3 top-[60px] w-6 h-6 rounded-full bg-card border border-border',
            'items-center justify-center text-muted-foreground hover:text-foreground',
            'hover:bg-accent transition-colors shadow-sm z-10 text-[10px] font-mono'
          )}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? '›' : '‹'}
        </button>
      </aside>
    </>
  )
}
