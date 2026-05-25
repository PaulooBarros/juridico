import { cn } from '@/lib/utils'
import type { DeadlinePriority, NotificationPriority } from '@/lib/types'

const PRIORITY_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  critical: { label: 'Crítico', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  high: { label: 'Alto', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  medium: { label: 'Médio', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  low: { label: 'Baixo', dot: 'bg-zinc-400', text: 'text-zinc-500 dark:text-zinc-400' },
  info: { label: 'Info', dot: 'bg-zinc-400', text: 'text-zinc-500 dark:text-zinc-400' },
}

export function PriorityDot({ priority }: { priority: DeadlinePriority | NotificationPriority }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('inline-block w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />
      <span className={cn('text-xs font-medium', config.text)}>{config.label}</span>
    </span>
  )
}

export function PriorityIndicator({ priority }: { priority: DeadlinePriority | NotificationPriority }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className={cn('inline-block w-1 h-full min-h-[2.5rem] rounded-full flex-shrink-0', config.dot)} />
  )
}
