import Link from 'next/link'
import { Check, Briefcase, Users, Calendar, FileText, DollarSign, UsersRound } from 'lucide-react'

const MODULES = [
  { icon: Briefcase,   title: 'Casos',                desc: 'Cada processo com timeline, prazos, partes, documentos e responsável. Um único lugar para tudo.' },
  { icon: Users,       title: 'Clientes',             desc: 'PF e PJ. Histórico completo: contratos, casos, financeiro, comunicação.' },
  { icon: Calendar,    title: 'Prazos & Calendário',  desc: 'Cálculo automático de prazos processuais. Alertas escalonados por criticidade.' },
  { icon: FileText,    title: 'Documentos & Modelos', desc: 'Versionamento, busca por conteúdo, modelos com variáveis. Sem mais procurar a última versão.' },
  { icon: DollarSign,  title: 'Financeiro',           desc: 'Honorários fixos, êxito, recorrências. Cobrança automatizada. Visão por cliente, caso, advogado.' },
  { icon: UsersRound,  title: 'Equipe & Permissões',  desc: 'Roles claras: titular, sócio, advogado, assistente. Cada um vê o que precisa.' },
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
  ['Conformidade brasileira',     'LGPD, certificado digital ICP-Brasil, integração com PJe, eSAJ, Projudi. Não é adaptação — é nativo.'],
  ['Construído com advogados',    'Cada módulo passou por bancas de litígio, contencioso, contratos e família. O método veio da prática.'],
  ['Soberania dos seus dados',    'Dados em data center brasileiro. Backup contínuo. Auditoria de acesso. Você sai com tudo, quando quiser.'],
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* NAV */}
      <nav className="sticky top-0 z-10 bg-background border-b border-border px-10 flex items-center justify-between h-[54px]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">
            V
          </div>
          <span className="font-serif font-medium text-[16px] tracking-[-0.01em]">
            Vetor <em className="text-primary not-italic">Jurídico</em>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[13px] text-muted-foreground">
          <a href="#modulos" className="hover:text-foreground transition-colors">Módulos</a>
          <a href="#pilares" className="hover:text-foreground transition-colors">Por que Vetor</a>
          <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/login" className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-[5px] transition-colors">
            Entrar
          </Link>
          <Link href="/cadastro" className="px-3 py-1.5 text-[13px] font-medium bg-primary text-primary-foreground rounded-[5px] hover:bg-primary/90 transition-colors">
            Começar gratuitamente
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="dotted-bg border-b border-border px-10 py-24">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-16 items-center">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-5">
              — Sistema operacional jurídico
            </p>
            <h1 className="font-serif text-[52px] leading-[1.05] tracking-[-0.025em] font-medium mb-6">
              Quando tudo está sob controle,<br />
              a advocacia fica <em className="text-primary">inevitável.</em>
            </h1>
            <p className="text-[17px] text-muted-foreground leading-[1.55] max-w-[52ch] mb-8">
              O Vetor Jurídico organiza casos, prazos, documentos e o financeiro em uma única superfície. Nada de planilhas paralelas, e-mails perdidos, ou prazos descobertos na véspera.
            </p>
            <div className="flex items-center gap-2">
              <Link href="/cadastro" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-[5px] text-[14px] font-medium hover:bg-primary/90 transition-colors">
                Criar conta — 14 dias grátis
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-5 py-2.5 rounded-[5px] text-[14px] font-medium hover:bg-accent transition-colors">
                Ver demonstração
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-7 text-[12px] text-muted-foreground">
              {['Sem cartão de crédito', 'Migração assistida', 'LGPD nativo'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={12} className="text-primary shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mini dashboard preview */}
          <div className="hidden lg:block rounded-[8px] border border-border bg-card overflow-hidden shadow-[0_12px_32px_rgba(20,16,12,0.10),0_2px_6px_rgba(20,16,12,0.04)] rotate-[-0.4deg]">
            <div className="bg-muted px-3 py-2 border-b border-border flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-destructive/70" />
              <span className="w-2 h-2 rounded-full bg-warning/70" />
              <span className="w-2 h-2 rounded-full bg-success/70" />
              <span className="ml-2">vetorjuridico.com.br · dashboard</span>
            </div>
            <div className="p-4">
              <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.06em] mb-3">Prazos críticos</div>
              {[
                ['Manifestação · Vale Itajaí', '2 dias', 'danger'],
                ['Audiência · Móveis Serra',   '2 dias', 'danger'],
                ['Contrarrazões · TechBras',   '3 dias', 'warning'],
              ].map(([t, d, v]) => (
                <div key={t} className="flex justify-between items-center py-2.5 border-b border-border last:border-0 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v === 'danger' ? 'bg-destructive' : 'bg-warning'}`} />
                    <span>{t}</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">{d}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[['Casos ativos', '14'], ['A receber', 'R$ 184k']].map(([l, v]) => (
                  <div key={l} className="p-2.5 border border-border rounded-[5px]">
                    <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{l}</div>
                    <div className="font-serif text-[22px] mt-1">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="px-10 py-24 border-b border-border">
        <div className="max-w-[1080px] mx-auto">
          <p className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">01 — O problema real</p>
          <h2 className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[20ch] mb-12">
            A advocacia brasileira ainda opera por <em className="text-primary">improviso.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PROBLEMS.map(([t, b], i) => (
              <div key={i} className="pl-6 border-l-2 border-primary">
                <div className="font-mono text-[11px] text-primary mb-2">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-[17px] font-medium mb-2.5">{t}</h3>
                <p className="text-[14px] text-muted-foreground leading-[1.55]">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARADIGMA */}
      <section className="px-10 py-24 border-b border-border">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          <div className="lg:sticky lg:top-20">
            <p className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">02 — Mudança de paradigma</p>
            <h2 className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[18ch]">
              De ferramenta acessória a <em className="text-primary">infraestrutura do escritório.</em>
            </h2>
          </div>
          <div>
            {PARADIGMAS.map(([k, t], i) => (
              <div key={i} className="grid grid-cols-[100px_1fr] gap-4 py-4 border-b border-border last:border-0">
                <div className={`font-mono text-[11px] uppercase tracking-[0.06em] ${k === 'Agora' ? 'text-primary' : 'text-muted-foreground'}`}>{k}</div>
                <div className={`text-[15px] ${k === 'Agora' ? 'text-foreground' : 'text-muted-foreground'}`}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="modulos" className="px-10 py-24 border-b border-border">
        <div className="max-w-[1080px] mx-auto">
          <p className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">03 — Seis módulos, uma operação</p>
          <h2 className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[22ch] mb-12">
            Tudo o que um escritório executa, em <em className="text-primary">uma única superfície.</em>
          </h2>
          <div className="border border-border rounded-[12px] overflow-hidden grid grid-cols-1 md:grid-cols-3">
            {MODULES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className={[
                  'p-6',
                  i % 3 !== 2 ? 'md:border-r border-border' : '',
                  i < 3 ? 'border-b border-border' : '',
                ].join(' ')}
              >
                <Icon size={20} className="text-primary mb-3.5" />
                <h3 className="text-[16px] font-medium mb-1.5">{title}</h3>
                <p className="text-[13px] text-muted-foreground leading-[1.55]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section id="pilares" className="px-10 py-24 border-b border-border bg-muted">
        <div className="max-w-[1080px] mx-auto">
          <p className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-3">04 — Por que confiar</p>
          <h2 className="font-serif text-[34px] leading-[1.15] tracking-[-0.02em] font-medium max-w-[22ch] mb-12">
            Construído com quem entende — <em className="text-primary">e usa todos os dias.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PILLARS.map(([t, b], i) => (
              <div key={i}>
                <div className="font-serif text-[30px] italic text-primary mb-4">{String(i + 1).padStart(2, '0')}.</div>
                <h3 className="text-[18px] font-medium mb-2">{t}</h3>
                <p className="text-[14px] text-muted-foreground leading-[1.6]">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-10 py-32 border-b border-border text-center">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-serif text-[48px] leading-[1.05] tracking-[-0.025em] font-medium mb-6">
            Quando tudo está sob controle,<br />
            a advocacia fica <em className="text-primary">inevitável.</em>
          </h2>
          <p className="text-[16px] text-muted-foreground mb-8">
            Comece grátis. Sem cartão. Cancele quando quiser.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link href="/cadastro" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-[5px] text-[14px] font-medium hover:bg-primary/90 transition-colors">
              Criar minha conta
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 border border-border bg-card text-foreground px-5 py-2.5 rounded-[5px] text-[14px] font-medium hover:bg-accent transition-colors">
              Explorar a demonstração
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-10 py-12">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-[22px] h-[22px] rounded-[3px] bg-primary text-primary-foreground flex items-center justify-center font-serif italic font-semibold text-[13px]">V</div>
              <span className="font-serif font-medium text-[15px]">Vetor <em className="text-primary not-italic">Jurídico</em></span>
            </div>
            <p className="font-serif italic text-[15px] text-muted-foreground max-w-[32ch]">
              &ldquo;Quando tudo está sob controle, a advocacia fica inevitável.&rdquo;
            </p>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            © 2026 Vetor Jurídico · CNPJ 00.000.000/0001-00 · São Paulo, Brasil
          </p>
        </div>
      </footer>
    </div>
  )
}
