# A reunião com o VC que você precisa ter antes da reunião real

> Exercício: VC cético fazendo due diligence. Viu 200 pitches esse ano.
> Está procurando razões para recusar, não para aprovar.

---

## Os 3 maiores buracos no modelo

### Buraco 1 — Você está construindo em cima de areia

Sua infraestrutura crítica é 100% terceirizada e você não controla o preço dela.

- **Supabase** cobra por MAU, storage e bandwidth. Você está no free tier. Quando escalar, o custo sobe de forma não-linear — e você vai repassar pro cliente ou absorver?
- **Better Auth** é open source mantido por um time pequeno. Se abandonarem o projeto ou mudarem a licença, você reescreve autenticação no meio de uma escala.
- **Vercel** tem histórico de mudar preços de forma agressiva conforme o uso cresce.

A pergunta não é "vai acontecer?" — é "quando acontecer, você tem 3 meses de runway pra migrar sem derrubar clientes?"

**Por que eu diria não:** você precifica sem saber seu custo real de infraestrutura por cliente. Qualquer modelo financeiro que você me mostrar é ficção.

---

### Buraco 2 — O mercado que você quer não é o mercado que vai pagar

Advogados solo e pequenos escritórios são o ICP mais difícil de monetizar em SaaS:
- Alta sensibilidade a preço
- Ciclo de venda longo (a decisão passa pelo ego do sócio)
- Churn alto em crise (primeiro corte quando o escritório vai mal)
- Não têm time de TI para onboarding complexo
- Influenciados por pares, não por marketing digital

O segmento que pagaria R$189/mês sem negociar são escritórios médios de 15-50 advogados — e esses têm compliance, segurança, integração com sistemas legados e exigem contrato. Você não está preparado para vender pra eles ainda.

**Por que eu diria não:** você está no meio-termo. Pequeno demais pra quem paga bem, caro demais pra quem é fácil de vender.

---

### Buraco 3 — Sem lock-in real

O que impede um escritório de exportar os dados e ir embora amanhã?

- Casos: exporta JSON e importa em qualquer concorrente
- Documentos: são arquivos PDF — já existem no computador do cliente
- Prazos: planilha resolve
- Clientes: CSV

O único lock-in que existe hoje é **inércia**. Isso sustenta retenção nos primeiros 12 meses. Não sustenta nos meses 13-36, quando o concorrente oferece 3 meses grátis pra migrar.

Lock-in real seria: dados gerados *dentro* do produto que não existem fora dele — histórico de IA, análise de padrões dos casos, benchmark com outros escritórios, integrações com tribunal que só funcionam via Leea.

**Por que eu diria não:** sem lock-in, você está num negócio de aquisição constante. CAC nunca para de crescer.

---

## A pergunta que você provavelmente não consegue responder

> **"Qual é o seu NRR — Net Revenue Retention — depois de 12 meses?"**

Não o churn. O NRR.

NRR mede se os clientes que ficaram estão pagando *mais* do que pagavam no início — via upgrade de plano, mais usuários, add-ons. Um SaaS saudável tem NRR acima de 100%.

Você não tem essa resposta porque:
1. Ainda não tem clientes pagantes há 12 meses
2. Não tem estrutura de expansão de receita (upsell, add-ons, planos por uso)
3. Não sabe se alguém vai querer pagar mais com o tempo

Sem NRR, qualquer projeção de receita que você me mostrar é uma linha reta. Investidores de SaaS não compram linhas retas.

---

## A empresa que tentou isso e falhou

### Caso: Clio (versão brasileira que não deu certo)

O Clio é o maior legal SaaS do mundo, fundado no Canadá em 2008. Hoje vale ~USD 3 bilhões.

Várias startups brasileiras tentaram ser "o Clio do Brasil" entre 2015 e 2020:
- **LegalDesk** (BR) — focou em automação de documentos, não conseguiu crescer além de automação simples
- **Advbox** — sobreviveu, mas ficou preso no segmento de preço baixo, sem expansão para enterprise
- **Jurídico Certo** — adquirido/incorporado, nunca virou referência de mercado

**Por que falharam:**
1. Subestimaram o custo de integração com tribunais brasileiros (PJe, e-SAJ, PROJUDI são sistemas estaduais diferentes, cada um com sua quirk)
2. Tentaram crescer por marketing digital num mercado que compra por indicação de colega na OAB
3. Não tinham capital para o ciclo de venda longo de escritórios médios/grandes
4. Precificaram para sobreviver, não para crescer — nunca tiveram margem para reinvestir em produto

**Como você pode repetir o erro:**
- Crescer por volume de escritórios pequenos, sacrificando margem
- Não resolver o PJe antes de escalar
- Gastar marketing antes de ter retenção comprovada

**O que o Clio fez diferente:** focou em one-stop-shop com integrações reais (tribunais, pagamento, tempo faturável), construiu comunidade e educação (Clio Cloud Conference), e só escalou marketing quando o NRR estava acima de 110%.

---

## O que o VC diria no final da reunião

> *"Produto bem construído, founders que entendem o problema. Mas voltem quando tiverem 6 meses de dados de retenção, um plano claro de integração com tribunal e margem suficiente para não depender de infra gratuita. O mercado está lá. A questão é se vocês chegam lá antes de ficarem sem dinheiro."*

Tradução: **não é não. É ainda não.**
