'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronRight, Plus, Search, Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title:        string
  breadcrumb?:  Array<{ label: string; href?: string }>
  action?:      { label: string; href?: string; onClick?: () => void }
  sidebarWidth: number
  onMenuOpen:   () => void
  onSearchOpen: () => void
}

export function Topbar({ title, breadcrumb, action, sidebarWidth, onMenuOpen, onSearchOpen }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [userName,   setUserName]   = useState('')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => {
    setMounted(true)
    authClient.getSession({ fetchOptions: { cache: 'no-store' } }).then(({ data }) => {
      const user = data?.user as any
      setUserName(user?.nome_profissional || user?.name || user?.email || '')
      setUserAvatar(user?.image ?? null)
    })
  }, [pathname])

  return (
    <header
      className="fixed top-0 right-0 h-[49px] border-b border-border bg-background z-30 flex items-center left-0"
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center justify-between w-full px-4 lg:px-5 gap-2">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden w-[30px] h-[30px] rounded-[5px] flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
          aria-label="Abrir menu"
        >
          <Menu size={16} />
        </button>

        {/* Title / Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground min-w-0 flex-1">
          {breadcrumb && breadcrumb.length > 0 && breadcrumb.map((item, i) => (
            <span key={i} className="hidden sm:flex items-center gap-2 shrink-0">
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
              <ChevronRight size={12} className="text-muted-foreground/50" />
            </span>
          ))}
          <span className="font-medium text-foreground truncate">{title}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {action && (
            <Button
              size="sm"
              className="hidden sm:flex h-7 px-3 text-xs gap-1.5 mr-2"
              asChild={!!action.href}
              onClick={action.onClick}
            >
              {action.href ? (
                <Link href={action.href}>
                  <Plus size={12} />
                  {action.label}
                </Link>
              ) : (
                <>
                  <Plus size={12} />
                  {action.label}
                </>
              )}
            </Button>
          )}

          {/* Search */}
          <button
            onClick={onSearchOpen}
            className="hidden sm:flex items-center gap-2 h-[30px] px-2 rounded-[5px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Busca global (Ctrl+K)"
          >
            <Search size={15} />
            <span className="text-[11px] font-mono hidden md:block">Ctrl+K</span>
          </button>

          {/* Notifications */}
          <Link
            href="/notificacoes"
            className="relative w-[30px] h-[30px] rounded-[5px] flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Bell size={15} />
          </Link>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-[30px] h-[30px] rounded-[5px] flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Alternar tema"
          >
            {mounted && (theme === 'light' ? <Moon size={15} /> : <Sun size={15} />)}
          </button>

          {/* Separator */}
          <div className="w-px h-[18px] bg-border mx-1" />

          {/* User */}
          <Link
            href="/perfil"
            className="flex items-center gap-2 rounded-[5px] px-2 py-1 hover:bg-accent transition-colors"
          >
            <Avatar className="w-[22px] h-[22px]">
              {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
              <AvatarFallback className={cn('text-[9px] font-semibold', 'bg-foreground text-background')}>
                {userName ? getInitials(userName) : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium hidden md:block max-w-[100px] truncate">
              {userName || '…'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
