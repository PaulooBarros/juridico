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
| Editor de texto rico | TipTap (open source, MIT, sem API key, sem custo) |

**Importante sobre autenticação:** O projeto usa **Better Auth**, não o Supabase Auth nativo. Isso afeta como o RLS funciona — `auth.uid()` retorna NULL. O RLS usa uma função customizada `get_user_escritorio_ids()` que lê o header `x-user-id` injetado pelo client Supabase. O service role key no servidor bypassa o RLS completamente.

---

## Estrutura de pastas relevante

```
src/
├── app/
│   ├── (app)/              # Área autenticada
│   │   ├── dashboard/
│   │   ├── casos/
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
│   │   └── modelos/        # ainda usa mock
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
│   │   └── documentos.ts
│   ├── auth.ts             # Better Auth config (server)
│   ├── auth-client.ts      # Better Auth config (client)
│   └── utils/index.ts      # formatters, helpers
├── components/
│   └── layout/
│       ├── sidebar.tsx     # re-busca sessão ao navegar (pathname dep)
│       └── topbar.tsx      # re-busca sessão ao navegar (pathname dep)
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
| **Dashboard** | Métricas reais: casos ativos, clientes, prazos próximos, receita pendente |
| **Casos** | CRUD completo, abas de detalhes, prazos e documentos por caso |
| **Clientes** | CRUD completo, busca, casos e documentos por cliente |
| **Prazos** | Por caso, com horário opcional, sync Google Calendar, status |
| **Calendário** | Grade mensal, criar prazo direto no calendário (clique ou duplo clique) |
| **Documentos** | Upload PDF (10 MB/arquivo, 100 MB/escritório), visualização inline, quota tracker |
| **Financeiro** | Lançamentos (honorários, despesas, reembolsos), filtros, CRUD |
| **Equipe** | Listar membros, convidar por email, revogar convite, remover membro |
| **Escritório** | Editar dados cadastrais, upload de logo |
| **Perfil** | Dados profissionais, foto de perfil, áreas de especialidade |
| **Notificações** | Geradas automaticamente dos prazos (vencido/3 dias/7 dias), leitura persistida em localStorage |
| **Configurações** | Alteração de senha, integração Google Calendar, preferências |
| **Planos** | Página de beta privado (planos pagos comentados no código) |

### 🟡 Parcialmente implementado

| Módulo | Status |
|--------|--------|
| **Modelos** | UI existe mas usa dados mock — sem CRUD real ainda |

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
- Sem mock data nas páginas de produção (apenas `modelos/` ainda usa)

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

---

## Roadmap — próximas versões

### v2 do beta (prioridade alta)

- **Onboarding do segundo usuário** — quando um membro aceita convite, recebe um fluxo de boas-vindas guiado (tour do produto) em vez de cair numa tela vazia; o produto hoje convence quem pesquisou, não quem foi convidado — isso é causa direta de adoção parcial da equipe
- **Responsável pelo caso** — campo `responsavel_id` na tabela `casos` apontando para um membro do escritório; visível na listagem e no detalhe do caso
- **Tarefas por caso** (estilo Planner) — aba "Tarefas" no detalhe do caso; cada tarefa tem título, descrição, responsável (membro do escritório), status (pendente/em andamento/concluída), prioridade (alta/média/baixa) e data limite opcional; diferente de prazo — prazo é obrigação processual fatal, tarefa é atividade interna reatribuível; requer nova tabela `tarefas (id, caso_id, escritorio_id, titulo, descricao, responsavel_id, status, prioridade, data_limite, created_by, created_at)`
- **Busca global** (`Ctrl+K`) — encontrar caso, cliente, documento de qualquer tela
- **Modelos de documentos** — ver seção detalhada abaixo (planejado, branch `feat/modelos-documentos`)
- **Integração com tribunal** — consulta de movimentações via DataJud (CNJ) ou parceiro (JusBrasil/Escavador)
- **Casos → aba Financeiro** — lançamentos vinculados diretamente ao caso
- **Dashboard com gráficos** — receita mensal, casos por área, prazos cumpridos
- **Autocomplete de cliente** — preencher CNPJ/CPF via BrasilAPI + validação de formato; ao digitar CNPJ, preenche razão social, endereço e sócios automaticamente; CPF apenas valida formato (Receita Federal não expõe dados pessoais via API pública)
- **CEP automático** — endereço preenchido ao digitar o CEP via BrasilAPI (sem autenticação)
- **Campo "tipo de processo"** — físico ou eletrônico no cadastro do caso; usado pela calculadora de prazos para aplicar regra correta

### Modelos de documentos — planejamento detalhado

**Branch:** `feat/modelos-documentos`

**Motivação:** gap crítico identificado no documento `produto/churn-email-honesto.md` — cliente cancelou porque "continuei abrindo o Word pra tudo". Modelos de verdade, editáveis e reutilizáveis, são o que transforma o pitch de "tudo num lugar só" em realidade.

**Editor:** TipTap (open source, MIT, sem API key, sem custo). Pacotes: `@tiptap/react @tiptap/pm @tiptap/starter-kit`. Documentação: tiptap.dev.

**Modelo de ownership (duplo):**
- `escritorio_id = null` → template global da Leea, visível a todos os escritórios, somente leitura
- `escritorio_id = <id>` → template do próprio escritório, privado, editável
- Escritório pode duplicar um template da Leea para customizar

**Schema da tabela:**
```sql
create table modelos (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  escritorio_id uuid references escritorios(id) on delete cascade, -- null = global Leea
  created_by    uuid references auth.users(id),
  nome          text not null,
  descricao     text,
  categoria     text not null check (categoria in ('peticoes','contratos','procuracoes','correspondencias','outros')),
  area          text,
  conteudo      jsonb not null default '{}', -- formato TipTap JSON
  tags          text[],
  uso_count     int default 0
);
```

**Sistema de variáveis:** sintaxe `{{nome_variavel}}`. Implementar como nó customizado do TipTap (highlight visual + não editável internamente). Variáveis padrão sugeridas: `{{cliente_nome}}`, `{{cliente_cpf_cnpj}}`, `{{caso_numero}}`, `{{caso_vara}}`, `{{caso_juiz}}`, `{{data_hoje}}`, `{{advogado_nome}}`, `{{advogado_oab}}`.

**Fluxo "Usar modelo":**
1. Usuário clica "Usar modelo"
2. Sistema extrai todas as `{{variáveis}}` do conteúdo
3. Abre form com um campo por variável (futuro: auto-preencher do caso quando aberto dentro de um caso)
4. Usuário preenche → texto final gerado → botão "Copiar"
5. Incrementa `uso_count`

**Fases de implementação:**
- **Fase 1 (agora):** Migration + CRUD + editor TipTap + variáveis + "Usar modelo" → copiar
- **Fase 2 (depois):** Auto-preencher variáveis do caso, exportar como DOCX

**Supabase free tier:** sem impacto relevante. Templates são JSON no banco (~20-80 KB cada). Não usa Storage nem bandwidth adicional.

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

### v3 / diferencial competitivo

- **Portal do cliente** — área separada onde o cliente final faz login e acompanha seus casos e documentos
- **IA nos documentos** — resumo automático de PDFs, sugestão de minutas, extração de dados processuais
- **Calculadora de prazos assistida** — ver nota técnica abaixo
- **Notificações por email** — prazos críticos enviados por email (via Resend, já integrado)
- **Relatórios exportáveis** — PDF/CSV de financeiro, casos, clientes
- **Exportação de dados do escritório** — CSV/JSON completo de casos, clientes, prazos e financeiro; paradoxalmente gera confiança e reduz medo de lock-in — cliente que sabe que pode sair tem menos medo de entrar
- **Log de auditoria** — registrar quem criou, editou ou excluiu o quê e quando; essencial para compliance em escritórios com múltiplos advogados; tabela `audit_log (id, escritorio_id, user_id, acao, tabela, registro_id, dados_anteriores, created_at)`
- **2FA** — autenticação em dois fatores; escritórios com dados sensíveis vão exigir isso antes de pagar planos maiores
- **Plano Essencial** — tier mais barato com features limitadas (casos + prazos + clientes); para escritórios em crise ou advogados solo; evita perder o cliente para a concorrência em vez de fazer downgrade

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
