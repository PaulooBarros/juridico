import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'warning' | 'critical' | 'success'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StatsCard({ title, value, description, icon: _icon, trend, variant = 'default' }: StatsCardProps) {
  const valueColor = {
    default:  '',
    warning:  'text-warning',
    critical: 'text-destructive',
    success:  'text-success',
  }[variant]

  const trendColor = trend && trend.value >= 0 ? 'text-success' : 'text-destructive'

  return (
    <div className="bg-card border border-border rounded-[8px] p-[18px] flex flex-col gap-1">
      <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.06em]">{title}</div>
      <div className={cn('font-serif text-[30px] font-medium tracking-[-0.015em] leading-[1.1] tabular', valueColor)}>
        {value}
      </div>
      {description && (
        <div className="font-mono text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
          {description}
        </div>
      )}
      {trend && (
        <div className={cn('font-mono text-[11px] flex items-center gap-1 mt-0.5', trendColor)}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </div>
      )}
    </div>
  )
}
