# Leea — Sistema de Gestão para Escritórios de Advocacia

SaaS B2B para escritórios de advocacia brasileiros. Substitui planilhas e WhatsApp por gestão centralizada de casos, clientes, prazos, documentos e financeiro. Está em **beta privado** — acesso fechado com convite, sem cobrança ainda.

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
| Editor rico | TipTap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`) |
| Gráficos | Recharts |

---

## Notas críticas de arquitetura

**Better Auth (não Supabase Auth):** `auth.uid()` retorna NULL. O RLS usa `get_user_escritorio_ids()` que lê o header `x-user-id` injetado pelo client Supabase. Service role key no servidor bypassa o RLS completamente.

**RLS:** usar sempre `in (select get_user_escritorio_ids())` — nunca `= any(...)`. A função é SRF e o PostgreSQL não permite SRFs diretas em policy expressions.

**Better Auth → tipos:** `created_by` nas tabelas é `text` (não `uuid`). Novas tabelas devem usar `text` desde o início.

**Multi-tenancy:** Cada escritório é um tenant isolado via `escritorio_id`. Relação usuário → escritório via `membros (user_id, escritorio_id, role)`.

---

## Hierarquia e permissões

### Níveis

```
SUPERADMIN  (plataforma)
    └── OWNER       (titular do escritório)
            └── ADMIN       (sócio / administrador)
                    └── LAWYER      (advogado)
                            └── ASSISTANT   (assistente)
```

### Superadmin (plataforma)

Campo `is_superadmin: boolean` na tabela `user` do Better Auth.
Rota dedicada `/admin` — protegida por middleware que verifica `is_superadmin`.

| Pode | Não pode |
|------|----------|
| Ver todos os escritórios e métricas | Acessar dados de clientes/casos diretamente |
| Ativar / desativar escritórios | Ser membro de um escritório com role especial |
| Ver contagem de membros, casos, uso de storage por escritório | — |
| Impersonar escritório para suporte (leitura) | — |

**Identificação:** `user.is_superadmin = true` no banco. Primeiro superadmin criado via migration manual. Middleware verifica antes de renderizar `/admin/*`.

### Owner (titular)

Único por escritório. Criado automaticamente ao criar o escritório via `criarEscritorioCompleto`.

| Pode | Não pode |
|------|----------|
| Convidar qualquer role (admin, lawyer, assistant) | Ser removido por qualquer membro |
| Remover qualquer membro (inclusive admins) | Ter seu role alterado por outros |
| Alterar role de qualquer membro | — |
| Ver todo o financeiro, casos, clientes, documentos | — |
| Gerenciar billing (quando disponível) | — |
| Revogar convites de qualquer role | — |
| Excluir escritório | — |

**Transferência de ownership:** pendente (v3). Por enquanto, owner não pode ser removido por ninguém.

### Admin (sócio / administrador)

| Pode | Não pode |
|------|----------|
| Convidar: `lawyer`, `assistant` | Convidar `admin` — apenas owner pode |
| Remover: `lawyer`, `assistant` | Remover `owner` ou outro `admin` |
| Ver todos os casos, clientes, financeiro | Gerenciar billing |
| Revogar convites de `lawyer`/`assistant` | Revogar convites de `admin` |
| Editar dados do escritório | Excluir escritório |

### Lawyer (advogado)

| Pode | Não pode |
|------|----------|
| Criar e gerenciar casos | Convidar ou remover membros |
| Criar e editar clientes | Ver financeiro de outros advogados (configurável) |
| Ver e fazer upload de documentos | Acessar gestão de equipe |
| Criar prazos, tarefas, modelos | Alterar configurações do escritório |
| Ver financeiro dos seus casos | — |

### Assistant (assistente)

| Pode | Não pode |
|------|----------|
| Ver casos e clientes (leitura) | Criar casos ou clientes |
| Criar tarefas e prazos em casos existentes | Ver financeiro (qualquer) |
| Upload e visualização de documentos | Convidar ou remover membros |
| Usar modelos | Alterar dados do escritório |

---

### Estado atual vs. necessário

| Regra | Implementado | Pendente |
|-------|-------------|---------|
| Owner não pode ser removido | ✅ RLS: `role <> 'owner'` no DELETE | — |
| Admin não pode convidar admin | ❌ | Filtrar roles no form de convite por `meuRole` |
| Admin não pode remover admin | ❌ | Checar role do alvo antes de permitir remoção |
| Assistant não vê financeiro | ❌ | RLS na tabela `transacoes` por role |
| Superadmin de plataforma | ❌ | Campo `is_superadmin`, middleware, rota `/admin` |
| Transferência de ownership | ❌ | v3 |

### O que implementar para o beta

**Antes do lançamento (UI, sem migration):**
1. **Filtrar roles no convite por quem convida** — admin só vê `lawyer`/`assistant` no dropdown; `equipe/page.tsx`, ~5 linhas
2. **Bloquear remoção de admin por admin na UI** — ocultar botão de remover quando alvo é `admin` e `meuRole !== 'owner'`; mesmo arquivo
3. **Ocultar financeiro para assistant na UI** — esconder links/abas de Financeiro na sidebar e nos casos quando `meuRole === 'assistant'`; sem migration, só UI

**Pós-beta (requer migration):**
4. **Superadmin básico** — campo `is_superadmin`, middleware, rota `/admin` com lista de escritórios
5. **RLS financeiro por role** — policy em `transacoes` impedindo assistant de ler mesmo via API

### Migration necessária

```sql
-- Adicionar superadmin
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_superadmin" boolean NOT NULL DEFAULT false;

-- Definir o primeiro superadmin (rodar manualmente)
UPDATE "user" SET "is_superadmin" = true WHERE email = 'paulogustavobarros90@gmail.com';
```

```sql
-- RLS: assistant não vê transações financeiras
CREATE POLICY "transacoes_role_assistant" ON transacoes
  FOR SELECT USING (
    escritorio_id IN (SELECT get_user_escritorio_ids())
    AND (
      SELECT role FROM membros
      WHERE user_id = app_user_id()
        AND escritorio_id = transacoes.escritorio_id
    ) <> 'assistant'
  );
```

**Clients Supabase:**
- Browser: `createAuthClient()` — injeta `x-user-id`
- Servidor: `createClient(userId)` ou `createServerAuthClient()`

---

## Módulos

| Módulo | Status |
|--------|--------|
| Auth | ✅ Login, cadastro, recuperação, Google OAuth, convites, roles |
| Dashboard | ✅ KPIs reais + gráfico receita mensal (barras) + casos por área (donut) |
| Casos | ✅ CRUD, responsável, abas: prazos / tarefas / documentos / financeiro |
| Clientes | ✅ CRUD, busca, casos e documentos por cliente |
| Prazos | ✅ Por caso, horário opcional, sync Google Calendar |
| Calendário | ✅ Grade mensal, criar prazo no calendário |
| Documentos | ✅ Upload PDF (10 MB/arquivo, 100 MB/escritório), quota tracker |
| Financeiro | ✅ Lançamentos (honorários, despesas, reembolsos, adiantamentos), filtros, aba por caso |
| Modelos | ✅ Editor TipTap, variáveis `{{nome}}`, prévia ao vivo, duplicar templates globais |
| Busca global | ✅ Ctrl+K: casos, clientes, documentos |
| Tarefas por caso | ✅ Título, responsável, status, prioridade, data limite |
| Equipe | ✅ Listar, convidar, revogar, remover |
| Escritório | ✅ Dados cadastrais, logo |
| Perfil | ✅ Foto, dados profissionais, áreas |
| Configurações | ✅ Senha, Google Calendar |
| Onboarding | ✅ Tour 6 steps via `?welcome=true` |
| Notificações | ⚠️ Geradas dos prazos, mas persistência em localStorage — precisa migrar para banco |
| Toast / feedback | ✅ Sonner — cobre todas as ações em auth, app e upload |
| Calculadora de prazos | ❌ Pendente — ver nota técnica abaixo |
| Planos / billing | ⏸ UI comentada, aguarda CNPJ + Abacate Pay |

---

## Prioridades do beta

### 🔴 Implementar agora

**1. Toast system**
Sem toasts, o usuário não sabe se ações funcionaram. Implementar globalmente com `sonner` ou `@radix-ui/react-toast`. Cobrir: criar/editar caso, enviar convite, upload de documento, salvar configurações, salvar perfil.

**2. Notificações no banco**
Hoje persiste leitura em localStorage — se trocar de dispositivo, perde. Migrar para tabela `notificacoes` no Supabase com `lida` (boolean) por usuário. A geração por prazos já funciona, falta persistência real.

**3. Calculadora de prazos**
Ver nota técnica abaixo. Implementar como modal/drawer em `/prazos` e `/casos/[id]` — o advogado informa data de publicação e a calculadora sugere a data final. Botão "Usar esta data" preenche o campo.

**4. Resend com domínio próprio**
Domínio será comprado em ~2 dias. Ao configurar:
- Adicionar domínio no painel do Resend e verificar DNS
- Trocar remetente de `onboarding@resend.dev` para `nao-responda@[dominio].com.br` (ou similar)
- Atualizar `BETTER_AUTH_URL` e `trustedOrigins` no Better Auth para o domínio de produção
- Remover `localhost:3000` de `trustedOrigins` em produção
- Testar envio de: convite de equipe, recuperação de senha, e-mails do onboarding

**5. Fluxo financeiro — revisão**
Verificar se o fluxo faz sentido do ponto de vista do usuário:
- Lançamento de honorários, despesas, adiantamentos e reembolsos
- Cálculo do saldo do caso (a receber vs. recebido)
- Dashboard KPI "a receber" exclui despesas? (comportamento atual)
- Filtros por período e tipo na listagem global de financeiro

### 🟡 Responsividade
Não há app mobile — testar responsividade no browser (DevTools, viewport mobile).
Pontos fracos conhecidos:
- Tabelas de casos/clientes têm `min-w-[680px]` — scroll horizontal em mobile; considerar card view
- Sidebar em mobile precisa de menu burger funcional
- Modais de upload podem ser apertados em telas pequenas

---

## Calculadora de prazos — nota técnica

| Área | Contagem |
|------|----------|
| Cível (CPC/2015 art. 219) | Dias **úteis** |
| Trabalhista (CLT) | Dias **corridos** |
| Criminal (CPP) | Dias **corridos** |
| Previdenciário judicial | Dias **úteis** |
| Previdenciário / Tributário administrativo | Dias **corridos** |
| Tributário judicial | Dias **úteis** |

**Feriados:**
- Nacionais: BrasilAPI `/feriados/v1/{ano}` (gratuita)
- Estaduais/municipais/tribunal: cadastrados pelo escritório em `Configurações → Feriados`
- Nova tabela necessária: `feriados_escritorio (id, escritorio_id, dia, mes, nome, created_at)`

**Recesso forense:** 20/dez → 20/jan — prazos suspensos (exceto trabalhista, criminal urgente, eleitoral).

**Aviso obrigatório:** *"Considerando feriados nacionais + os feriados cadastrados pelo seu escritório. Confirme com o regimento do tribunal."*

**UX:** calculadora assistida — sugere, o advogado confirma. Exibe quais dias foram pulados e por quê. Integrar ao caso: pré-preenche tribunal, área e tipo de processo; advogado só informa a data de publicação.

---

## Modelos de documentos

- `escritorio_id = null` → template global da Leea, somente leitura, duplicável
- `escritorio_id = <id>` → template privado do escritório, editável
- Variáveis: `{{nome_variavel}}` extraídas via regex do JSON TipTap
- `{{data_hoje}}` pré-preenchida automaticamente
- Fase 2 pendente: auto-preencher variáveis do caso, exportar DOCX

---

## Storage

| Bucket | Uso | Limite |
|--------|-----|--------|
| `imagens` | Avatars e logos | 2 MB, JPG/PNG/WebP |
| `documentos` | PDFs | 10 MB/arquivo, 100 MB/escritório |

Ambos públicos. Segurança via sessão Better Auth nas API routes.

---

## Migrations SQL

Em `supabase/migrations/` — rodadas manualmente no Supabase SQL Editor (sem CLI).
Última migration: `20260529000001_modelos_seed.sql` (5 templates globais da Leea).

---

## Convenções de código

- Server Components para fetch inicial; Client Components para interatividade
- Nomes em português para variáveis de domínio (caso, prazo, escritorio)
- Sem comentários explicando "o quê" — só "por quê" não óbvio
- Sem mock data em produção
- Gráficos do dashboard recebem dados do Server Component como props — sem waterfall

---

## Monetização (pendente CNPJ)

Abacate Pay — documentação em `abacatepay.txt`. Bloqueador: CNPJ necessário para conta merchant. Beta é gratuito até lá. Planos na UI já estão comentados em `/planos/page.tsx`; campo `plano` já existe em `escritorios`.

---

## Roadmap resumido

**v3:** Portal do cliente, calculadora de prazos integrada ao caso, cálculo de juros (SELIC/IPCA via Banco Central), informativos de tribunal por casos ativos, notificações por email.

**v4 (IA):** Gemini 2.0 Flash + Groq Whisper. Abstração em `src/lib/ai/provider.ts`. Features: resumo de PDF, transcrição de áudio, geração de minuta, extração de dados processuais. Nunca acoplar diretamente ao Gemini nas pages — sempre via abstração.

**v5:** Benchmark anônimo entre escritórios, API pública, self-hosted, backup agendado.

---

## Negócio

- **Produto:** SaaS para escritórios de advocacia brasileiros (1–50 advogados)
- **Estágio:** Beta privado, um escritório em teste
- **Precificação prevista:** R$ 89/mês (Starter, até 2 advogados) / R$ 189/mês (Pro, até 8)
- **Concorrentes:** Advbox, Astrea, Jurídico Certo, PJe Office
- **Diferencial atual:** Design moderno, UX simples, multi-tenant real
- **Diferencial a construir:** Integração com tribunal + IA em documentos
- Documentos estratégicos em `produto/`

---

## Comandos

```bash
npm run dev
npm run build
npx tsc --noEmit
```

## Variáveis de ambiente

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
