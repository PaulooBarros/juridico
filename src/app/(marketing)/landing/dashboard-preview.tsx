'use client'

import { useEffect, useState } from 'react'

const PRAZOS = [
  { titulo: 'Manifestação · Vale Itajaí', prazo: '2d', tipo: 'danger' },
  { titulo: 'Audiência · Móveis Serra',   prazo: '2d', tipo: 'danger' },
  { titulo: 'Contrarrazões · TechBras',   prazo: '3d', tipo: 'warning' },
]

const NOTIFICACOES = [
  'Novo prazo cadastrado por Juliana',
  'Audiência confirmada — Móveis Serra',
  'Pagamento recebido · R$ 4.200',
  'Prazo em 24h — Vale Itajaí',
]

const NAV_ITEMS = ['Dashboard', 'Casos', 'Clientes', 'Prazos', 'Financeiro']

export function DashboardPreview() {
  const [mounted,       setMounted]       = useState(false)
  const [notification,  setNotification]  = useState<string | null>(null)
  const [notifVisible,  setNotifVisible]  = useState(false)
  const [notifIndex,    setNotifIndex]    = useState(0)

  // Stagger mount
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Notification loop
  useEffect(() => {
    if (!mounted) return

    function cycle() {
      setNotifIndex(i => {
        const next = (i + 1) % NOTIFICACOES.length
        setNotification(NOTIFICACOES[next])
        return next
      })
      setNotifVisible(true)

      // Hide after 2.8s
      setTimeout(() => setNotifVisible(false), 2800)
    }

    // First notification after 2s
    const first = setTimeout(cycle, 2000)

    // Then every 5s
    const interval = setInterval(cycle, 5000)

    return () => {
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [mounted])

  return (
    <div className="hidden lg:block rounded-[8px] border border-border bg-card overflow-hidden shadow-[0_16px_40px_rgba(20,16,12,0.13),0_2px_8px_rgba(20,16,12,0.06)] rotate-[-0.4deg] relative">

      {/* Notification toast */}
      <div
        className="absolute top-10 right-2 z-10 pointer-events-none"
        style={{
          transition: 'opacity 400ms ease, transform 400ms ease',
          opacity:   notifVisible ? 1 : 0,
          transform: notifVisible ? 'translateY(0)' : 'translateY(-6px)',
        }}
      >
        <div className="flex items-start gap-2 bg-card border border-border rounded-[6px] shadow-lg px-3 py-2 max-w-[180px]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-[3px]" />
          <p className="text-[10px] text-foreground leading-[1.4]">{notification}</p>
        </div>
      </div>

      {/* Browser chrome */}
      <div className="bg-muted px-3 py-2 border-b border-border flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-destructive/70" />
        <span className="w-2 h-2 rounded-full bg-warning/70" />
        <span className="w-2 h-2 rounded-full bg-success/70" />
        <span className="ml-2 font-mono text-[11px] text-muted-foreground">leea.com.br · dashboard</span>
      </div>

      {/* App layout */}
      <div className="flex">

        {/* Mini sidebar */}
        <div className="w-9 shrink-0 border-r border-border bg-muted/40 flex flex-col items-center pt-3 pb-4 gap-2.5">
          <img
            src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png"
            alt=""
            className="w-5 h-5 mb-1"
          />
          {NAV_ITEMS.map((item, i) => (
            <div
              key={item}
              title={item}
              className={`w-4 h-[3px] rounded-full transition-colors ${i === 0 ? 'bg-primary/80' : 'bg-border'}`}
              style={{
                opacity:   mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateX(-4px)',
                transition: `opacity 300ms ease ${i * 60}ms, transform 300ms ease ${i * 60}ms`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-3">

          {/* Top bar */}
          <div
            className="flex items-center justify-between mb-3"
            style={{
              opacity:   mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateY(-4px)',
              transition: 'opacity 300ms ease 80ms, transform 300ms ease 80ms',
            }}
          >
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.07em] text-muted-foreground">Bom dia, Rafael</p>
              <p className="text-[12px] font-semibold leading-tight">Dashboard</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
              R
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              { label: 'Casos ativos', value: '14',      color: ''                },
              { label: 'Prazos hoje',  value: '3',       color: 'text-destructive'},
              { label: 'A receber',    value: 'R$ 184k', color: ''                },
              { label: 'Clientes',     value: '28',      color: ''                },
            ].map(({ label, value, color }, i) => (
              <div
                key={label}
                className="p-2 border border-border rounded-[4px] bg-background/60"
                style={{
                  opacity:   mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateY(6px)',
                  transition: `opacity 350ms ease ${120 + i * 70}ms, transform 350ms ease ${120 + i * 70}ms`,
                }}
              >
                <div className="font-mono text-[8px] uppercase tracking-[0.06em] text-muted-foreground mb-0.5">{label}</div>
                <div className={`font-serif text-[17px] leading-none ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Prazos */}
          <div className="border border-border rounded-[5px] overflow-hidden">
            <div className="px-2.5 py-1.5 bg-muted/50 border-b border-border">
              <span className="font-mono text-[9px] uppercase tracking-[0.07em] text-muted-foreground">Prazos críticos</span>
            </div>
            {PRAZOS.map(({ titulo, prazo, tipo }, i) => (
              <div
                key={titulo}
                className="flex justify-between items-center px-2.5 py-2 border-b border-border last:border-0"
                style={{
                  opacity:   mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateX(-6px)',
                  transition: `opacity 350ms ease ${300 + i * 80}ms, transform 350ms ease ${300 + i * 80}ms`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  {/* Ping dot para crítico */}
                  <span className="relative flex h-2 w-2 shrink-0">
                    {tipo === 'danger' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-60" />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${tipo === 'danger' ? 'bg-destructive' : 'bg-amber-500'}`} />
                  </span>
                  <span className="text-[11px] truncate max-w-[130px]">{titulo}</span>
                </div>
                <span className={`font-mono text-[10px] font-medium shrink-0 ${tipo === 'danger' ? 'text-destructive' : 'text-amber-500'}`}>
                  {prazo}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
