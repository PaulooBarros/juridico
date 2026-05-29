'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export type AreaDataPoint = { area: string; count: number }

// Paleta que funciona em light e dark
const COLORS = [
  '#6E1A1E', // oxblood
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#6b7280', // gray-500
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground mb-0.5">{name}</p>
      <p className="font-semibold text-foreground">{value} caso{value !== 1 ? 's' : ''}</p>
    </div>
  )
}

function CustomLegend({ payload }: any) {
  if (!payload?.length) return null
  return (
    <ul className="flex flex-col gap-1 mt-2">
      {payload.map((entry: any, i: number) => (
        <li key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="truncate">{entry.value}</span>
          <span className="ml-auto font-medium text-foreground tabular">{entry.payload.count}</span>
        </li>
      ))}
    </ul>
  )
}

export function CasesAreaChart({ data }: { data: AreaDataPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
        Nenhum caso ativo cadastrado.
      </div>
    )
  }

  return (
    <div className="flex gap-4 items-center h-[200px]">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="area"
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={72}
            strokeWidth={2}
            stroke="hsl(var(--card))"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex-1 min-w-0 overflow-y-auto max-h-[200px]">
        <CustomLegend
          payload={data.map((d, i) => ({
            value: d.area,
            color: COLORS[i % COLORS.length],
            payload: d,
          }))}
        />
      </div>
    </div>
  )
}
