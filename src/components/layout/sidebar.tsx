'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  collapsed: boolean
  onToggle: () => void
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const [userName,    setUserName]    = useState('')
  const [officeName,  setOfficeName]  = useState('')
  const [officePlan,  setOfficePlan]  = useState('')

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata
      setUserName(meta?.nome_profissional || meta?.full_name || data.user?.email || '')
    })

    supabase
      .from('membros')
      .select('escritorio_id')
      .limit(1)
      .maybeSingle()
      .then(({ data: membro }) => {
        if (!membro?.escritorio_id) return
        supabase
          .from('escritorios')
          .select('nome, plano')
          .eq('id', membro.escritorio_id)
          .single()
          .then(({ data: esc }) => {
            if (esc) {
              setOfficeName(esc.nome)
              setOfficePlan(esc.plano ?? 'starter')
            }
          })
      })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const officeInitials = officeName
    ? officeName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase()
    : '…'

  const planLabel = officePlan === 'pro' ? 'Plano Pro' : officePlan === 'enterprise' ? 'Enterprise' : 'Starter'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full flex flex-col bg-sidebar border-r border-sidebar-border z-40',
        'transition-all duration-200 ease-in-out',
        collapsed ? 'w-[56px]' : 'w-[232px]'
      )}
    >
      {/* Brand */}
      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-2.5 border-b border-sidebar-border shrink-0 min-h-[49px]',
          collapsed ? 'px-[17px] justify-center' : 'px-4'
        )}
      >
        <div className={cn(
          'flex items-center justify-center shrink-0 rounded-[3px]',
          'bg-primary text-primary-foreground',
          'font-serif italic font-semibold leading-none',
          'w-[22px] h-[22px] text-[13px]'
        )}>
          V
        </div>
        {!collapsed && (
          <span className="font-serif font-medium text-[15px] tracking-[-0.01em] text-foreground whitespace-nowrap">
            Vetor <em className="text-primary not-italic">Jurídico</em>
          </span>
        )}
      </Link>

      {/* Office selector */}
      {!collapsed && (
        <button className="mx-3 my-2.5 px-2.5 py-2 border border-border rounded-[5px] bg-card flex items-center gap-2 hover:bg-accent transition-colors text-left">
          <div className="w-6 h-6 rounded-[3px] bg-foreground text-background flex items-center justify-center font-semibold text-[11px] shrink-0">
            {officeInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium truncate text-foreground">
              {officeName || '…'}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.04em]">
              {planLabel}
            </div>
          </div>
          <ChevronDown size={12} className="text-muted-foreground shrink-0" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto pb-3">
        {NAV.map((item, i) => {
          if ('section' in item) {
            return collapsed ? (
              <div key={i} className="my-2 mx-3 h-px bg-sidebar-border" />
            ) : (
              <div key={i} className="px-4 pt-3 pb-1 text-[10px] font-medium font-mono uppercase tracking-[0.1em] text-muted-foreground">
                {item.section}
              </div>
            )
          }
          const active = isActive(item.href)
          return (
            <div key={item.href} className={cn('px-2', collapsed && 'px-1.5')}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-[9px] px-2 py-1.5 rounded-[5px] text-[13px] transition-colors',
                  collapsed && 'justify-center px-0 py-2',
                  active
                    ? 'bg-sidebar-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
              >
                <item.icon size={15} className={cn('shrink-0', active && 'text-primary')} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Bottom: user */}
      <div className={cn(
        'shrink-0 border-t border-sidebar-border',
        collapsed ? 'px-1.5 py-2' : 'px-2 py-2'
      )}>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-[9px] px-2 py-1.5 rounded-[5px] hover:bg-sidebar-accent transition-colors text-left',
            collapsed && 'justify-center px-0'
          )}
        >
          <div className={cn(
            'rounded-full bg-foreground text-background flex items-center justify-center font-semibold shrink-0',
            'w-6 h-6 text-[10px]'
          )}>
            {userName ? getInitials(userName) : '?'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate text-foreground">{userName || '…'}</div>
            </div>
          )}
          {!collapsed && <LogOut size={13} className="text-muted-foreground shrink-0" />}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-[60px] w-6 h-6 rounded-full bg-card border border-border',
          'flex items-center justify-center text-muted-foreground hover:text-foreground',
          'hover:bg-accent transition-colors shadow-sm z-10 text-[10px] font-mono'
        )}
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  )
}
