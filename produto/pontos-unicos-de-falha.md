# Scanner de Ponto Único de Falha

> O que derruba um negócio raramente é o que o dono estava monitorando.
> Auditoria de vulnerabilidades: pessoas, ferramentas, receita e fornecedores.

---

## Metodologia de avaliação

Cada vulnerabilidade avaliada em dois eixos:
- **Probabilidade:** Baixa / Média / Alta
- **Impacto:** Leve / Grave / Fatal

---

## 1. Pessoas

### Vulnerabilidade: Fundador único de produto e tecnologia

**Descrição:** Todo o conhecimento técnico do produto (arquitetura, decisões de infraestrutura, integrações) está em uma pessoa. Se essa pessoa sair, adoecer ou simplesmente parar, o produto para.

| Dimensão | Avaliação |
|----------|-----------|
| Probabilidade | Média |
| Impacto | Fatal |

**Sinais de alerta:**
- Não existe documentação técnica além do código
- Nenhum outro dev consegue fazer deploy sozinho
- As credenciais de infra estão num único lugar

**Mitigação:**
- Documentar decisões de arquitetura em `CLAUDE.md` e `ADRs`
- Ter pelo menos um segundo acesso às contas de infra (Supabase, Vercel)
- Gravar sessões de onboarding técnico mesmo que não haja um segundo dev agora

---

### Vulnerabilidade: Dependência do primeiro escritório beta

**Descrição:** Se o único escritório beta sair ou der feedback negativo publicamente (no grupo da OAB, por exemplo), a prova social desaparece e o pipeline de beta 2 e 3 esfria.

| Dimensão | Avaliação |
|----------|-----------|
| Probabilidade | Média |
| Impacto | Grave |

**Sinais de alerta:**
- Adoção abaixo de 70% da equipe do escritório
- Um sócio dominante que não comprou a ideia
- Solicitações de features que você não consegue entregar no prazo prometido

**Mitigação:**
- Ter 2-3 escritórios em beta antes de sair do stealth
- Nunca prometer features com data — prometer direção

---

## 2. Ferramentas

### Vulnerabilidade: Supabase — pricing e disponibilidade

**Descrição:** Banco de dados, autenticação e storage rodam no Supabase. Uma mudança de preço, incidente grave ou encerramento do serviço derruba tudo.

| Dimensão | Avaliação |
|----------|-----------|
| Probabilidade | Média (mudança de preço é quase certa com escala) |
| Impacto | Fatal sem plano B / Grave com plano B |

**Histórico relevante:** Heroku encerrou o free tier em 2022 sem aviso longo. Parse (BaaS do Facebook) foi descontinuado em 2017. PlanetScale mudou radicalmente o modelo de preços em 2024.

**Sinais de alerta:**
- Supabase anuncia mudança de pricing structure
- Custo mensal cresce mais rápido que a receita
- Incidentes de disponibilidade recorrentes (monitorar status.supabase.com)

**Mitigação:**
- Manter abstração no código (não chamar Supabase diretamente em toda parte — já parcialmente feito com os clients centralizados)
- Ter backup automático dos dados em S3 ou equivalente
- Avaliar self-hosted Supabase quando atingir 50+ clientes pagantes

---

### Vulnerabilidade: Vercel — cold starts e pricing em escala

**Descrição:** Next.js no Vercel funciona perfeitamente até ~100k requests/mês no free tier. Depois, o preço sobe de forma não-linear e as serverless functions têm limitações de timeout que impactam uploads grandes.

| Dimensão | Avaliação |
|----------|-----------|
| Probabilidade | Alta (vai acontecer se o produto crescer) |
| Impacto | Leve a Grave dependendo do momento |

**Sinais de alerta:**
- Uploads de PDF acima de 4.5MB começando a dar timeout
- Fatura Vercel ultrapassando R$500/mês antes de ter receita equivalente

**Mitigação:**
- Mover uploads para server actions com timeout maior ou API dedicada em Railway/Fly.io
- Avaliar migração pra Railway ou self-hosted quando a fatura superar 15% da receita de infra

---

### Vulnerabilidade: Better Auth — projeto open source pequeno

**Descrição:** Autenticação crítica depende de um projeto open source com equipe pequena. Abandono, mudança de licença ou vulnerabilidade de segurança crítica são riscos reais.

| Dimensão | Avaliação |
|----------|-----------|
| Probabilidade | Baixa no curto prazo |
| Impacto | Fatal — autenticação é o coração do produto |

**Sinais de alerta:**
- Último commit no repositório há mais de 3 meses
- Issue crítica de segurança aberta sem resposta
- Founder do projeto anuncia mudança de foco

**Mitigação:**
- Monitorar o repositório com watch no GitHub
- Ter avaliado Auth.js e Clerk como alternativas — saber o esforço de migração (estimativa: ~2 semanas)

---

## 3. Receita

### Vulnerabilidade: Zero diversificação de clientes

**Descrição:** Um escritório representa 100% da receita (e do feedback). Um único cancelamento é -100% de receita e pode distorcer completamente as decisões de produto.

| Dimensão | Avaliação |
|----------|-----------|
| Probabilidade | Alta — é o estado atual |
| Impacto | Fatal para receita / Grave para produto |

**Sinais de alerta:**
- Você está construindo features pedidas por um único cliente
- As decisões de roadmap são baseadas em uma conversa

**Mitigação:**
- Regra dos 3 antes de cobrar: ter 3 escritórios usando antes de lançar pricing
- Regra dos 20%: nenhum cliente deve representar mais de 20% da receita

---

### Vulnerabilidade: Canal de aquisição único (indicação)

**Descrição:** O modelo atual de crescimento é beta por convite e indicação boca a boca. Funciona no início, não escala sozinho.

| Dimensão | Avaliação |
|----------|-----------|
| Probabilidade | Alta — sem canal alternativo testado ainda |
| Impacto | Grave — crescimento trava num teto invisível |

**Sinais de alerta:**
- Pipeline de novos escritórios para o próximo mês está vazio
- Não existe nenhum experimento de aquisição rodando (SEO, conteúdo, comunidade OAB)

**Mitigação:**
- Testar 2 canais diferentes antes de escalar: conteúdo jurídico (SEO) + presença em grupos OAB no WhatsApp/LinkedIn
- Medir qual canal traz clientes com maior retenção, não apenas maior volume

---

## 4. Fornecedores / Parceiros

### Vulnerabilidade: Sem integração com tribunais = produto incompleto

**Descrição:** O principal workflow do advogado (acompanhar movimentações processuais) acontece fora da Leea. Isso cria dependência de um "fornecedor" que é na verdade a concorrência indireta: o site do tribunal.

| Dimensão | Avaliação |
|----------|-----------|
| Probabilidade | Alta — já é uma realidade hoje |
| Impacto | Grave — é o principal motivo de churn potencial |

**Sinais de alerta:**
- Advogados relatam que "ainda precisam checar o tribunal todo dia"
- Produto não é a primeira tela aberta de manhã

**Mitigação:**
- Estudar viabilidade de integração com DataJud (CNJ) — API pública e gratuita para consulta de processos federais
- Avaliar parceria com serviços especializados em scraping de tribunal (JusBrasil API, Escavador)

---

## Mapa de Risco Consolidado

| Vulnerabilidade | Probabilidade | Impacto | Prioridade |
|----------------|--------------|---------|-----------|
| Fundador único tech | Média | Fatal | 🔴 Alta |
| Supabase pricing | Média | Fatal | 🔴 Alta |
| 100% receita num cliente | Alta | Fatal | 🔴 Alta |
| Sem integração tribunal | Alta | Grave | 🔴 Alta |
| Canal único de aquisição | Alta | Grave | 🟡 Média |
| Better Auth abandono | Baixa | Fatal | 🟡 Média |
| Beta: um escritório domina roadmap | Média | Grave | 🟡 Média |
| Vercel pricing em escala | Alta | Leve-Grave | 🟢 Baixa |

---

## A frase que resume a auditoria

> *O negócio tem muitos pontos únicos de falha, mas todos são esperados para o estágio atual. O risco não é existir — é não ter plano de mitigação antes que cada um vire urgente.*

A diferença entre startup que sobrevive e startup que não sobrevive raramente é qual problema apareceu. É qual problema apareceu **sem que o fundador tivesse pensado antes**.
