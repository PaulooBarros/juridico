import { Check, Lock, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/*
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
*/

const BETA_FEATURES = [
  'Gestão completa de casos',
  'Cadastro ilimitado de clientes',
  'Upload de documentos PDF',
  'Controle de prazos e audiências',
  'Calendário integrado',
  'Gestão de equipe',
  'Controle financeiro',
  'Perfil do escritório',
  'Notificações',
  'Acesso antecipado a novidades',
]

export default function PlanosPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full mb-4">
          <Lock size={9} /> Beta privado
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Acesso antecipado</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A Leea está em testes fechados. Durante o beta, o acesso é gratuito e você
          tem todas as funcionalidades disponíveis sem restrições.
        </p>
      </div>

      {/* Card beta */}
      <div className="max-w-sm mx-auto">
        <Card className="border-primary ring-1 ring-primary">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Lock size={14} />
              </div>
              <Badge className="text-[10px]">Seu plano atual</Badge>
            </div>
            <h2 className="text-base font-bold">Beta Privado</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">Grátis</span>
              <span className="text-sm text-muted-foreground">durante o beta</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Acesso completo à plataforma enquanto aperfeiçoamos o produto com você.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {BETA_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2">
                <Check size={13} className="text-primary shrink-0" />
                <span className="text-xs">{f}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Aviso lançamento */}
      <div className="max-w-sm mx-auto rounded-xl border border-border bg-muted/30 p-5 text-center space-y-2">
        <Mail size={18} className="text-muted-foreground mx-auto" />
        <p className="text-sm font-medium">Planos pagos em breve</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Assim que os planos forem lançados, você será notificado por e-mail
          com condições especiais para quem participou do beta.
        </p>
      </div>
    </div>
  )
}
