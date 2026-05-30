# Leea — Sistema de Gestão para Escritórios de Advocacia

## O que é

Leea é um SaaS B2B para escritórios de advocacia brasileiros. Substitui planilhas, WhatsApp e pastas no computador por um sistema centralizado de gestão de casos, clientes, prazos, documentos e financeiro.

Está em **beta privado** — acesso fechado com convite, sem cobrança ainda.

---

## Stack técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS + Radix UI + shadcn/ui |
| Animações | Framer Motion |
| Auth | Better Auth (não Supabase Auth) |
| Banco | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Email | Resend |
| Google Calendar | googleapis |
| Deploy | Vercel |
| Icons | Lucide React |
| Editor de texto rico | TipTap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`) |
| Gráficos | Recharts (mesma base do shadcn/ui charts) |

**Importante sobre autenticação:** O projeto usa **Better Auth**, não o Supabase Auth nativo. Isso afeta como o RLS funciona — `auth.uid()` retorna NULL. O RLS usa uma função customizada `get_user_escritorio_ids()` que lê o header `x-user-id` injetado pelo client Supabase. O service role key no servidor bypassa o RLS completamente.

---

## Estrutura de pastas relevante

```
src/
├── app/
│   ├── (app)/              # Área autenticada
│   │   ├── dashboard/
│   │   ├── casos/
│   │   │   └── [id]/       # Detalhe: prazos-tab, tarefas-tab, documentos-tab, financeiro-tab
│   │   ├── clientes/
│   │   ├── calendario/
│   │   ├── documentos/
│   │   ├── financeiro/
│   │   ├── equipe/
│   │   ├── notificacoes/
│   │   ├── perfil/
│   │   ├── escritorio/
│   │   ├── configuracoes/
│   │   ├── planos/
│   │   └── modelos/
│   │       ├── page.tsx        # Lista de modelos (grid)
│   │       ├── novo/           # Criar novo modelo (editor TipTap)
│   │       └── [id]/
│   │           ├── page.tsx    # Editar modelo (editor TipTap + metadados)
│   │           └── usar/       # Preencher variáveis + prévia ao vivo + copiar
│   ├── (auth)/             # Login, cadastro, convite
│   ├── (marketing)/        # Landing page
│   └── api/                # API Routes
│       ├── auth/           # Better Auth handler
│       ├── upload/         # avatar, logo, documento
│       ├── documentos/     # quota, options, delete
│       ├── google/         # calendar sync
│       └── waitlist/       # lista de espera beta
├── lib/
│   ├── supabase/           # clients + query functions por módulo
│   │   ├── client.ts       # browser client (createClient, createAuthClient)
│   │   ├── server.ts       # server client (createClient, createServerAuthClient)
│   │   ├── casos.ts
│   │   ├── clientes.ts
│   │   ├── prazos.ts
│   │   ├── financeiro.ts
│   │   ├── equipe.ts
│   │   ├── escritorio.ts
│   │   ├── documentos.ts
│   │   ├── modelos.ts      # CRUD + docToPlainText + extrairVariaveis
│   │   ├── tarefas.ts
│   │   └── busca.ts        # busca global (casos, clientes, documentos)
│   ├── auth.ts             # Better Auth config (server)
│   ├── auth-client.ts      # Better Auth config (client)
│   └── utils/index.ts      # formatters, helpers
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx     # re-busca sessão ao navegar (pathname dep)
│   │   └── topbar.tsx      # re-busca sessão ao navegar (pathname dep)
│   ├── editor/
│   │   └── modelo-editor.tsx   # TipTap com toolbar (bold, italic, h2, listas)
│   ├── dashboard/
│   │   ├── revenue-chart.tsx   # Recharts: barras de receita mensal
│   │   └── cases-area-chart.tsx # Recharts: donut de casos por área
│   ├── onboarding/
│   │   ├── onboarding-handler.tsx  # Detecta ?welcome=true, controla exibição
│   │   └── welcome-tour.tsx        # Tour de 6 steps para novo membro
│   └── search/
│       └── global-search.tsx   # Ctrl+K: busca global em casos/clientes/documentos
└── features/
    └── shared/             # EmptyState, StatusBadge, StatsCard
produto/                    # Documentos estratégicos (não é código)
supabase/
└── migrations/             # SQL migrations em ordem cronológica
```

---

## Módulos implementados

### ✅ Funcional com dados reais

| Módulo | Descrição |
|--------|-----------|
| **Auth** | Login, cadastro, recuperação de senha, convites por email, roles (owner/admin/lawyer/assistant) |
| **Dashboard** | KPIs reais + gráfico de receita mensal (Recharts, barras) + gráfico de casos por área (donut). Despesas excluídas do "a receber" |
| **Casos** | CRUD completo, responsável por caso, abas: prazos, tarefas, documentos, financeiro do caso |
| **Clientes** | CRUD completo, busca, casos e documentos por cliente |
| **Prazos** | Por caso, com horário opcional, sync Google Calendar, status |
| **Calendário** | Grade mensal, criar prazo direto no calendário (clique ou duplo clique) |
| **Documentos** | Upload PDF (10 MB/arquivo, 100 MB/escritório), visualização inline, quota tracker |
| **Financeiro** | Lançamentos (honorários, despesas, reembolsos, adiantamentos), filtros, CRUD. Aba financeira por caso |
| **Modelos** | CRUD completo com editor TipTap. Templates globais da Leea (somente leitura, duplicáveis). Variáveis `{{nome}}` com prévia ao vivo e cópia. Rotas: `/modelos`, `/modelos/novo`, `/modelos/[id]`, `/modelos/[id]/usar` |
| **Busca global** | Ctrl+K em qualquer tela: busca casos, clientes e documentos em tempo real |
| **Tarefas por caso** | Aba "Tarefas" no detalhe do caso: título, responsável, status, prioridade, data limite |
| **Equipe** | Listar membros, convidar por email, revogar convite, remover membro |
| **Escritório** | Editar dados cadastrais, upload de logo |
| **Perfil** | Dados profissionais, foto de perfil, áreas de especialidade |
| **Notificações** | Geradas automaticamente dos prazos (vencido/3 dias/7 dias), leitura persistida em localStorage |
| **Onboarding** | Tour de boas-vindas de 6 steps para novos membros (ativado via `?welcome=true`) |
| **Configurações** | Alteração de senha, integração Google Calendar, preferências |
| **Planos** | Página de beta privado (planos pagos comentados no código) |

### ❌ Não implementado (roadmap)

Ver seção de roadmap abaixo.

---

## Storage

Dois buckets no Supabase Storage:

| Bucket | Uso | Limite | Tipos |
|--------|-----|--------|-------|
| `imagens` | Avatars de usuários e logos de escritórios | 2 MB/arquivo | JPG, PNG, WebP |
| `documentos` | PDFs dos casos/clientes | 10 MB/arquivo, 100 MB/escritório | PDF |

Ambos são públicos (URLs diretas funcionam). Segurança enforçada nas API routes via sessão Better Auth.

---

## Multi-tenancy

Cada escritório (`escritorios`) é um tenant isolado. Toda query usa `escritorio_id` no RLS.

Relação usuário → escritório via tabela `membros (user_id, escritorio_id, role)`.

Função RLS: `get_user_escritorio_ids()` — lê o `x-user-id` do header da requisição e retorna os IDs de escritório onde o usuário é membro.

---

## Convenções de código

- **Server Components** para páginas que fazem fetch inicial (casos, clientes, dashboard)
- **Client Components** para interatividade (modais, formulários, tabs)
- Queries no browser usam `createAuthClient()` (injeta `x-user-id`)
- Queries no servidor usam `createClient(userId)` ou `createServerAuthClient()`
- Nomes em português para variáveis de domínio (caso, prazo, escritorio)
- Sem comentários explicando "o quê" — só comentários para "por quê" não óbvio
- Sem mock data nas páginas de produção
- Gráficos do dashboard são Client Components que recebem dados processados do Server Component como props — sem waterfall

---

## Migrations SQL

Localizadas em `supabase/migrations/` em ordem cronológica.
Devem ser rodadas manualmente no Supabase SQL Editor (projeto não usa Supabase CLI).

| Arquivo | Conteúdo |
|---------|----------|
| `20260525181559_schema_inicial.sql` | Tabelas base: escritorios, membros, clientes |
| `20260525182538_fix_membros_rls_recursion.sql` | Fix de recursão infinita no RLS de membros |
| `20260525182854_rpc_criar_escritorio.sql` | RPC para criação atômica de escritório + membro owner |
| `20260525183736_clientes.sql` | Tabela clientes + RLS |
| `20260525190000_casos.sql` | Tabela casos + RLS |
| `20260525195000_equipe_rpc.sql` | RPCs de equipe (convite, aceite) |
| `20260525210000_prazos_google.sql` | Tabela prazos + google_tokens |
| `20260526000000_transacoes.sql` | Tabela transações financeiras |
| `20260526100000_better_auth.sql` | Tabelas do Better Auth (user, session, account, verification) |
| `20260526200000_rls_better_auth.sql` | RLS nas tabelas Better Auth |
| `20260527000000_waitlist.sql` | Tabela waitlist (lista de espera beta) |
| `20260527010000_storage_imagens.sql` | Bucket imagens + policies |
| `20260527020000_documentos.sql` | Tabela documentos + bucket documentos |
| `20260527030000_prazos_hora.sql` | Coluna `hora` (opcional) em prazos |
| `20260529000000_modelos.sql` | Tabela modelos + RLS + trigger updated_at + RPC incrementar_uso_modelo |
| `20260529000001_modelos_seed.sql` | 5 templates globais da Leea (escritorio_id = null) |

**Atenção RLS:** usar sempre `in (select get_user_escritorio_ids())` — nunca `= any(get_user_escritorio_ids())`. A função é SRF e o PostgreSQL não permite SRFs diretas em policy expressions.

**Atenção Better Auth:** `created_by` nas tabelas é `text` (não `uuid`). A migration `20260526100000_better_auth.sql` converteu todas as tabelas — novas tabelas devem já usar `text` desde o início.

---

## Roadmap — próximas versões

### v2 do beta — ✅ concluído

Todos os itens da v2 foram implementados, exceto integração com tribunal:

| Item | Status |
|------|--------|
| Onboarding do segundo usuário | ✅ Tour de 6 steps via `?welcome=true` |
| Responsável pelo caso | ✅ Campo `responsavel_id` em casos |
| Tarefas por caso | ✅ Aba Tarefas no detalhe do caso |
| Busca global Ctrl+K | ✅ Casos, clientes, documentos |
| Modelos de documentos | ✅ Editor TipTap, variáveis, prévia ao vivo |
| Casos → aba Financeiro | ✅ Lançamentos por caso |
| Dashboard com gráficos | ✅ Receita mensal + casos por área (Recharts) |
| Autocomplete CNPJ/CPF | ✅ BrasilAPI |
| CEP automático | ✅ BrasilAPI |
| Tipo de processo | ✅ Físico/eletrônico no caso |
| **Integração com tribunal** | ✅ DataJud (CNJ) — aba Movimentações + auto-fill nos formulários |
| **Perfil do usuário** | ❌ Melhorias: preferências, leitura de notificações no banco (hoje localStorage) |
| **Notificações por email** | ❌ Prazos críticos enviados por email via Resend (já integrado) |
| **Calculadora de prazos** | ❌ Ver nota técnica abaixo |

### Modelos de documentos — arquitetura implementada

**Ownership:**
- `escritorio_id = null` → template global da Leea, somente leitura, duplicável
- `escritorio_id = <id>` → template privado do escritório, editável

**Rotas:**
- `/modelos` — lista em grid, filtros por categoria
- `/modelos/novo` — criar template (editor TipTap + metadados na sidebar)
- `/modelos/[id]` — editar template (mesmo layout, sidebar mostra variáveis detectadas)
- `/modelos/[id]/usar` — preencher variáveis, prévia ao vivo com destaques, copiar texto

**Variáveis:** sintaxe `{{nome_variavel}}`. Extraídas via regex do JSON do TipTap. `{{data_hoje}}` pré-preenchida automaticamente. Na prévia, variáveis pendentes aparecem em âmbar, preenchidas em cor primária.

**Fase 2 (pendente):** auto-preencher variáveis do caso quando aberto dentro de `/casos/[id]`, exportar como DOCX.

### v3 / diferencial competitivo

- **Portal do cliente** — área separada onde o cliente final faz login e acompanha seus casos e documentos
- **Calculadora de prazos integrada ao caso** — ver nota técnica abaixo; diferencial vs. Prazo Fácil: abre pré-preenchida com tribunal, área e tipo de processo do caso — o advogado só informa a data de publicação; exibe quais dias foram pulados e por quê
- **Cálculo de juros no financeiro** — simular valor atualizado de causa ou honorários em atraso; índices via API do Banco Central (gratuita): SELIC, TR, IPCA, INPC; integrado ao módulo financeiro e ao valor da causa no caso
- **Informativos de tribunal por casos ativos** — feed de avisos e suspensões filtrado pelos tribunais dos casos ativos do escritório (não o tribunal inteiro); fonte: RSS ou página de avisos de cada TJ/TRT; evita que o advogado monitore manualmente
- **Notificações por email** — prazos críticos enviados por email (via Resend, já integrado)
- **Relatórios exportáveis** — PDF/CSV de financeiro, casos, clientes

### v4 / IA — quando implementar

**Decisão técnica:** usar **Gemini 2.0 Flash** (Google) + **Groq Whisper** para transcrição. Ambos gratuitos no free tier — viável para beta sem custo. Estrutura deve abstrair o provedor para trocar facilmente no futuro (OpenAI, Claude API, etc.).

**Arquitetura planejada:**
- `src/lib/ai/provider.ts` — abstração única com funções: `resumirDocumento`, `transcreverAudio`, `gerarMinuta`, `extrairDadosProcessuais`
- Features de IA desabilitadas por padrão, ativadas por escritório via flag `ai_habilitado` no banco
- Nunca acoplar diretamente ao Gemini nas pages/components — sempre passar pela abstração

**Features planejadas:**

- **Resumo automático de PDF** — manda o PDF direto para o Gemini (suporta multimodal); resultado vira nota interna no caso; ativado no detalhe do documento com botão "Resumir com IA"
- **Transcrição de áudio vinculada ao caso** — advogado sobe áudio da audiência/reunião no caso; transcrição via Groq Whisper (gratuito, rápido); resultado vira nota interna pesquisável; resolve o problema do áudio que nunca vira texto
- **Geração de minuta** — a partir dos dados do caso (partes, área, pedidos), Gemini gera rascunho de petição/contrato como ponto de partida; salvo como documento rascunho no caso
- **Extração de dados processuais** — manda PDF de intimação/decisão, extrai número do processo, partes, prazo e próxima data automaticamente; preenche campos do caso

**Provedores:**
| Uso | Provedor | Custo |
|-----|---------|-------|
| Texto / análise / geração | Gemini 2.0 Flash | Grátis (1.500 req/dia) |
| Transcrição de áudio | Groq Whisper | Grátis (tier generoso) |
| Fallback pago futuro | Claude API / OpenAI | Pago, quando escalar |

#### Nota técnica: Calculadora de prazos

Cada área do direito tem regra própria de contagem — não pode ser caixa preta.

| Área | Base | Contagem |
|------|------|----------|
| Cível | CPC/2015 art. 219 | Dias **úteis** |
| Trabalhista | CLT | Dias **corridos** |
| Criminal | CPP | Dias **corridos** |
| Previdenciário judicial | CPC | Dias **úteis** |
| Previdenciário administrativo | Lei 9.784/99 | Dias **corridos** |
| Tributário judicial | CPC | Dias **úteis** |
| Tributário administrativo | Decreto 70.235/72 | Dias **corridos** |
| Eleitoral | CE | Dias **corridos** (às vezes horas) |

**Fontes de feriados — decisão de arquitetura:**

| Tipo | Fonte | Motivo |
|------|-------|--------|
| Nacionais | BrasilAPI `/feriados/v1/{ano}` | API oficial, gratuita, confiável |
| Estaduais | Cadastrados pelo escritório | Hardcoded é arriscado — leis municipais/estaduais mudam |
| Municipais | Cadastrados pelo escritório | 5.570 municípios, datas móveis, portarias locais |
| Específicos do tribunal | Cadastrados pelo escritório | Portarias internas, impossível de manter externamente |

**Feriados do escritório** — gerenciados em `Configurações → Feriados`:
- Escritório cadastra uma vez: data + nome
- São considerados em **todos** os cálculos automaticamente
- Nova tabela: `feriados_escritorio (id, escritorio_id, dia, mes, nome, created_at)`
- O sistema nunca assume feriados que não controla — evita prazo errado silencioso

**Aviso obrigatório na calculadora:**
> *"Considerando feriados nacionais + os feriados cadastrados pelo seu escritório. Confirme com o regimento do tribunal."*

**Outras complexidades:**
- Recesso forense: 20/dez → 20/jan — prazos **suspensos** (não aplica a trabalhista, criminal urgente e eleitoral)
- Prazos eleitorais contados em horas — fora do escopo v2
- **Nunca automatizar** prazos fatais (prescrição, decadência) sem confirmação explícita

**Abordagem de implementação:**
- Calculadora **assistida** — sugere, o advogado confirma
- Pré-seleciona dias úteis/corridos com base na área do caso
- Exibe raciocínio: quais dias foram pulados e por quê
- Botão "Usar esta data" preenche o campo de data do prazo

### Monetização — quando tiver CNPJ + investimento

**Bloqueador:** Abacate Pay exige CNPJ para criar conta de merchant. CNPJ vem com o primeiro investimento. Até lá, beta é gratuito.

**Referência técnica:** `abacatepay.txt` na raiz do projeto — documentação formatada para LLM, basta passar o arquivo no contexto na hora de implementar.

**O que o Abacate Pay oferece que usaremos:**
- **Assinaturas recorrentes** (`/subscriptions`) — cobrança mensal/anual automática via cartão
- **Checkout hospedado** (`/checkouts`) — página de pagamento pronta, sem implementar formulário de cartão
- **Webhooks com HMAC** — eventos assinados: `subscription.completed`, `subscription.cancelled`, `subscription.renewed`, `subscription.trial_started`
- **Cupons** (`/coupons`) — descontos para beta testers e early adopters
- **TrustMRR** — API pública para exibir MRR na landing page (prova social de crescimento)

**Produtos a criar no Abacate Pay:**

| Produto | Preço | Cycle |
|---------|-------|-------|
| Leea Starter Mensal | R$ 8.900 (centavos) | MONTHLY |
| Leea Pro Mensal | R$ 18.900 (centavos) | MONTHLY |
| Leea Starter Anual | R$ 89.000 (centavos) | ANNUALLY |
| Leea Pro Anual | R$ 178.000 (centavos) | ANNUALLY |

**API routes a criar na Leea:**
- `POST /api/billing/checkout` — cria checkout de assinatura e retorna URL de redirecionamento
- `POST /api/billing/webhook` — recebe eventos do Abacate Pay; verifica HMAC; atualiza `escritorios.plano`
- `GET /api/billing/status` — retorna status da assinatura do escritório atual

**Fluxo completo:**
1. Escritório cria conta → 14 dias de trial (campo `trial_ends_at` na tabela `escritorios`)
2. Trial expira → redireciona para `/planos` com banner
3. Usuário escolhe plano → `POST /api/billing/checkout` → redireciona para Abacate Pay
4. Pagamento confirmado → webhook `subscription.completed` → `escritorios.plano = 'starter'` ou `'pro'`
5. Cancelamento → webhook `subscription.cancelled` → `escritorios.plano = 'starter'` (downgrade, não bloqueia)
6. Renovação → webhook `subscription.renewed` → mantém plano ativo

**Código já existente:**
- Planos Starter/Pro/Enterprise estão em `src/app/(app)/planos/page.tsx` — comentados, prontos para descomentar
- Campo `plano` já existe na tabela `escritorios`

### v5 / futuro distante

Itens identificados nos documentos estratégicos (`produto/`) que têm valor real mas exigem escala ou maturidade de produto que ainda não temos.

- **Benchmark anônimo** — comparar métricas do escritório (casos ganhos/perdidos, tempo médio de resolução, receita por área) com média agregada anônima de outros escritórios na plataforma; cria lock-in por dados que não existem fora da Leea
- **Análise de padrões dos casos** — taxa de sucesso por área/juiz/vara, tempo médio de resolução, sazonalidade de prazos; dashboards que o advogado não consegue ter com planilha
- **API pública** — para escritórios maiores integrarem a Leea com sistemas próprios (ERP, CRM, contabilidade); abre canal enterprise
- **Self-hosted / on-premise** — para escritórios grandes com compliance rigoroso (dados não podem sair da infraestrutura do cliente); exige Supabase self-hosted + Docker
- **Backup automático agendado** — exportação periódica automática (semanal/mensal) dos dados do escritório para email ou storage externo; mitiga o risco de dependência de infra
- **Comunidade e educação** — conteúdo jurídico, webinars, grupo de usuários; o que o Clio fez com a Clio Cloud Conference para criar lock-in não-técnico e canal de aquisição orgânico
- **Contrato anual com desconto** — opção de pagamento anual (~2 meses grátis); melhora previsibilidade de caixa e reduz churn; implementar quando tiver 20+ clientes pagantes

### Integrações futuras

| Integração | Valor | Complexidade | API |
|------------|-------|-------------|-----|
| DataJud (CNJ) | Monitorar movimentações processuais | Média | `api-publica.datajud.cnj.jus.br` — chave pública disponível |
| BrasilAPI feriados | Calculadora de prazos | Baixa | `brasilapi.com.br/api/feriados/v1/{ano}` — sem auth |
| BrasilAPI CNPJ | Autocomplete de cliente PJ | Baixa | `brasilapi.com.br/api/cnpj/v1/{cnpj}` — sem auth |
| BrasilAPI CEP | Endereço automático | Baixa | `brasilapi.com.br/api/cep/v2/{cep}` — sem auth |
| JusBrasil API | Scraping de tribunal estadual | Alta | Pago |
| WhatsApp Business | Lembrete de prazo e documentos para cliente | Alta | Meta API |
| Stripe | Cobrança dos planos pagos | Média | stripe.com |
| Escavador | Monitoramento processual alternativo | Média | Freemium |

---

## Contexto de negócio

- **Produto:** SaaS para escritórios de advocacia brasileiros (1-50 advogados)
- **Estágio:** Beta privado, um escritório em teste
- **Modelo:** Assinatura mensal por escritório (planos Starter/Pro/Enterprise — comentados enquanto em beta)
- **Precificação prevista:** R$ 89 (Starter, até 2 advogados) / R$ 189 (Pro, até 8) / Enterprise sob consulta
- **Concorrentes:** Advbox, Astrea, Jurídico Certo, PJe Office
- **Diferencial atual:** Design moderno, UX simples, multi-tenant com isolamento real
- **Diferencial defensável a construir:** Integração com tribunal + IA aplicada a documentos jurídicos

### Documentos estratégicos

Ver pasta `produto/` para análises de negócio:
- `churn-email-honesto.md` — perspectiva de cliente que cancelou
- `vc-due-diligence.md` — análise de VC cético: buracos no modelo
- `pontos-unicos-de-falha.md` — auditoria de vulnerabilidades críticas
- `cenarios-mudanca-mercado.md` — 3 mudanças de mercado que podem danificar o modelo

---

## Comandos úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit
```

---

## Variáveis de ambiente necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
RESEND_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```
