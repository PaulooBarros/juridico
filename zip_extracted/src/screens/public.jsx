// Public-facing screens: Landing, Login, Cadastro, Gateway, Onboarding, Seleção de Escritório

// ============== LANDING ==============
function Landing() {
  const { go } = useRoute();
  return (
    <div className="public-shell">
      <nav className="public-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="sb-brand-mark" style={{ width: 24, height: 24, fontSize: 14 }}>V</div>
          <div className="sb-brand-name" style={{ fontSize: 16 }}>Vetor <em>Jurídico</em></div>
        </div>
        <div className="public-nav-links">
          <a href="#produto">Produto</a>
          <a href="#modulos">Módulos</a>
          <a href="#planos">Planos</a>
          <a href="#sobre">Sobre</a>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button className="btn btn-ghost" onClick={() => go("/auth/login")}>Entrar</button>
          <button className="btn btn-primary" onClick={() => go("/auth/cadastro")}>Começar gratuitamente</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="dotted" style={{ padding: "96px 40px 120px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>—  Sistema operacional jurídico</div>
            <h1 className="h1">
              Quando tudo está sob controle,<br />
              a advocacia fica <em>inevitável.</em>
            </h1>
            <p style={{ fontSize: 17, color: "var(--fg-muted)", lineHeight: 1.55, marginTop: 24, maxWidth: "52ch" }}>
              O Vetor Jurídico organiza casos, prazos, documentos e o financeiro em uma única superfície. Nada de planilhas paralelas, e-mails perdidos, ou prazos descobertos na véspera.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 32, alignItems: "center" }}>
              <button className="btn btn-primary btn-lg" onClick={() => go("/auth/cadastro")}>Criar conta — 14 dias grátis</button>
              <button className="btn btn-secondary btn-lg" onClick={() => go("/dashboard")}>Ver demonstração</button>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 28, fontSize: 12, color: "var(--fg-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={12} /> Sem cartão de crédito
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={12} /> Migração assistida
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={12} /> LGPD nativo
              </div>
            </div>
          </div>

          {/* Mini dashboard preview */}
          <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--shadow-lg)", transform: "rotate(-0.4deg)" }}>
            <div style={{ background: "var(--bg-elev)", padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#E07A75" }}></span>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#D6A24A" }}></span>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#69B07A" }}></span>
              <span style={{ marginLeft: 8 }}>vetorjuridico.com.br · dashboard</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Prazos críticos</div>
              {[
                ["pz-001", "Manifestação · Vale Itajaí", "2 dias", "critico"],
                ["pz-002", "Audiência · Móveis Serra", "2 dias", "critico"],
                ["pz-003", "Contrarrazões · TechBras", "3 dias", "alto"],
              ].map(([id, t, d, p]) => (
                <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={"dot " + (p === "critico" ? "danger" : "warning")}></span>
                    <span>{t}</span>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-muted)" }}>{d}</span>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
                <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}>
                  <div className="eyebrow" style={{ fontSize: 9 }}>Casos ativos</div>
                  <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>14</div>
                </div>
                <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}>
                  <div className="eyebrow" style={{ fontSize: 9 }}>A receber</div>
                  <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>R$ 184k</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section style={{ padding: "96px 40px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>01 — O problema real</div>
          <h2 className="h2" style={{ maxWidth: "20ch" }}>A advocacia brasileira ainda opera por <em>improviso.</em></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 48 }}>
            {[
              ["Prazos descobertos na véspera", "Planilhas paralelas, e-mails perdidos, lembretes que ninguém atualiza. Um esquecimento custa o caso — e a relação com o cliente."],
              ["Cliente sem visibilidade", "O cliente liga para saber em que pé está o processo. A resposta depende de quem atender o telefone naquele dia."],
              ["Crescimento que vira caos", "Cada novo advogado contratado significa mais reuniões, mais retrabalho e menos previsibilidade. O escritório escala — e perde controle."],
            ].map(([t, b], i) => (
              <div key={i} style={{ padding: "0 0 0 24px", borderLeft: "2px solid var(--accent)" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--accent)", marginBottom: 8 }}>{String(i + 1).padStart(2, "0")}</div>
                <h3 style={{ fontSize: 17, fontWeight: 500, margin: "0 0 10px" }}>{t}</h3>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.55, margin: 0 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARADIGMA */}
      <section style={{ padding: "96px 40px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 64, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 80 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>02 — Mudança de paradigma</div>
            <h2 className="h2" style={{ maxWidth: "18ch" }}>De ferramenta acessória a <em>infraestrutura do escritório.</em></h2>
          </div>
          <div>
            {[
              ["Antes", "Software jurídico = repositório passivo. Você lança o que aconteceu.", "agora"],
              ["Agora", "Sistema operacional = o trabalho acontece dentro dele. O sistema avisa, sugere, cobra.", null],
              ["Antes", "Um CRM, um financeiro, um drive, três planilhas. Nenhum conversa.", null],
              ["Agora", "Uma única superfície. Cliente → caso → prazo → documento. Rastreável.", null],
              ["Antes", "Cada sócio com sua maneira. Onboarding de novo advogado leva semanas.", null],
              ["Agora", "O método do escritório está no software. O sistema é o playbook.", null],
            ].map(([k, t], i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                <div className="mono" style={{ fontSize: 11, color: k === "Agora" ? "var(--accent)" : "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                <div style={{ fontSize: 15, color: k === "Agora" ? "var(--fg)" : "var(--fg-muted)" }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="modulos" style={{ padding: "96px 40px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>03 — Seis módulos, uma operação</div>
          <h2 className="h2" style={{ maxWidth: "22ch" }}>Tudo o que um escritório executa, em <em>uma única superfície.</em></h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, marginTop: 48, border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            {[
              ["briefcase", "Casos", "Cada processo com timeline, prazos, partes, documentos e responsável. Um único lugar para tudo."],
              ["users", "Clientes", "PF e PJ. Histórico completo: contratos, casos, financeiro, comunicação."],
              ["calendar", "Prazos & Calendário", "Cálculo automático de prazos processuais. Alertas escalonados por criticidade."],
              ["file", "Documentos & Modelos", "Versionamento, busca por conteúdo, modelos com variáveis. Sem mais procurar a última versão."],
              ["wallet", "Financeiro", "Honorários fixos, êxito, recorrências. Cobrança automatizada. Visão por cliente, caso, advogado."],
              ["users", "Equipe & permissões", "Roles claras: titular, sócio, advogado, assistente. Cada um vê o que precisa."],
            ].map(([ic, t, d], i) => (
              <div key={i} style={{
                padding: 24,
                borderRight: (i % 3 !== 2) ? "1px solid var(--border)" : "none",
                borderBottom: i < 3 ? "1px solid var(--border)" : "none",
              }}>
                <Icon name={ic} size={20} style={{ color: "var(--accent)", marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>{t}</h3>
                <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.55, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section style={{ padding: "96px 40px", borderBottom: "1px solid var(--border)", background: "var(--bg-elev)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>04 — Por que confiar</div>
          <h2 className="h2" style={{ maxWidth: "22ch" }}>Construído com quem entende — <em>e usa todos os dias.</em></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginTop: 48 }}>
            {[
              ["Conformidade brasileira", "LGPD, certificado digital ICP-Brasil, integração com PJe, eSAJ, Projudi. Não é adaptação — é nativo."],
              ["Construído com advogados", "Cada módulo passou por bancas de litígio, contencioso, contratos e família. O método veio da prática."],
              ["Soberania dos seus dados", "Dados em data center brasileiro. Backup contínuo. Auditoria de acesso. Você sai com tudo, quando quiser."],
            ].map(([t, b], i) => (
              <div key={i}>
                <div className="serif" style={{ fontSize: 30, fontStyle: "italic", color: "var(--accent)", marginBottom: 16 }}>{String(i + 1).padStart(2, "0")}.</div>
                <h3 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 8px" }}>{t}</h3>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, margin: 0 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "120px 40px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 className="h1" style={{ fontSize: 48 }}>
            Quando tudo está sob controle,<br />
            a advocacia fica <em>inevitável.</em>
          </h2>
          <p style={{ fontSize: 16, color: "var(--fg-muted)", marginTop: 24 }}>
            Comece grátis. Sem cartão. Cancele quando quiser.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 32, justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={() => go("/auth/cadastro")}>Criar minha conta</button>
            <button className="btn btn-secondary btn-lg" onClick={() => go("/dashboard")}>Explorar a demonstração</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "48px 40px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div className="sb-brand-mark">V</div>
              <div className="sb-brand-name">Vetor <em>Jurídico</em></div>
            </div>
            <div className="serif" style={{ fontSize: 15, fontStyle: "italic", color: "var(--fg-muted)", maxWidth: "32ch" }}>
              "Quando tudo está sob controle, a advocacia fica inevitável."
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>
            © 2026 Vetor Jurídico · CNPJ 00.000.000/0001-00 · São Paulo, Brasil
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============== AUTH — LOGIN ==============
function Login() {
  const { go } = useRoute();
  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go("/landing")}>
          <div className="sb-brand-mark">V</div>
          <div className="sb-brand-name">Vetor <em>Jurídico</em></div>
        </div>
        <div>
          <div className="serif" style={{ fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.02em", color: "var(--fg)", maxWidth: "20ch" }}>
            "Quando tudo está sob controle, a advocacia fica <em style={{ color: "var(--accent)" }}>inevitável.</em>"
          </div>
          <div className="eyebrow" style={{ marginTop: 24 }}>— Vetor Jurídico</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>
          v2026.05 · São Paulo, Brasil
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <h1 className="serif" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px", letterSpacing: "-0.015em" }}>Entrar</h1>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "0 0 24px" }}>Acesse sua conta para continuar.</p>

          <form onSubmit={(e) => { e.preventDefault(); go("/dashboard"); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="field-label">E-mail</label>
              <input className="input input-lg" type="email" placeholder="voce@escritorio.com.br" defaultValue="marina@vetorjuridico.com.br" />
            </div>
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="field-label">Senha</label>
                <a style={{ fontSize: 11, color: "var(--accent)" }}>Esqueci a senha</a>
              </div>
              <input className="input input-lg" type="password" placeholder="••••••••" defaultValue="senha-de-demonstracao" />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" style={{ marginTop: 8 }}>Entrar</button>
          </form>

          <div className="div-label" style={{ margin: "24px 0" }}>ou</div>
          <button className="btn btn-secondary btn-lg" style={{ width: "100%" }}>Continuar com Google</button>
          <button className="btn btn-secondary btn-lg" style={{ width: "100%", marginTop: 8 }}>Entrar com certificado digital (ICP-Brasil)</button>

          <div style={{ marginTop: 32, fontSize: 13, color: "var(--fg-muted)", textAlign: "center" }}>
            Não tem conta? <a style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => go("/auth/cadastro")}>Cadastre-se</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== AUTH — CADASTRO ==============
function Cadastro() {
  const { go } = useRoute();
  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go("/landing")}>
          <div className="sb-brand-mark">V</div>
          <div className="sb-brand-name">Vetor <em>Jurídico</em></div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Você está a 30 segundos de</div>
          <div className="serif" style={{ fontSize: 32, lineHeight: 1.15, letterSpacing: "-0.02em", maxWidth: "18ch" }}>
            organizar a operação inteira do escritório em <em style={{ color: "var(--accent)" }}>um lugar só.</em>
          </div>
          <div style={{ marginTop: 32, display: "grid", gap: 10 }}>
            {[
              "14 dias grátis em todos os recursos",
              "Sem cartão de crédito",
              "Migração assistida de planilhas e Drive",
              "LGPD nativo, dados no Brasil",
            ].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-muted)" }}>
                <Icon name="check" size={14} style={{ color: "var(--accent)" }} />
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>
          v2026.05 · São Paulo, Brasil
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <h1 className="serif" style={{ fontSize: 28, fontWeight: 500, margin: "0 0 6px", letterSpacing: "-0.015em" }}>Criar conta</h1>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "0 0 24px" }}>Comece agora. Configure o escritório no próximo passo.</p>

          <form onSubmit={(e) => { e.preventDefault(); go("/gateway"); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="field-label">Nome completo</label>
              <input className="input input-lg" placeholder="Como aparece na sua OAB" />
            </div>
            <div className="field">
              <label className="field-label">E-mail profissional</label>
              <input className="input input-lg" type="email" placeholder="voce@escritorio.com.br" />
            </div>
            <div className="field">
              <label className="field-label">Senha</label>
              <input className="input input-lg" type="password" placeholder="Mínimo 10 caracteres" />
              <div className="field-hint">Use uma combinação de letras, números e símbolos.</div>
            </div>
            <label style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--fg-muted)", marginTop: 4 }}>
              <input type="checkbox" style={{ marginTop: 2 }} defaultChecked />
              <span>Concordo com os <a style={{ color: "var(--accent)" }}>Termos de Uso</a> e a <a style={{ color: "var(--accent)" }}>Política de Privacidade</a>.</span>
            </label>
            <button className="btn btn-primary btn-lg" type="submit" style={{ marginTop: 8 }}>Criar conta</button>
          </form>

          <div style={{ marginTop: 32, fontSize: 13, color: "var(--fg-muted)", textAlign: "center" }}>
            Já tem conta? <a style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => go("/auth/login")}>Entrar</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== GATEWAY ==============
function Gateway() {
  const { go } = useRoute();
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 40 }}>
      <div style={{ maxWidth: 760, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Bem-vinda, Marina</div>
          <h1 className="h2" style={{ fontSize: 36 }}>Como você quer começar?</h1>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", marginTop: 12, maxWidth: "52ch", marginLeft: "auto", marginRight: "auto" }}>
            Você ainda não está vinculada a nenhum escritório no Vetor Jurídico.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 28, cursor: "pointer" }} onClick={() => go("/onboarding")}>
            <Icon name="building" size={22} style={{ color: "var(--accent)" }} />
            <h3 className="serif" style={{ fontSize: 20, fontWeight: 500, margin: "16px 0 6px", letterSpacing: "-0.01em" }}>Criar um escritório</h3>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0, lineHeight: 1.55 }}>
              Configure um novo escritório do zero. Você será titular e poderá convidar a equipe depois.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 24, fontSize: 13, color: "var(--accent)" }}>
              Começar configuração <Icon name="arrowR" size={14} />
            </div>
          </div>

          <div className="card" style={{ padding: 28, cursor: "pointer" }}>
            <Icon name="mail" size={22} style={{ color: "var(--fg-muted)" }} />
            <h3 className="serif" style={{ fontSize: 20, fontWeight: 500, margin: "16px 0 6px", letterSpacing: "-0.01em" }}>Tenho um convite</h3>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0, lineHeight: 1.55 }}>
              Insira o código que recebeu por e-mail para entrar em um escritório existente.
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 6 }}>
              <input className="input" placeholder="Código do convite" />
              <button className="btn btn-secondary">Validar</button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "var(--fg-subtle)" }}>
          <a style={{ cursor: "pointer" }} onClick={() => go("/auth/login")}>← Sair e entrar com outra conta</a>
        </div>
      </div>
    </div>
  );
}

// ============== ONBOARDING ==============
function Onboarding() {
  const { go } = useRoute();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const next = () => step < totalSteps ? setStep(step + 1) : go("/dashboard");
  const prev = () => step > 1 ? setStep(step - 1) : go("/gateway");

  const titles = [
    "", "Dados do escritório", "Identidade", "Seu perfil profissional", "Convide sua equipe", "Escolha seu plano"
  ];
  const subs = [
    "",
    "Informações cadastrais. Isso aparece em documentos gerados pelo sistema.",
    "Como o escritório se apresenta para clientes e equipe.",
    "Esses dados aparecem em petições e na comunicação com clientes.",
    "Convide colegas para colaborar. Você pode pular e fazer depois.",
    "Comece com 14 dias grátis em qualquer plano.",
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="sb-brand-mark">V</div>
          <div className="sb-brand-name">Vetor <em>Jurídico</em></div>
        </div>
        <div className="stepper">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <React.Fragment key={i}>
              <div className={"step-num " + (i + 1 === step ? "active" : i + 1 < step ? "done" : "")}>
                {i + 1 < step ? <Icon name="check" size={11} /> : i + 1}
              </div>
              {i < totalSteps - 1 && <div className="step-line"></div>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-muted)", cursor: "pointer" }} onClick={() => go("/dashboard")}>Pular configuração →</div>
      </header>

      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ maxWidth: 640, width: "100%" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Etapa {step} de {totalSteps}</div>
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 500, margin: 0, letterSpacing: "-0.02em" }}>{titles[step]}</h1>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", margin: "8px 0 32px", maxWidth: "60ch" }}>{subs[step]}</p>

          {step === 1 && <OnbStep1 />}
          {step === 2 && <OnbStep2 />}
          {step === 3 && <OnbStep3 />}
          {step === 4 && <OnbStep4 />}
          {step === 5 && <OnbStep5 />}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            <button className="btn btn-ghost" onClick={prev}>← Voltar</button>
            <button className="btn btn-primary btn-lg" onClick={next}>
              {step === totalSteps ? "Concluir e entrar" : "Continuar"} <Icon name="arrowR" size={14} />
            </button>
          </div>
        </div>
      </div>

      <footer style={{ padding: "16px 40px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>
        <span className="serif" style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: 12, color: "var(--fg-muted)" }}>"Quando tudo está sob controle, a advocacia fica inevitável."</span>
        <span>Vetor Jurídico v2026.05</span>
      </footer>
    </div>
  );
}

function OnbStep1() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="field">
        <label className="field-label">Nome do escritório</label>
        <input className="input input-lg" defaultValue="Costa, Furtado & Werneck Advogados" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label className="field-label">CNPJ</label>
          <input className="input input-lg" defaultValue="42.881.401/0001-22" />
        </div>
        <div className="field">
          <label className="field-label">Inscrição OAB (sociedade)</label>
          <input className="input input-lg" defaultValue="OAB/SP 12.481" />
        </div>
      </div>
      <div className="field">
        <label className="field-label">Especialidade principal</label>
        <select className="select input-lg">
          <option>Banca generalista</option>
          <option>Contencioso cível</option>
          <option>Trabalhista</option>
          <option>Tributário</option>
          <option>Empresarial / M&A</option>
          <option>Família e sucessões</option>
          <option>Penal</option>
        </select>
      </div>
      <div className="field">
        <label className="field-label">Cidade / UF</label>
        <input className="input input-lg" defaultValue="São Paulo / SP" />
      </div>
    </div>
  );
}

function OnbStep2() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div className="logo-up">
          <div style={{ textAlign: "center", fontSize: 11, lineHeight: 1.4 }}>
            <Icon name="upload" size={18} style={{ marginBottom: 6 }} /><br />
            Subir<br />logo
          </div>
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label className="field-label">Logo do escritório</label>
          <div className="field-hint">PNG ou SVG, fundo transparente. Aparece em petições e e-mails. Pode ajustar depois.</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="btn btn-secondary btn-sm">Escolher arquivo</button>
            <button className="btn btn-ghost btn-sm">Usar texto por enquanto</button>
          </div>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Slogan</label>
        <input className="input input-lg" placeholder="Uma frase curta que captura o escritório" defaultValue="Estratégia jurídica para empresas que decidem." />
      </div>
      <div className="field">
        <label className="field-label">Descrição pública</label>
        <textarea className="input input-lg" rows="3" style={{ resize: "vertical" }} defaultValue="Banca full-service com 18 anos de atuação em contencioso empresarial, trabalhista e tributário. Sede em São Paulo, operação nacional."></textarea>
      </div>
    </div>
  );
}

function OnbStep3() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div className="avatar xl" style={{ background: "var(--bg-elev)", color: "var(--fg-subtle)", border: "1px dashed var(--border-strong)" }}>
          <Icon name="user" size={22} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label className="field-label">Foto de perfil</label>
          <div className="field-hint">Aparece em comunicados internos e na assinatura de documentos.</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="btn btn-secondary btn-sm">Escolher foto</button>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        <div className="field">
          <label className="field-label">Nome profissional</label>
          <input className="input input-lg" defaultValue="Marina Costa" />
        </div>
        <div className="field">
          <label className="field-label">OAB</label>
          <input className="input input-lg" defaultValue="OAB/SP 184.221" />
        </div>
      </div>
      <div className="field">
        <label className="field-label">Áreas de atuação</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {["Contencioso cível", "Trabalhista", "Tributário", "M&A", "Família"].map(a => (
            <span key={a} className="tag accent">{a} <Icon name="x" size={10} /></span>
          ))}
          <span className="tag" style={{ cursor: "pointer" }}>+ adicionar</span>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Mini-bio</label>
        <textarea className="input input-lg" rows="3" style={{ resize: "vertical" }} defaultValue="Sócia titular. 16 anos de atuação em contencioso cível e empresarial. Pós-graduação em Direito Processual Civil pela PUC-SP."></textarea>
      </div>
    </div>
  );
}

function OnbStep4() {
  const [invites, setInvites] = useState([
    { email: "andre@vetorjuridico.com.br", role: "admin" },
    { email: "julia@vetorjuridico.com.br", role: "lawyer" },
    { email: "", role: "lawyer" },
  ]);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {invites.map((inv, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 180px 32px", gap: 8 }}>
          <input className="input input-lg" placeholder="email@exemplo.com" value={inv.email} onChange={e => {
            const next = [...invites]; next[i].email = e.target.value; setInvites(next);
          }} />
          <select className="select input-lg" value={inv.role} onChange={e => { const next = [...invites]; next[i].role = e.target.value; setInvites(next); }}>
            <option value="admin">Sócio / Admin</option>
            <option value="lawyer">Advogado</option>
            <option value="assistant">Assistente</option>
          </select>
          <button className="icon-btn" onClick={() => setInvites(invites.filter((_, j) => j !== i))}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", marginTop: 4 }} onClick={() => setInvites([...invites, { email: "", role: "lawyer" }])}>
        <Icon name="plus" size={12} /> Adicionar mais um
      </button>
      <div style={{ marginTop: 16, padding: 12, background: "var(--bg-elev)", borderRadius: 6, fontSize: 12, color: "var(--fg-muted)", display: "flex", gap: 10 }}>
        <Icon name="info" size={14} style={{ color: "var(--info)", marginTop: 1 }} />
        <span>Cada convidado recebe um e-mail com instruções de cadastro. Permissões podem ser ajustadas a qualquer momento em <strong>Equipe</strong>.</span>
      </div>
    </div>
  );
}

function OnbStep5() {
  return <PlanosCards onboarding />;
}

// ============== SELEÇÃO DE ESCRITÓRIO ==============
function EscritoriosSelect() {
  const { go } = useRoute();
  const lista = window.MOCK.ESCRITORIOS;
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 40 }}>
      <div style={{ maxWidth: 720, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Selecione um escritório</div>
          <h1 className="h2" style={{ fontSize: 32 }}>Em qual escritório você quer entrar?</h1>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {lista.map(e => (
            <div key={e.id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => go("/dashboard")}>
              <div className="sb-office-mark" style={{ width: 44, height: 44, fontSize: 14 }}>{e.sigla}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{e.nome}</div>
                <div style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  {e.role} · {e.membros} {e.membros === 1 ? "membro" : "membros"} · {e.casos} casos · acesso {e.ultimoAcesso}
                </div>
              </div>
              <span className="tag">{e.plano}</span>
              <Icon name="arrowR" size={14} style={{ color: "var(--fg-subtle)" }} />
            </div>
          ))}
          <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", borderStyle: "dashed" }} onClick={() => go("/onboarding")}>
            <div className="sb-office-mark" style={{ width: 44, height: 44, fontSize: 16, background: "var(--bg-card)", color: "var(--fg-muted)", border: "1px dashed var(--border-strong)" }}>
              <Icon name="plus" size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Criar outro escritório</div>
              <div style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 2 }}>Configure uma nova banca independente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Expose
window.Landing = Landing;
window.Login = Login;
window.Cadastro = Cadastro;
window.Gateway = Gateway;
window.Onboarding = Onboarding;
window.EscritoriosSelect = EscritoriosSelect;
