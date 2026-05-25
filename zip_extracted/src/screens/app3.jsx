// App screens — Financeiro, Notificações, Configurações, Perfil, Escritório, Planos

// ============== FINANCEIRO ==============
function Financeiro() {
  const items = window.MOCK.FINANCEIRO;
  const [status, setStatus] = useState("todos");
  const filt = items.filter(f => status === "todos" || f.status === status);

  const recebido = items.filter(f => f.status === "recebido").reduce((s, f) => s + f.valor, 0);
  const pendente = items.filter(f => f.status === "pendente").reduce((s, f) => s + f.valor, 0);
  const atraso = items.filter(f => f.status === "atraso").reduce((s, f) => s + f.valor, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-sub">Honorários · maio de 2026 · 3 cobranças em atraso</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="download" size={13} /> Exportar</button>
          <button className="btn btn-secondary"><Icon name="send" size={13} /> Cobrar em massa</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Novo lançamento</button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          <div className="metric" style={{ borderRight: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div className="metric-label">Total recebido (maio)</div>
            <div className="metric-value">{brl(recebido)}</div>
            <div className="metric-trend up"><Icon name="trend" size={11} /> +18% vs. abril</div>
          </div>
          <div className="metric" style={{ borderRight: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div className="metric-label">A receber este mês</div>
            <div className="metric-value">{brl(pendente)}</div>
            <div style={{ fontSize: 10, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>5 lançamentos pendentes</div>
          </div>
          <div className="metric" style={{ borderRight: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div className="metric-label">Em atraso</div>
            <div className="metric-value" style={{ color: "var(--danger)" }}>{brl(atraso)}</div>
            <div className="metric-trend down"><Icon name="alert" size={11} /> 3 cobranças</div>
          </div>
          <div className="metric" style={{ background: "var(--bg-card)" }}>
            <div className="metric-label">Faturamento médio · 12 meses</div>
            <div className="metric-value">R$ 142k</div>
            <div style={{ fontSize: 10, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>Por mês</div>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar">
            <div style={{ display: "flex", gap: 4 }}>
              {[["todos", "Todos"], ["recebido", "Recebidos"], ["pendente", "Pendentes"], ["atraso", "Em atraso"]].map(([k, l]) => (
                <button key={k} className={"btn btn-sm " + (status === k ? "btn-secondary" : "btn-ghost")} onClick={() => setStatus(k)}>{l}</button>
              ))}
            </div>
            <div style={{ flex: 1 }}></div>
            <div className="search" style={{ maxWidth: 240 }}>
              <Icon name="search" size={13} style={{ color: "var(--fg-subtle)" }} />
              <input placeholder="Buscar por cliente ou descrição..." />
            </div>
            <span style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>{filt.length} lançamentos</span>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Caso</th>
                <th>Descrição</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th className="num">Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filt.map(f => {
                const isLate = f.status === "atraso";
                const statusColor = f.status === "recebido" ? "success" : f.status === "atraso" ? "danger" : "warning";
                const statusLabel = f.status === "recebido" ? "Pago" : f.status === "atraso" ? `Atraso · ${f.diasAtraso}d` : "Pendente";
                return (
                  <tr key={f.id}>
                    <td><div style={{ fontSize: 13, fontWeight: 500 }}>{f.cliente}</div></td>
                    <td className="id">{f.caso}</td>
                    <td style={{ fontSize: 13 }}>{f.descricao}</td>
                    <td className="mono" style={{ fontSize: 12, color: isLate ? "var(--danger)" : "var(--fg-muted)" }}>
                      {f.vencimento}
                      {f.dataPag && <div style={{ fontSize: 10, color: "var(--success)" }}>pago {f.dataPag}</div>}
                    </td>
                    <td><span className={"tag " + statusColor}>{statusLabel}</span></td>
                    <td className="num" style={{ fontWeight: isLate ? 600 : 400 }}>{brl(f.valor)}</td>
                    <td>
                      {f.status !== "recebido" && <button className="btn btn-ghost btn-sm">Cobrar</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--bg-elev)" }}>
                <td colSpan="5" style={{ textAlign: "right", fontWeight: 500, fontSize: 12, color: "var(--fg-muted)" }}>Total filtrado</td>
                <td className="num" style={{ fontWeight: 600, fontSize: 14 }}>{brl(filt.reduce((s, f) => s + f.valor, 0))}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}

// ============== NOTIFICAÇÕES ==============
function Notificacoes() {
  const items = window.MOCK.NOTIFICACOES;
  const [filter, setFilter] = useState("todas");
  const filt = items.filter(n => {
    if (filter === "naolidas") return !n.lida;
    if (filter === "criticas") return n.prioridade === "critico";
    return true;
  });

  const tipoIcon = { prazo: "clock", atividade: "history", financeiro: "wallet", convite: "users" };
  const prioColor = { critico: "danger", alto: "warning", medio: "info", info: "" };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notificações</h1>
          <p className="page-sub">{items.filter(n => !n.lida).length} não lidas · alertas proativos do sistema</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost"><Icon name="cog" size={13} /> Preferências</button>
          <button className="btn btn-secondary">Marcar todas como lidas</button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[["todas", "Todas", items.length], ["naolidas", "Não lidas", items.filter(n => !n.lida).length], ["criticas", "Críticas", items.filter(n => n.prioridade === "critico").length]].map(([k, l, n]) => (
            <button key={k} className={"btn btn-sm " + (filter === k ? "btn-secondary" : "btn-ghost")} onClick={() => setFilter(k)}>
              {l} <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-subtle)", marginLeft: 4 }}>{n}</span>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {filt.map(n => (
            <div key={n.id} className={"notif " + (n.lida ? "read" : "unread")}>
              <div className="notif-dot"></div>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--bg-elev)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={tipoIcon[n.tipo]} size={14} style={{ color: "var(--fg-muted)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n.titulo}</div>
                  {n.prioridade === "critico" && <span className="tag danger">crítico</span>}
                  {n.prioridade === "alto" && <span className="tag warning">alto</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 3 }}>{n.descricao}</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{n.quando}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============== CONFIGURAÇÕES ==============
function Configuracoes() {
  const [tab, setTab] = useState("escritorio");
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-sub">Preferências do escritório, conta e segurança</p>
        </div>
      </div>

      <div className="tabs">
        {[["escritorio", "Escritório"], ["usuario", "Usuário"], ["seg", "Segurança"], ["plano", "Plano"]].map(([k, l]) => (
          <div key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      <div className="page-body" style={{ maxWidth: 720 }}>
        {tab === "escritorio" && <ConfSection title="Dados do escritório" desc="Informações cadastrais usadas em documentos">
          <ConfField label="Razão social" value="Costa, Furtado & Werneck Advogados Associados" />
          <ConfField label="CNPJ" value="42.881.401/0001-22" mono />
          <ConfField label="OAB (sociedade)" value="OAB/SP 12.481" mono />
          <ConfField label="Endereço" value="Av. Paulista, 1842 — 14º andar — São Paulo / SP" />
          <ConfField label="Telefone principal" value="(11) 3145-7700" mono />
          <ConfField label="Fuso horário" value="(UTC-3) São Paulo" />
        </ConfSection>}

        {tab === "usuario" && <ConfSection title="Sua conta" desc="Preferências pessoais">
          <ConfField label="Nome" value="Marina Costa" />
          <ConfField label="E-mail" value="marina@vetorjuridico.com.br" />
          <ConfField label="Notificações por e-mail" value="Resumo diário às 08:00" />
          <ConfField label="Idioma" value="Português (Brasil)" />
          <ConfField label="Aparência" value="Acompanhar sistema" />
        </ConfSection>}

        {tab === "seg" && <ConfSection title="Segurança" desc="Autenticação e auditoria">
          <ConfField label="Senha" value="Última atualização há 42 dias" actionLabel="Alterar" />
          <ConfField label="Autenticação em 2 fatores" value="App autenticador · ativo" actionLabel="Reconfigurar" />
          <ConfField label="Sessões ativas" value="3 dispositivos" actionLabel="Revisar" />
          <ConfField label="Certificado digital" value="ICP-Brasil A3 · válido até 11/2027" mono actionLabel="Trocar" />
          <ConfField label="Registro de acesso" value="Última auditoria há 2 dias" actionLabel="Ver log" />
        </ConfSection>}

        {tab === "plano" && <ConfSection title="Plano e cobrança" desc="Assinatura e pagamentos">
          <div style={{ padding: 16, background: "var(--bg-elev)", borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 10 }}>Plano atual</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: "-0.01em" }}>Pro · 5 membros</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4 }}>R$ 1.485,00 / mês · próxima cobrança em 15 dias</div>
              </div>
              <button className="btn btn-primary">Gerenciar plano</button>
            </div>
          </div>
          <ConfField label="Método de pagamento" value="•••• 4242 · venc. 09/28" actionLabel="Trocar" />
          <ConfField label="CNPJ para faturamento" value="42.881.401/0001-22" mono />
          <ConfField label="Histórico de faturas" value="14 faturas emitidas" actionLabel="Ver tudo" />
        </ConfSection>}
      </div>
    </>
  );
}
function ConfSection({ title, desc, children }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em" }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 4 }}>{desc}</div>
      </div>
      <div className="card">{children}</div>
    </div>
  );
}
function ConfField({ label, value, mono, actionLabel }) {
  return (
    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{value}</div>
      </div>
      <button className="btn btn-ghost btn-sm">{actionLabel || "Editar"}</button>
    </div>
  );
}

// ============== PERFIL DO ADVOGADO ==============
function Perfil() {
  const [photo, setPhoto] = useState(null);
  const handleFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result);
    r.readAsDataURL(f);
  };
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Perfil profissional</h1>
          <p className="page-sub">Como você aparece em documentos, petições e comunicação com clientes</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Pré-visualizar</button>
          <button className="btn btn-primary">Salvar alterações</button>
        </div>
      </div>

      <div className="page-body" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, maxWidth: 960 }}>
        <div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <label htmlFor="photo-up" className="logo-up" style={{ width: "100%", height: 240, borderRadius: 8 }}>
              {photo ? <img src={photo} alt="" /> : (
                <div style={{ textAlign: "center", padding: 16 }}>
                  <Icon name="user" size={28} />
                  <div style={{ fontSize: 11, marginTop: 8 }}>Arraste ou clique<br />para subir foto</div>
                </div>
              )}
            </label>
            <input id="photo-up" type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-subtle)", textAlign: "center", lineHeight: 1.5 }}>
            JPG ou PNG · ao menos 400×400px<br />Fundo neutro recomendado
          </div>

          <div style={{ marginTop: 24, padding: 16, background: "var(--bg-elev)", borderRadius: 8 }}>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>Status profissional</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <span className="dot success"></span>Em atividade
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 8, fontFamily: "var(--font-mono)" }}>OAB ativa · sem pendências</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <div className="field"><label className="field-label">Nome profissional</label><input className="input input-lg" defaultValue="Marina Costa" /></div>
            <div className="field"><label className="field-label">Tratamento</label><select className="select input-lg"><option>Dra.</option><option>Dr.</option><option>Adv.</option></select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field"><label className="field-label">OAB</label><input className="input input-lg" defaultValue="OAB/SP 184.221" /></div>
            <div className="field"><label className="field-label">E-mail profissional</label><input className="input input-lg" defaultValue="marina@vetorjuridico.com.br" /></div>
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
            <label className="field-label">Bio</label>
            <textarea className="input input-lg" rows="4" style={{ resize: "vertical" }} defaultValue="Sócia titular do Costa, Furtado & Werneck. 16 anos de atuação em contencioso cível e empresarial, com foco em recuperação judicial e disputas de alto valor. Pós-graduação em Direito Processual Civil pela PUC-SP. Membra da Comissão de Direito Empresarial da OAB/SP."></textarea>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Escritórios vinculados</div>
            <div className="card">
              {window.MOCK.ESCRITORIOS.map((e, i) => (
                <div key={e.id} style={{ padding: 14, borderBottom: i < window.MOCK.ESCRITORIOS.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="sb-office-mark" style={{ width: 32, height: 32, fontSize: 12 }}>{e.sigla}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{e.nome}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 2 }}>{e.role} · plano {e.plano}</div>
                  </div>
                  {i === 0 && <span className="tag accent">Ativo</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============== PERFIL DO ESCRITÓRIO ==============
function EscritorioPerfil() {
  const [logo, setLogo] = useState(null);
  const handleFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setLogo(r.result);
    r.readAsDataURL(f);
  };
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Perfil do escritório</h1>
          <p className="page-sub">Identidade pública · aparece em petições, e-mails e portal do cliente</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Ver como cliente</button>
          <button className="btn btn-primary">Salvar alterações</button>
        </div>
      </div>

      <div className="page-body" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, maxWidth: 960 }}>
        <div>
          <label htmlFor="logo-up" className="logo-up" style={{ width: "100%", height: 200 }}>
            {logo ? <img src={logo} alt="" /> : (
              <div style={{ textAlign: "center", padding: 16 }}>
                <div className="serif" style={{ fontSize: 36, fontStyle: "italic", color: "var(--accent)", lineHeight: 1 }}>CFW</div>
                <div style={{ fontSize: 11, marginTop: 12 }}>Subir logo do escritório</div>
              </div>
            )}
          </label>
          <input id="logo-up" type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <div style={{ fontSize: 11, color: "var(--fg-subtle)", textAlign: "center", lineHeight: 1.5, marginTop: 12 }}>
            PNG ou SVG · fundo transparente<br />Largura mínima 400px
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>Estatísticas (12 meses)</div>
            <div className="card">
              {[["Casos abertos", "47"], ["Casos encerrados", "32"], ["Clientes ativos", "10"], ["Receita acumulada", "R$ 1,71 M"]].map(([l, v], i) => (
                <div key={l} style={{ padding: "10px 14px", borderBottom: i < 3 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{l}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="field"><label className="field-label">Nome</label><input className="input input-lg" defaultValue="Costa, Furtado & Werneck Advogados" /></div>
          <div className="field"><label className="field-label">Slogan</label><input className="input input-lg" defaultValue="Estratégia jurídica para empresas que decidem." /></div>
          <div className="field"><label className="field-label">Descrição pública</label><textarea className="input input-lg" rows="3" defaultValue="Banca full-service com 18 anos de atuação em contencioso empresarial, trabalhista e tributário. Sede em São Paulo, operação nacional." /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <div className="field"><label className="field-label">CNPJ</label><input className="input input-lg" defaultValue="42.881.401/0001-22" /></div>
            <div className="field"><label className="field-label">OAB (sociedade)</label><input className="input input-lg" defaultValue="OAB/SP 12.481" /></div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Membros · 5 pessoas</div>
            <div className="card">
              {window.MOCK.EQUIPE.map((u, i) => (
                <div key={u.id} style={{ padding: 12, borderBottom: i < window.MOCK.EQUIPE.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="avatar">{u.iniciais}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.nome}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{u.roleNome}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{u.oab}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============== PLANOS ==============
function Planos() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Planos</h1>
          <p className="page-sub">Você está no plano <strong>Pro</strong> · próxima cobrança em 15 dias</p>
        </div>
      </div>
      <div className="page-body">
        <PlanosCards />
      </div>
    </>
  );
}

function PlanosCards({ onboarding }) {
  const plans = [
    { k: "Starter", price: 0, sub: "/ mês", desc: "Para advogados solo começando.", featured: false, cta: "Continuar grátis",
      features: ["Até 1 advogado", "10 casos ativos", "5 GB de documentos", "Modelos básicos", "Suporte por e-mail"] },
    { k: "Pro", price: 297, sub: "/ mês · por advogado", desc: "Para bancas em operação.", featured: true, cta: "Plano atual",
      features: ["Até 15 advogados", "Casos ilimitados", "100 GB de documentos", "Modelos customizáveis", "Integração PJe / eSAJ", "Portal do cliente", "Suporte prioritário"] },
    { k: "Enterprise", price: null, sub: "Sob consulta", desc: "Para grandes escritórios.", featured: false, cta: "Falar com vendas",
      features: ["Membros ilimitados", "Armazenamento ilimitado", "SSO e SAML", "Auditoria avançada", "SLA contratado", "Customer success dedicado", "On-premise opcional"] },
  ];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {plans.map(p => (
          <div key={p.k} className={"card price-card" + (p.featured ? " featured" : "")}>
            {p.featured && (
              <div style={{ position: "absolute", top: -10, left: 24, background: "var(--accent)", color: "var(--accent-fg)", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recomendado</div>
            )}
            <div>
              <div className="eyebrow" style={{ fontSize: 10 }}>{p.k}</div>
              <div className="price-amount" style={{ marginTop: 12 }}>
                {p.price === null ? "Custom" : p.price === 0 ? "Grátis" : <>R$ {p.price}<span>{p.sub}</span></>}
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 8 }}>{p.desc}</div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gap: 8 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  <Icon name="check" size={14} style={{ color: p.featured ? "var(--accent)" : "var(--success)", flexShrink: 0, marginTop: 3 }} />
                  {f}
                </div>
              ))}
            </div>
            <button className={"btn " + (p.featured ? "btn-secondary" : "btn-primary") + " btn-lg"} style={{ width: "100%" }} disabled={p.featured && !onboarding}>
              {onboarding && p.featured ? "Começar com Pro" : p.cta}
            </button>
          </div>
        ))}
      </div>

      {!onboarding && (
        <div className="card" style={{ marginTop: 24, padding: 0 }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 500 }}>Comparação detalhada</div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Recurso</th>
                <th style={{ textAlign: "center" }}>Starter</th>
                <th style={{ textAlign: "center" }}>Pro</th>
                <th style={{ textAlign: "center" }}>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Membros do escritório", "1", "Até 15", "Ilimitados"],
                ["Casos ativos", "10", "Ilimitados", "Ilimitados"],
                ["Armazenamento", "5 GB", "100 GB", "Ilimitado"],
                ["Modelos com variáveis", true, true, true],
                ["Portal do cliente", false, true, true],
                ["Integração PJe / eSAJ", false, true, true],
                ["API e webhooks", false, true, true],
                ["SSO / SAML", false, false, true],
                ["Auditoria avançada", false, false, true],
                ["SLA contratado", false, false, "99,9%"],
              ].map(([label, ...vals], i) => (
                <tr key={i} style={{ cursor: "default" }}>
                  <td style={{ fontSize: 13 }}>{label}</td>
                  {vals.map((v, j) => (
                    <td key={j} style={{ textAlign: "center" }}>
                      {v === true ? <Icon name="check" size={14} style={{ color: "var(--success)" }} /> :
                       v === false ? <Icon name="x" size={14} style={{ color: "var(--fg-faint)" }} /> :
                       <span className="mono" style={{ fontSize: 12 }}>{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

window.Financeiro = Financeiro;
window.Notificacoes = Notificacoes;
window.Configuracoes = Configuracoes;
window.Perfil = Perfil;
window.EscritorioPerfil = EscritorioPerfil;
window.Planos = Planos;
window.PlanosCards = PlanosCards;
