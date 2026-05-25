import { Check, Zap, Building, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 89',
    period: '/mês',
    desc: 'Para advogados solo ou pequenas duplas que querem sair das planilhas.',
    icon: Star,
    highlight: false,
    features: [
      'Até 2 advogados',
      '50 casos ativos',
      '5 GB de documentos',
      'Clientes ilimitados',
      'Modelos básicos',
      'Suporte por e-mail',
    ],
    missing: ['Relatórios avançados', 'API/integrações', 'SLA de suporte', 'Customização'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 189',
    period: '/mês',
    desc: 'Para escritórios em crescimento com múltiplos advogados e cases complexas.',
    icon: Zap,
    highlight: true,
    features: [
      'Até 8 advogados',
      'Casos ilimitados',
      '50 GB de documentos',
      'Clientes ilimitados',
      'Todos os modelos',
      'Relatórios avançados',
      'Suporte prioritário',
      'Logs de auditoria',
    ],
    missing: ['API/integrações', 'SLA garantido', 'Treinamento dedicado'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    desc: 'Para grandes escritórios com necessidades customizadas de segurança e integração.',
    icon: Building,
    highlight: false,
    features: [
      'Advogados ilimitados',
      'Casos ilimitados',
      'Armazenamento ilimitado',
      'API completa',
      'SSO / LDAP',
      'SLA 99,9% garantido',
      'Suporte dedicado',
      'Treinamento da equipe',
      'Customização de marca',
      'Contratos anuais',
    ],
    missing: [],
  },
]

const COMPARISON = [
  { feature: 'Advogados', starter: '2', pro: '8', enterprise: 'Ilimitado' },
  { feature: 'Casos ativos', starter: '50', pro: 'Ilimitado', enterprise: 'Ilimitado' },
  { feature: 'Armazenamento', starter: '5 GB', pro: '50 GB', enterprise: 'Ilimitado' },
  { feature: 'Clientes', starter: 'Ilimitado', pro: 'Ilimitado', enterprise: 'Ilimitado' },
  { feature: 'Modelos', starter: 'Básicos', pro: 'Todos', enterprise: 'Todos + custom' },
  { feature: 'Relatórios', starter: '—', pro: '✓', enterprise: '✓' },
  { feature: 'API', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'SSO/LDAP', starter: '—', pro: '—', enterprise: '✓' },
  { feature: 'SLA', starter: '—', pro: 'Prioritário', enterprise: '99,9%' },
  { feature: 'Suporte', starter: 'E-mail', pro: 'Chat + E-mail', enterprise: 'Dedicado' },
]

export default function PlanosPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Planos e preços</h1>
        <p className="text-sm text-muted-foreground">
          Comece com 14 dias grátis. Sem cartão de crédito. Cancele quando quiser.
        </p>
      </div>

      {/* Planos */}
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          return (
            <Card key={plan.id} className={plan.highlight ? 'border-primary ring-1 ring-primary' : ''}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon size={15} />
                  </div>
                  {plan.highlight && <Badge className="text-[10px]">Recomendado</Badge>}
                </div>
                <h2 className="text-base font-bold">{plan.name}</h2>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.desc}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  variant={plan.highlight ? 'default' : 'outline'}
                  size="sm"
                >
                  {plan.id === 'enterprise' ? 'Falar com vendas' : 'Começar grátis'}
                </Button>
                <div className="space-y-2">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={13} className={plan.highlight ? 'text-primary' : 'text-emerald-600 dark:text-emerald-400'} />
                      <span className="text-xs">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-center gap-2 opacity-40">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <div className="w-3 h-px bg-muted-foreground" />
                      </div>
                      <span className="text-xs">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabela comparativa */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-base font-bold mb-4">Comparativo detalhado</h2>
        <div className="rounded-lg border overflow-hidden bg-card">
          <div className="grid grid-cols-4 border-b bg-muted/30">
            <div className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Recurso</div>
            {['Starter', 'Pro', 'Enterprise'].map(p => (
              <div key={p} className="px-4 py-2.5 text-xs font-semibold text-center">{p}</div>
            ))}
          </div>
          <div className="divide-y">
            {COMPARISON.map((row) => (
              <div key={row.feature} className="grid grid-cols-4 hover:bg-muted/20 transition-colors">
                <div className="px-4 py-2.5 text-xs text-muted-foreground">{row.feature}</div>
                <div className="px-4 py-2.5 text-xs text-center">{row.starter}</div>
                <div className="px-4 py-2.5 text-xs text-center font-medium">{row.pro}</div>
                <div className="px-4 py-2.5 text-xs text-center">{row.enterprise}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
