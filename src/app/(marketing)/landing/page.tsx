'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Check, Briefcase, Users, Calendar, FileText, DollarSign, UsersRound, Quote, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { WaitlistForm } from './waitlist-form'
import { DashboardPreview } from './dashboard-preview'
import { LeeaLogo } from '@/components/ui/leea-logo'

// ─── Variants ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const fadeLeft: Variants = {
  hidden:   { opacity: 0, x: -20 },
  visible:  { opacity: 1, x: 0,  transition: { duration: 0.45, ease: 'easeOut' } },
}

const fadeIn: Variants = {
  hidden:   { opacity: 0 },
  visible:  { opacity: 1, transition: { duration: 0.5 } },
}

const stagger = (delay = 0.08): Variants => ({
  hidden:   {},
  visible:  { transition: { staggerChildren: delay } },
})

const VIEW = { once: true, margin: '-80px' as const }

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODULES = [
  { icon: Briefcase,   title: 'Casos',                desc: 'Cada processo com timeline, prazos, partes, documentos e responsável. Um único lugar para tudo.' },
  { icon: Users,       title: 'Clientes',             desc: 'PF e PJ. Histórico completo: contratos, casos, financeiro, comunicação.' },
  { icon: Calendar,    title: 'Prazos & Calendário',  desc: 'Cálculo automático de prazos processuais. Alertas escalonados por criticidade.' },
  { icon: FileText,    title: 'Documentos & Modelos', desc: 'Upload, versionamento e modelos reutilizáveis vinculados a casos e clientes.' },
  { icon: DollarSign,  title: 'Financeiro',           desc: 'Honorários, despesas e pagamentos organizados. Sem planilha separada.' },
  { icon: UsersRound,  title: 'Equipe & Permissões',  desc: 'Convites por e-mail, roles por função. Cada um vê o que precisa ver.' },
]

const PROBLEMS = [
  ['Prazos descobertos na véspera',   'Planilhas paralelas, e-mails perdidos, lembretes que ninguém atualiza. Um esquecimento custa o caso — e a relação com o cliente.'],
  ['Cliente sem visibilidade',         'O cliente liga para saber em que pé está o processo. A resposta depende de quem atender o telefone naquele dia.'],
  ['Crescimento que vira caos',        'Cada novo advogado contratado significa mais reuniões, mais retrabalho e menos previsibilidade. O escritório escala — e perde controle.'],
]

const PARADIGMAS = [
  ['Antes', 'Software jurídico = repositório passivo. Você lança o que aconteceu.'],
  ['Agora', 'Sistema operacional = o trabalho acontece dentro dele. O sistema avisa, sugere, cobra.'],
  ['Antes', 'Um CRM, um financeiro, um drive, três planilhas. Nenhum conversa.'],
  ['Agora', 'Uma única superfície. Cliente → caso → prazo → documento. Rastreável.'],
  ['Antes', 'Cada sócio com sua maneira. Onboarding de novo advogado leva semanas.'],
  ['Agora', 'O método do escritório está no software. O sistema é o playbook.'],
]

const PILLARS = [
  ['Conformidade brasileira',          'LGPD, certificado digital ICP-Brasil, integração com PJe, eSAJ, Projudi. Não é adaptação — é nativo.'],
  ['Construído com advogados',         'Cada módulo passou por bancas de litígio, contencioso, contratos e família. O método veio da prática.'],
  ['Soberania dos seus dados',         'Dados em data center brasileiro. Backup contínuo. Auditoria de acesso. Você sai com tudo, quando quiser.'],
  ['Feito por quem entende o direito', 'A Leea nasceu de uma história real — de quem viveu de perto o que um escritório desestruturado custa. Por isso cada detalhe foi pensado para advogados, não para desenvolvedores.'],
]

const TESTIMONIALS = [
  { quote: 'Antes eu vivia com medo de perder prazo. Hoje a Leea avisa antes de eu precisar lembrar. Recuperei horas que eu nem sabia que estava perdendo.', name: 'Ana Paula Ferreira', role: 'Advogada Trabalhista · OAB/SP' },
  { quote: 'Tentei planilha, tentei WhatsApp, tentei agenda. Nada funcionava junto. A Leea foi a primeira vez que senti que o escritório estava realmente organizado.', name: 'Ricardo Melo', role: 'Advogado Cível · OAB/RJ' },
  { quote: 'O que me convenceu foi a simplicidade. Não precisei de treinamento. No primeiro dia já estava usando de verdade.', name: 'Camila Souza', role: 'Advogada de Família · OAB/MG' },
  { quote: 'Meus clientes pararam de ligar perguntando sobre o processo. Agora eles confiam que vão ser avisados. Isso mudou minha relação com eles.', name: 'Bruno Alves', role: 'Advogado Previdenciário · OAB/PR' },
]

const PLANS = [
  { id: 'free', name: 'Free', price: 'R$ 0', period: '', desc: 'Comece agora, sem cartão. Para advogados que querem sair das planilhas de graça.', featured: false, cta: 'Criar conta grátis', features: ['Até 2 usuários','Até 10 clientes','Até 5 casos ativos','Agenda jurídica','Documentos — 500 MB'], absent: ['Financeiro','Equipe & permissões','Modelos de documentos','Relatórios'] },
  { id: 'start', name: 'Start', price: 'R$ 39', period: '/mês', desc: 'Preço agressivo para bancas que estão crescendo e precisam de controle real.', featured: false, cta: 'Começar 14 dias grátis', features: ['Até 5 usuários','Clientes ilimitados','Casos ilimitados','Calendário & tarefas','Upload de documentos — 2 GB','Financeiro básico'], absent: ['Equipe & permissões avançadas','Modelos de documentos','Relatórios'] },
  { id: 'escritorio', name: 'Escritório', price: 'R$ 79', period: '/mês', desc: 'O plano principal. Operação completa para escritórios que não abrem mão de eficiência.', featured: true, cta: 'Começar 14 dias grátis', features: ['Até 15 usuários','Clientes ilimitados','Casos ilimitados','Documentos — 10 GB','Dashboard operacional','Equipe & permissões','Modelos de documentos','Pipeline de processos','Relatórios avançados'], absent: [] },
]

const FAQ = [
  ['O plano Free é realmente gratuito?',      'Sim, sem cartão e sem prazo de expiração. Você usa o Free para sempre dentro dos limites do plano.'],
  ['Como funciona o trial nos planos pagos?', '14 dias com acesso completo ao plano escolhido, sem cartão de crédito. Só cobra se você decidir continuar.'],
  ['Posso mudar de plano depois?',            'Sim, a qualquer momento. O ajuste é proporcional ao período restante da vigência — sem multa.'],
  ['Meus dados ficam seguros?',               'Os dados ficam em data center brasileiro, com criptografia em repouso e em trânsito. Backup diário, retenção de 90 dias. Você pode exportar tudo quando quiser.'],
  ['Por que o nome Leea?',                    'É um nome com história. Leea foi inspirado em uma pessoa real — alguém que representa o cuidado e a atenção que todo cliente merece sentir. O nome não é uma sigla. É uma escolha.'],
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-10 bg-background border-b border-border px-4 md:px-10 flex items-center justify-between h-[54px]"
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png"
            alt=""
            className="w-[22px] h-[22px]"
          />
          <LeeaLogo variant="light" height={18} className="dark:hidden" />
          <LeeaLogo variant="dark"  height={18} className="hidden dark:block" />
          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
            <Lock size={8} /> Beta privado
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[13px] text-muted-foreground">
          <a href="#modulos" className="hover:text-foreground transition-colors">Módulos</a>
          <a href="#pilares" className="hover:text-foreground transition-colors">Por que a Leea</a>
          <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/login" className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-[5px] transition-colors">Entrar</Link>
          <Link href="/cadastro" className="px-3 py-1.5 text-[13px] font-medium bg-primary text-primary-foreground rounded-[5px] hover:bg-primary/90 transition-colors whitespace-nowrap">
            <span className="hidden sm:inline">Começar gratuitamente</span>
            <span className="sm:hidden">Começar</span>
          </Link>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="dotted-bg border-b border-border px-4 md:px-10 py-16 md:py-24">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-16 items-center">
          <motion.div variants={stagger(0.1)} initial="hidden" animate="visible">
            <motion.h1 variants={fadeUp} className="font-serif text-[36px] sm:text-[44px] md:text-[52px] leading-[1.05] tracking-[-0.025em] font-medium mb-6">
              Quando tudo está sob controle,<br />
              a advocacia fica <em className="text-primary">inevitável.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[15px] md:text-[17px] text-muted-foreground leading-[1.55] max-w-[52ch] mb-8">
              A Leea organiza casos, prazos, documentos e financeiro em uma única superfície. Sem planilhas paralelas, sem prazo descoberto na véspera.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
              <Link href="/cadastro" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-[5px] text-[14px] font-medium hover:bg-primary/90 transition-colors">
                Criar minha conta
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-5 py-2.5 rounded-[5px] text-[14px] font-medium hover:bg-accent transition-colors">
                Explorar a demonstração
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-6 mt-7 text-[12px] text-muted-foreground">
              {['Sem cartão de crédito', 'Migração assistida', 'LGPD nativo'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary shrink-0" />{t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32, rotate: -0.4 }}
            animate={{ opacity: 1, x: 0,  rotate: -0.4 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="px-4 md:px-10 py-16 md:py-24 border-b border-border">
        <div className="max-w-[1080px] mx-auto">
          <motion.p variants={fadeLeft} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">
            01 — O problema real
          </motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[20ch] mb-12">
            A advocacia brasileira ainda opera <em className="text-primary">no limite.</em>
          </motion.h2>
          <motion.div variants={stagger(0.12)} initial="hidden" whileInView="visible" viewport={VIEW}
            className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PROBLEMS.map(([t, b], i) => (
              <motion.div key={i} variants={fadeUp} className="pl-6 border-l-2 border-primary">
                <div className="font-mono text-[11px] text-primary mb-2">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-[17px] font-medium mb-2.5">{t}</h3>
                <p className="text-[14px] text-muted-foreground leading-[1.55]">{b}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PARADIGMA */}
      <section className="px-4 md:px-10 py-16 md:py-24 border-b border-border">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          <div className="lg:sticky lg:top-20">
            <motion.p variants={fadeLeft} initial="hidden" whileInView="visible" viewport={VIEW}
              className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">
              02 — Mudança de paradigma
            </motion.p>
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEW}
              className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[18ch]">
              De ferramenta acessória a <em className="text-primary">sistema nervoso do escritório.</em>
            </motion.h2>
          </div>
          <motion.div variants={stagger(0.07)} initial="hidden" whileInView="visible" viewport={VIEW}>
            {PARADIGMAS.map(([k, t], i) => (
              <motion.div key={i} variants={k === 'Agora' ? fadeUp : fadeLeft}
                className="grid grid-cols-[100px_1fr] gap-4 py-4 border-b border-border last:border-0">
                <div className={`font-mono text-[11px] uppercase tracking-[0.06em] ${k === 'Agora' ? 'text-primary' : 'text-muted-foreground'}`}>{k}</div>
                <div className={`text-[15px] ${k === 'Agora' ? 'text-foreground' : 'text-muted-foreground'}`}>{t}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="modulos" className="px-4 md:px-10 py-16 md:py-24 border-b border-border">
        <div className="max-w-[1080px] mx-auto">
          <motion.p variants={fadeLeft} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">
            03 — Seis módulos, uma operação
          </motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[22ch] mb-12">
            Tudo para organizar seu escritório, <em className="text-primary">sem ferramentas espalhadas.</em>
          </motion.h2>
          <motion.div variants={stagger(0.07)} initial="hidden" whileInView="visible" viewport={VIEW}
            className="border border-border rounded-[12px] overflow-hidden grid grid-cols-1 md:grid-cols-3">
            {MODULES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeUp}
                className={['p-6', i % 3 !== 2 ? 'md:border-r border-border' : '', i < 3 ? 'border-b border-border' : ''].join(' ')}>
                <Icon size={20} className="text-primary mb-3.5" />
                <h3 className="text-[16px] font-medium mb-1.5">{title}</h3>
                <p className="text-[13px] text-muted-foreground leading-[1.55]">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PILARES */}
      <section id="pilares" className="px-4 md:px-10 py-16 md:py-24 border-b border-border bg-muted">
        <div className="max-w-[1080px] mx-auto">
          <motion.p variants={fadeLeft} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">
            04 — Por que confiar
          </motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[22ch] mb-12">
            Construído com quem entende — <em className="text-primary">e usa todos os dias.</em>
          </motion.h2>
          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="visible" viewport={VIEW}
            className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PILLARS.map(([t, b], i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="font-serif text-[30px] italic text-primary mb-4">{String(i + 1).padStart(2, '0')}.</div>
                <h3 className="text-[18px] font-medium mb-2">{t}</h3>
                <p className="text-[14px] text-muted-foreground leading-[1.6]">{b}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="planos" className="px-4 md:px-10 py-20 md:py-32 border-b border-border text-center" style={{ backgroundColor: '#1A1714' }}>
        <motion.div variants={stagger(0.12)} initial="hidden" whileInView="visible" viewport={VIEW}
          className="max-w-[640px] mx-auto">
          <motion.span variants={fadeIn}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] border border-primary/40 text-primary px-3 py-1 rounded-full mb-6">
            <Lock size={9} /> Beta privado
          </motion.span>
          <motion.h2 variants={fadeUp}
            className="font-serif text-[34px] sm:text-[42px] leading-[1.08] tracking-[-0.025em] font-medium mb-4" style={{ color: '#FBFAF6' }}>
            Estamos em testes<br /><em style={{ color: '#A8231F' }}>fechados.</em>
          </motion.h2>
          <motion.p variants={fadeUp}
            className="text-[15px] leading-[1.6] mb-10 max-w-[44ch] mx-auto" style={{ color: '#9C9187' }}>
            A Leea ainda não está aberta ao público. Deixe seu email e entraremos em contato assim que liberar o acesso.
          </motion.p>
          <motion.div variants={fadeUp} className="flex justify-center">
            <WaitlistForm />
          </motion.div>
          <motion.p variants={fadeIn} className="text-[12px] mt-5" style={{ color: '#5C554C' }}>
            Sem spam. Só um aviso quando estiver pronto.
          </motion.p>
        </motion.div>
      </section>

      {/* PLANOS — comentado durante beta; reativar no lançamento */}
      {false && <section id="planos-launch" className="px-4 md:px-10 py-16 md:py-24 border-b border-border">
        <div className="max-w-[1080px] mx-auto">
          <p className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">05 — Planos</p>
          <h2 className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[22ch] mb-3">
            Preço justo desde o <em className="text-primary">primeiro cliente.</em>
          </h2>
          <p className="text-[15px] text-muted-foreground mb-12 max-w-[52ch]">
            Comece grátis para sempre. Nos planos pagos, 14 dias de trial sem cartão de crédito.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {PLANS.map((plan) => (
              <div key={plan.id} className={['relative flex flex-col rounded-[10px] border p-6', plan.featured ? 'border-foreground bg-foreground text-background' : 'border-border bg-card'].join(' ')}>
                {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.08em] bg-primary text-primary-foreground px-3 py-1 rounded-full">Recomendado</span>}
                <div className="mb-5">
                  <p className={['font-mono text-[11px] uppercase tracking-[0.06em] mb-3', plan.featured ? 'text-background/60' : 'text-muted-foreground'].join(' ')}>{plan.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="font-serif text-[36px] leading-none font-medium">{plan.price}</span>
                    {plan.period && <span className={['text-[13px] mb-1', plan.featured ? 'text-background/60' : 'text-muted-foreground'].join(' ')}>{plan.period}</span>}
                  </div>
                  <p className={['text-[13px] leading-[1.5]', plan.featured ? 'text-background/70' : 'text-muted-foreground'].join(' ')}>{plan.desc}</p>
                </div>
                <Link href="/cadastro" className={['w-full flex items-center justify-center h-9 rounded-[5px] text-[13px] font-medium transition-colors mb-6', plan.featured ? 'bg-background text-foreground hover:bg-background/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'].join(' ')}>{plan.cta}</Link>
                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map((f) => (<li key={f} className="flex items-start gap-2 text-[13px]"><Check size={13} className="shrink-0 mt-0.5 text-primary" /><span className={plan.featured ? 'text-background/85' : ''}>{f}</span></li>))}
                  {plan.absent.map((f) => (<li key={f} className="flex items-start gap-2 text-[13px]"><span className="w-[13px] h-[13px] shrink-0 mt-0.5 flex items-center justify-center"><span className={['block w-2 h-px', plan.featured ? 'bg-background/30' : 'bg-border'].join(' ')} /></span><span className={plan.featured ? 'text-background/35' : 'text-muted-foreground/50'}>{f}</span></li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* DEPOIMENTOS */}
      <section className="px-4 md:px-10 py-16 md:py-24 border-b border-border bg-muted">
        <div className="max-w-[1080px] mx-auto">
          <motion.p variants={fadeLeft} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">
            06 — Quem já usa
          </motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[22ch] mb-12">
            Advogados que pararam <em className="text-primary">de improvisar.</em>
          </motion.h2>
          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="visible" viewport={VIEW}
            className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TESTIMONIALS.map(({ quote, name, role }) => (
              <motion.div key={name} variants={fadeUp}
                className="bg-card border border-border rounded-[10px] p-6 flex flex-col gap-4">
                <Quote size={18} className="text-primary/40 shrink-0" />
                <p className="text-[14px] text-foreground leading-[1.65] flex-1">{quote}</p>
                <div className="border-t border-border pt-4">
                  <p className="text-[13px] font-medium">{name}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.p variants={fadeIn} initial="hidden" whileInView="visible" viewport={VIEW}
            className="text-[11px] text-muted-foreground/60 text-center mt-8">
            Depoimentos de advogados em fase beta. Resultados reais, nomes ficcionais até o lançamento oficial.
          </motion.p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-10 py-16 md:py-24 border-b border-border">
        <div className="max-w-[1080px] mx-auto">
          <motion.p variants={fadeLeft} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">
            07 — FAQ
          </motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEW}
            className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[22ch] mb-12">
            Perguntas <em className="text-primary">frequentes.</em>
          </motion.h2>
          <motion.div variants={stagger(0.08)} initial="hidden" whileInView="visible" viewport={VIEW}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
            {FAQ.map(([q, a]) => (
              <motion.div key={q} variants={fadeUp}>
                <p className="text-[15px] font-medium mb-1.5">{q}</p>
                <p className="text-[13px] text-muted-foreground leading-[1.6]">{a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 md:px-10 py-20 md:py-32 border-b border-border text-center">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="visible" viewport={VIEW}
          className="max-w-[760px] mx-auto">
          <motion.h2 variants={fadeUp}
            className="font-serif text-[34px] sm:text-[42px] md:text-[48px] leading-[1.05] tracking-[-0.025em] font-medium mb-4">
            Quando tudo está sob controle,<br />
            a advocacia fica <em className="text-primary">inevitável.</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[15px] md:text-[16px] text-muted-foreground mb-8">
            Centenas de advogados já pararam de improvisar. Comece hoje.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/cadastro" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-[5px] text-[14px] font-medium hover:bg-primary/90 transition-colors">
              Criar minha conta
            </Link>
          </motion.div>
          <motion.p variants={fadeIn} className="text-[12px] text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
            <Check size={11} className="text-primary" /> Sem cartão de crédito
          </motion.p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <motion.footer variants={fadeIn} initial="hidden" whileInView="visible" viewport={VIEW}
        className="px-4 md:px-10 py-12">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/LeeaDesign/leea-perfil-instagram%20alta%20resolucao.png"
                alt="Leea"
                className="w-8 h-8"
              />
              <div>
                <LeeaLogo variant="light" height={18} className="dark:hidden" />
                <LeeaLogo variant="dark"  height={18} className="hidden dark:block" />
              </div>
            </div>
            <p className="font-serif italic text-[15px] text-muted-foreground max-w-[32ch]">
              &ldquo;Quando tudo está sob controle, a advocacia fica inevitável.&rdquo;
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
              <span>·</span>
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <span>·</span>
              <a href="#" className="hover:text-foreground transition-colors">LGPD</a>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">© 2026 Leea · Aracaju, Brasil</p>
          </div>
        </div>
      </motion.footer>

    </div>
  )
}
