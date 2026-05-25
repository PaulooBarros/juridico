// App screens — Dashboard, Clientes (lista + detalhe), Casos (lista + detalhe)

// ============== DASHBOARD ==============
function Dashboard() {
  const { go } = useRoute();
  const prazos = window.MOCK.PRAZOS.slice(0, 5);
  const casos = window.MOCK.CASOS.filter(c => c.status === "ativo").slice(0, 6);
  const notif = window.MOCK.NOTIFICACOES.filter(n => !n.lida);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bom dia, Marina.</h1>
          <p className="page-sub">Segunda, 25 de maio · 12 casos ativos · 8 prazos nos próximos 7 dias.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="upload" size={13} /> Importar</button>
          <button className="btn btn-primary" onClick={() => go("/casos")}><Icon name="plus" size={13} /> Novo caso</button>
        </div>
      </div>

      <div className="page-body">
        {/* Critical alert */}
        <div style={{ display: "flex", gap: 12, padding: "12px 14px", background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: 8, marginBottom: 20 }}>
          <Icon name="alert" size={18} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--danger)" }}>2 prazos críticos em 48h</div>
            <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
              Manifestação sobre laudo pericial (Vale Itajaí) e audiência de instrução (Móveis Serra Gaúcha). Nenhum tem peça pronta.
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>Revisar agora</button>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
          {[
            ["Casos ativos", "14", "+2", "up", "vs. abril"],
            ["Prazos nos próximos 7 dias", "8", "2 críticos", "down", "exigem ação hoje"],
            ["Clientes ativos", "10", "+1", "up", "este mês"],
            ["A receber este mês", "R$ 134k", "R$ 50k em atraso", "down", "3 cobranças em curso"],
          ].map(([l, v, t, dir, sub], i) => (
            <div key={i} className="metric" style={{ borderRight: i < 3 ? "1px solid var(--border)" : "none", background: "var(--bg-card)" }}>
              <div className="metric-label">{l}</div>
              <div className="metric-value">{v}</div>
              <div className={"metric-trend " + dir}>
                <Icon name={dir === "up" ? "trend" : "alert"} size={11} /> {t}
              </div>
              <div style={{ fontSize: 10, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", marginTop: 1 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          {/* Prazos */}
          <div className="card">
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Prazos urgentes</div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 1 }}>Próximos 7 dias · ordenados por criticidade</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => go("/calendario")}>Ver todos <Icon name="arrowR" size={11} /></button>
            </div>
            <div>
              {prazos.map(p => {
                const isCrit = p.criticidade === "critico";
                return (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer" }}>
                    <div style={{ width: 48, textAlign: "center" }}>
                      <div className="mono" style={{ fontSize: 22, fontWeight: 600, color: isCrit ? "var(--danger)" : p.criticidade === "alto" ? "var(--warning)" : "var(--fg)" }}>{p.diasRestantes}</div>
                      <div style={{ fontSize: 9, color: "var(--fg-subtle)", textTransform: "uppercase", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{p.diasRestantes === 1 ? "dia" : "dias"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.titulo}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>{p.casoNome}</div>
                    </div>
                    <span className={"tag " + (isCrit ? "danger" : p.criticidade === "alto" ? "warning" : "")}>{p.tipo}</span>
                    <div className="avatar" style={{ width: 22, height: 22, fontSize: 9 }} title={p.responsavel}>{p.responsavel.match(/[A-Z]/g)?.slice(0, 2).join("")}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Atividade */}
          <div className="card">
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Atividade recente</div>
              <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 1 }}>O que aconteceu nos últimos dias</div>
            </div>
            <div style={{ padding: "16px 18px" }}>
              <div className="timeline">
                {[
                  ["accent", "Júlia Werneck", "anexou Plano de recuperação v4 ao caso Atlântico", "há 3 h"],
                  ["success", "Sistema (PJe)", "registrou decisão liminar favorável em TechBras / PI", "há 6 h"],
                  ["", "André Furtado", "concluiu Petição inicial · Helena Andrade", "ontem"],
                  ["danger", "Sistema", "marcou prazo crítico em Vale Itajaí (laudo pericial)", "ontem"],
                  ["", "Camila Reis", "aceitou convite e entrou na equipe", "2 dias atrás"],
                  ["", "Marina Costa", "criou caso · Coop. Cerrado Norte (ambiental)", "3 dias atrás"],
                ].map(([c, who, what, when], i) => (
                  <div key={i} className={"tl-item" + (c ? " " + c : "")}>
                    <div className="tl-meta">{when}</div>
                    <div className="tl-title"><strong>{who}</strong> <span style={{ fontWeight: 400, color: "var(--fg-muted)" }}>{what}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Casos recentes */}
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Casos com movimentação recente</div>
              <div style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 1 }}>Ordenados por última atividade</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => go("/casos")}>Todos os casos <Icon name="arrowR" size={11} /></button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Caso</th>
                <th>Cliente</th>
                <th>Área</th>
                <th>Fase</th>
                <th>Responsável</th>
                <th>Próximo prazo</th>
              </tr>
            </thead>
            <tbody>
              {casos.map(c => (
                <tr key={c.id} onClick={() => go(`/casos/${c.id}`)}>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.tipo}</div>
                    <div className="id" style={{ fontSize: 11, marginTop: 1 }}>{c.numero}</div>
                  </td>
                  <td><div style={{ fontSize: 13 }}>{c.clienteNome}</div></td>
                  <td><span className="tag">{c.area}</span></td>
                  <td><span className="status"><span className="dot accent"></span>{c.fase}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <div className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{c.responsavel.split(" ").map(s => s[0]).slice(0, 2).join("")}</div>
                      {c.responsavel.replace("Dra. ", "").replace("Dr. ", "")}
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{c.prazo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ============== CLIENTES ==============
function Clientes() {
  const { go } = useRoute();
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("todos");
  const items = window.MOCK.CLIENTES.filter(c => {
    if (tipo !== "todos" && c.tipo !== tipo) return false;
    if (search && !(c.nome.toLowerCase().includes(search.toLowerCase()) || c.doc.includes(search))) return false;
    return true;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-sub">10 clientes ativos · 9 com casos em curso</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="upload" size={13} /> Importar CSV</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Novo cliente</button>
        </div>
      </div>

      <div className="page-body" style={{ padding: 0 }}>
        <div className="card" style={{ borderRadius: 0, border: "none", borderBottom: "1px solid var(--border)" }}>
          <div className="toolbar">
            <div className="search">
              <Icon name="search" size={13} style={{ color: "var(--fg-subtle)" }} />
              <input placeholder="Buscar por nome, CPF/CNPJ..." value={search} onChange={e => setSearch(e.target.value)} />
              <span className="kbd">⌘K</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[["todos", "Todos"], ["PF", "Pessoa Física"], ["PJ", "Pessoa Jurídica"]].map(([k, l]) => (
                <button key={k} className={"btn btn-sm " + (tipo === k ? "btn-secondary" : "btn-ghost")} onClick={() => setTipo(k)}>{l}</button>
              ))}
            </div>
            <div style={{ flex: 1 }}></div>
            <button className="btn btn-ghost btn-sm"><Icon name="filter" size={12} /> Filtros</button>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={12} /> Exportar</button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>CPF / CNPJ</th>
                <th>Localização</th>
                <th>Casos ativos</th>
                <th>Cliente desde</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} onClick={() => go(`/clientes/${c.id}`)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar" style={{ background: c.tipo === "PJ" ? "var(--fg)" : "var(--accent)", color: c.tipo === "PJ" ? "var(--bg)" : "var(--accent-fg)" }}>
                        {c.nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{c.nome}</div>
                        <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag">{c.tipo}</span></td>
                  <td className="id">{c.doc}</td>
                  <td style={{ fontSize: 12, color: "var(--fg-muted)" }}>{c.cidade}</td>
                  <td className="num">{c.casosAtivos}</td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{c.desde}</td>
                  <td>
                    <span className="status">
                      <span className={"dot " + (c.status === "ativo" ? "success" : "")}></span>
                      {c.status === "ativo" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ============== CLIENTE — DETALHE ==============
function ClienteDetalhe({ id }) {
  const { go } = useRoute();
  const c = findClient(id) || window.MOCK.CLIENTES[0];
  const casos = window.MOCK.CASOS.filter(x => x.clienteId === c.id);
  const docs = window.MOCK.DOCUMENTOS.filter(d => casos.some(k => k.id === d.caso)).slice(0, 6);
  const [tab, setTab] = useState("visao");

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div className="avatar lg" style={{ background: c.tipo === "PJ" ? "var(--fg)" : "var(--accent)", color: c.tipo === "PJ" ? "var(--bg)" : "var(--accent-fg)" }}>
            {c.nome.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span className="tag">{c.tipo}</span>
              <span className="tag success">Ativo</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{c.id}</span>
            </div>
            <h1 className="page-title">{c.nome}</h1>
            <div style={{ display: "flex", gap: 20, marginTop: 8, fontSize: 12, color: "var(--fg-muted)" }}>
              <span><Icon name="mail" size={12} /> {c.email}</span>
              <span><Icon name="phone" size={12} /> {c.tel}</span>
              <span><Icon name="pin" size={12} /> {c.cidade}</span>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="edit" size={13} /> Editar</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Novo caso</button>
          <button className="icon-btn"><Icon name="moreH" size={15} /></button>
        </div>
      </div>

      <div className="tabs">
        {[["visao", "Visão geral"], ["casos", `Casos (${casos.length})`], ["docs", "Documentos"], ["hist", "Atividade"]].map(([k, l]) => (
          <div key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      <div className="page-body">
        {tab === "visao" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
            <div className="card">
              <div style={{ padding: 16, borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 500 }}>Cadastro</div>
              <div style={{ padding: 16, display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 12, columnGap: 16, fontSize: 13 }}>
                <div className="eyebrow" style={{ fontSize: 10 }}>Razão social</div><div>{c.nome}</div>
                <div className="eyebrow" style={{ fontSize: 10 }}>{c.tipo === "PJ" ? "CNPJ" : "CPF"}</div><div className="mono">{c.doc}</div>
                <div className="eyebrow" style={{ fontSize: 10 }}>E-mail</div><div>{c.email}</div>
                <div className="eyebrow" style={{ fontSize: 10 }}>Telefone</div><div className="mono">{c.tel}</div>
                <div className="eyebrow" style={{ fontSize: 10 }}>Cidade / UF</div><div>{c.cidade}</div>
                <div className="eyebrow" style={{ fontSize: 10 }}>Cliente desde</div><div className="mono">{c.desde}</div>
                <div className="eyebrow" style={{ fontSize: 10 }}>Responsável</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>MC</div>
                  Marina Costa
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: 16, borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 500 }}>Resumo financeiro</div>
              <div style={{ padding: 16, display: "grid", gap: 12 }}>
                {[
                  ["Recebido (12 meses)", "R$ 184.000,00", "success"],
                  ["A receber", "R$ 32.000,00", "warning"],
                  ["Em atraso", "—", ""],
                  ["Total acumulado", "R$ 412.500,00", ""],
                ].map(([l, v, c2], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: i < 3 ? "1px solid var(--border)" : "none", fontSize: 13 }}>
                    <span style={{ color: "var(--fg-muted)" }}>{l}</span>
                    <span className="mono" style={{ color: c2 === "success" ? "var(--success)" : c2 === "warning" ? "var(--warning)" : "var(--fg)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "casos" && (
          <div className="card">
            <table className="tbl">
              <thead>
                <tr><th>Caso</th><th>Área</th><th>Fase</th><th>Responsável</th><th>Próximo prazo</th><th className="num">Valor da causa</th></tr>
              </thead>
              <tbody>
                {casos.map(k => (
                  <tr key={k.id} onClick={() => go(`/casos/${k.id}`)}>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{k.tipo}</div>
                      <div className="id">{k.numero}</div>
                    </td>
                    <td><span className="tag">{k.area}</span></td>
                    <td><span className="status"><span className="dot accent"></span>{k.fase}</span></td>
                    <td style={{ fontSize: 12, color: "var(--fg-muted)" }}>{k.responsavel}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{k.prazo || "—"}</td>
                    <td className="num">{k.valor ? brl(k.valor) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "docs" && (
          <div className="card">
            <table className="tbl">
              <thead><tr><th>Nome</th><th>Tipo</th><th>Caso</th><th>Autor</th><th>Atualizado</th><th>Tamanho</th></tr></thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id} onClick={() => go(`/documentos/${d.id}`)}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="file" size={14} style={{ color: "var(--fg-muted)" }} />{d.nome}</div></td>
                    <td><span className="tag">{d.tipo}</span></td>
                    <td style={{ fontSize: 12, color: "var(--fg-muted)" }}>{d.casoNome}</td>
                    <td style={{ fontSize: 12 }}>{d.autor}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{d.data}</td>
                    <td className="num" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{d.tamanho}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "hist" && (
          <div className="card" style={{ padding: 24 }}>
            <div className="timeline">
              {[
                ["accent", "Marina Costa", "atualizou status do caso · Trabalhista", "há 2 dias"],
                ["", "Júlia Werneck", "anexou contestação", "há 5 dias"],
                ["success", "Sistema", "registrou pagamento de R$ 32.000,00", "há 8 dias"],
                ["", "Cliente", "enviou documentação adicional via portal", "há 12 dias"],
                ["", "Marina Costa", "abriu caso · Cível Recuperação", "há 1 mês"],
              ].map(([c2, who, what, when], i) => (
                <div key={i} className={"tl-item" + (c2 ? " " + c2 : "")}>
                  <div className="tl-meta">{when}</div>
                  <div className="tl-title"><strong>{who}</strong> <span style={{ fontWeight: 400, color: "var(--fg-muted)" }}>{what}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ============== CASOS ==============
function Casos() {
  const { go } = useRoute();
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("todas");
  const [status, setStatus] = useState("ativo");

  const items = window.MOCK.CASOS.filter(c => {
    if (status !== "todos" && c.status !== status) return false;
    if (area !== "todas" && c.area !== area) return false;
    if (search && !(c.numero.includes(search) || c.clienteNome.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const areas = ["Trabalho", "Cível", "Tributário", "Família", "Empresarial", "Consumidor", "Agrário", "Ambiental"];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Casos</h1>
          <p className="page-sub">14 casos ativos · 1 encerrado este mês</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="filter" size={13} /> Visualização</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Novo caso</button>
        </div>
      </div>

      <div className="page-body" style={{ padding: 0 }}>
        <div className="card" style={{ borderRadius: 0, border: "none", borderBottom: "1px solid var(--border)" }}>
          <div className="toolbar">
            <div className="search">
              <Icon name="search" size={13} style={{ color: "var(--fg-subtle)" }} />
              <input placeholder="Buscar por número ou cliente..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select" style={{ maxWidth: 160 }} value={area} onChange={e => setArea(e.target.value)}>
              <option value="todas">Todas as áreas</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <div style={{ display: "flex", gap: 4 }}>
              {[["ativo", "Ativos"], ["encerrado", "Encerrados"], ["todos", "Todos"]].map(([k, l]) => (
                <button key={k} className={"btn btn-sm " + (status === k ? "btn-secondary" : "btn-ghost")} onClick={() => setStatus(k)}>{l}</button>
              ))}
            </div>
            <div style={{ flex: 1 }}></div>
            <span style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>{items.length} resultados</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Número CNJ</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Fase</th>
                <th>Responsável</th>
                <th>Próximo prazo</th>
                <th className="num">Valor da causa</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} onClick={() => go(`/casos/${c.id}`)}>
                  <td>
                    <div className="mono" style={{ fontSize: 12 }}>{c.numero}</div>
                    <div style={{ fontSize: 10, color: "var(--fg-subtle)", marginTop: 2, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.id}</div>
                  </td>
                  <td><div style={{ fontSize: 13, fontWeight: 500 }}>{c.clienteNome}</div></td>
                  <td style={{ fontSize: 12, color: "var(--fg-muted)" }}>{c.tipo}</td>
                  <td><span className="status"><span className="dot accent"></span>{c.fase}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <div className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{c.responsavel.split(" ").map(s => s[0]).slice(0, 2).join("")}</div>
                      {c.responsavel.replace("Dra. ", "").replace("Dr. ", "")}
                    </div>
                  </td>
                  <td>
                    {c.prazo ? (() => {
                      const days = Math.ceil((new Date(c.prazo) - new Date("2026-05-25")) / 86400000);
                      const isCrit = days >= 0 && days <= 3;
                      return (
                        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: isCrit ? "var(--danger)" : "var(--fg-muted)", fontWeight: isCrit ? 600 : 400 }}>
                          {c.prazo} {isCrit && `(${days}d)`}
                        </span>
                      );
                    })() : <span style={{ color: "var(--fg-faint)" }}>—</span>}
                  </td>
                  <td className="num">{c.valor ? brl(c.valor) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ============== CASO — DETALHE ==============
function CasoDetalhe({ id }) {
  const { go } = useRoute();
  const c = findCase(id) || window.MOCK.CASOS[0];
  const [tab, setTab] = useState("visao");
  const docs = window.MOCK.DOCUMENTOS.filter(d => d.caso === c.id);
  const prazos = window.MOCK.PRAZOS.filter(p => p.caso === c.id);

  return (
    <>
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
            <span className="tag accent">{c.area}</span>
            <span className="tag">{c.status === "ativo" ? "Ativo" : "Encerrado"}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{c.id}</span>
            <span style={{ color: "var(--fg-faint)" }}>·</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{c.numero}</span>
          </div>
          <h1 className="page-title">{c.tipo}</h1>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "var(--fg-muted)", flexWrap: "wrap" }}>
            <span><Icon name="user" size={12} /> <a style={{ color: "var(--accent)" }} onClick={() => go(`/clientes/${c.clienteId}`)}>{c.clienteNome}</a></span>
            <span><Icon name="building" size={12} /> {c.vara}</span>
            <span><Icon name="clock" size={12} /> Aberto em {c.criadoEm}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="paperclip" size={13} /> Anexar</button>
          <button className="btn btn-secondary"><Icon name="edit" size={13} /> Editar</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Nova movimentação</button>
        </div>
      </div>

      <div className="tabs">
        {[["visao", "Visão geral"], ["timeline", "Timeline"], ["prazos", `Prazos (${prazos.length})`], ["docs", `Documentos (${docs.length})`], ["hist", "Histórico"]].map(([k, l]) => (
          <div key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      <div className="page-body">
        {tab === "visao" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card">
                <div style={{ padding: 16, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Resumo do caso</div>
                  <div className="status"><span className="dot accent"></span>{c.fase}</div>
                </div>
                <div style={{ padding: 16, display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 12, columnGap: 16, fontSize: 13 }}>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Número CNJ</div><div className="mono">{c.numero}</div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Vara / Foro</div><div>{c.vara}</div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Tipo</div><div>{c.tipo}</div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Fase atual</div><div>{c.fase}</div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Cliente</div><div><a style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => go(`/clientes/${c.clienteId}`)}>{c.clienteNome}</a></div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Responsável</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>{c.responsavel.split(" ").map(s => s[0]).slice(0, 2).join("")}</div>
                    {c.responsavel}
                  </div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Valor da causa</div><div className="mono">{c.valor ? brl(c.valor) : "—"}</div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Aberto em</div><div className="mono">{c.criadoEm}</div>
                </div>
              </div>

              <div className="card">
                <div style={{ padding: 16, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Documentos vinculados</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab("docs")}>Ver todos ({docs.length})</button>
                </div>
                <div>
                  {docs.slice(0, 4).map(d => (
                    <div key={d.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer" }} onClick={() => go(`/documentos/${d.id}`)}>
                      <Icon name="file" size={16} style={{ color: "var(--fg-muted)" }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{d.nome}</div>
                        <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>{d.tipo} · v{d.versao} · {d.tamanho}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>{d.data}</div>
                      <Icon name="chevR" size={12} style={{ color: "var(--fg-subtle)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card">
                <div style={{ padding: 16, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Próximos prazos</div>
                  <button className="btn btn-ghost btn-sm">+ Prazo</button>
                </div>
                <div>
                  {prazos.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: "var(--fg-subtle)" }}>Nenhum prazo cadastrado para este caso.</div>
                  ) : prazos.map(p => (
                    <div key={p.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{p.titulo}</div>
                        <span className={"tag " + (p.criticidade === "critico" ? "danger" : p.criticidade === "alto" ? "warning" : "")}>
                          {p.diasRestantes}d
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{p.data} · {p.responsavel}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div style={{ padding: 16, borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 500 }}>Partes envolvidas</div>
                <div style={{ padding: 16, display: "grid", gap: 12, fontSize: 13 }}>
                  <div>
                    <div className="eyebrow" style={{ fontSize: 10 }}>Autor</div>
                    <div style={{ marginTop: 4 }}>{c.clienteNome}</div>
                  </div>
                  <div>
                    <div className="eyebrow" style={{ fontSize: 10 }}>Réu</div>
                    <div style={{ marginTop: 4 }}>Parte contrária (sigiloso)</div>
                  </div>
                  <div>
                    <div className="eyebrow" style={{ fontSize: 10 }}>Equipe interna</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: 9 }}>MC</div>
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: 9 }}>JW</div>
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: 9, background: "var(--bg-elev)", color: "var(--fg-subtle)", border: "1px dashed var(--border-strong)" }}>+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "timeline" && (
          <div className="card" style={{ padding: 24 }}>
            <div className="timeline">
              {[
                ["accent", "26 mai 2026 · 14:30", "Marina Costa", "Manifestação protocolada", "Manifestação sobre laudo pericial em 22 páginas anexada ao processo eletrônico. Aguarda análise do juízo."],
                ["", "20 mai 2026 · 09:12", "Sistema (PJe)", "Intimação recebida", "Determinada manifestação sobre laudo pericial em 15 dias. Prazo até 02/06."],
                ["", "12 mai 2026 · 16:45", "Perito Judicial", "Laudo pericial juntado", "Laudo de 84 páginas. Conclusão: parcialmente favorável."],
                ["success", "08 mai 2026 · 10:20", "Marina Costa", "Pagamento confirmado", "Honorário fase instrutória — R$ 32.000,00 — recebido."],
                ["", "22 abr 2026 · 11:00", "Júlia Werneck", "Audiência designada", "Audiência de instrução marcada para 27 de maio às 14h00, 12ª Vara."],
                ["", "14 fev 2024 · 09:00", "Marina Costa", "Caso aberto", "Petição inicial protocolada. Distribuição para 12ª Vara do Trabalho — Rio de Janeiro."],
              ].map(([cl, when, who, t, body], i) => (
                <div key={i} className={"tl-item" + (cl ? " " + cl : "")}>
                  <div className="tl-meta">{when}</div>
                  <div className="tl-title">{who} · {t}</div>
                  <div className="tl-body">{body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "prazos" && (
          <div className="card">
            <table className="tbl">
              <thead><tr><th>Prazo</th><th>Tipo</th><th>Data</th><th>Dias restantes</th><th>Responsável</th><th>Status</th></tr></thead>
              <tbody>
                {prazos.map(p => (
                  <tr key={p.id}>
                    <td><div style={{ fontSize: 13, fontWeight: 500 }}>{p.titulo}</div></td>
                    <td><span className="tag">{p.tipo}</span></td>
                    <td className="mono">{p.data}</td>
                    <td>
                      <span style={{ color: p.criticidade === "critico" ? "var(--danger)" : p.criticidade === "alto" ? "var(--warning)" : "var(--fg)", fontWeight: 500, fontFamily: "var(--font-mono)" }}>
                        {p.diasRestantes} dias
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{p.responsavel}</td>
                    <td><span className={"tag " + (p.criticidade === "critico" ? "danger" : p.criticidade === "alto" ? "warning" : "")}>{p.criticidade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "docs" && (
          <div className="card">
            <table className="tbl">
              <thead><tr><th>Nome</th><th>Tipo</th><th>Versão</th><th>Autor</th><th>Atualizado</th><th>Tamanho</th></tr></thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id} onClick={() => go(`/documentos/${d.id}`)}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="file" size={14} style={{ color: "var(--fg-muted)" }} />{d.nome}</div></td>
                    <td><span className="tag">{d.tipo}</span></td>
                    <td className="mono">v{d.versao}</td>
                    <td style={{ fontSize: 12 }}>{d.autor}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{d.data}</td>
                    <td className="num" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{d.tamanho}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "hist" && (
          <div className="card" style={{ padding: 24 }}>
            <div className="timeline">
              {[
                ["Marina Costa", "alterou o responsável de Júlia Werneck para Marina Costa", "há 2 dias"],
                ["Sistema", "registrou nova movimentação no PJe", "há 4 dias"],
                ["Júlia Werneck", "comentou na timeline", "há 1 semana"],
                ["Marina Costa", "anexou laudo pericial v1", "há 2 semanas"],
              ].map(([who, what, when], i) => (
                <div key={i} className="tl-item">
                  <div className="tl-meta">{when}</div>
                  <div className="tl-title"><strong>{who}</strong> <span style={{ fontWeight: 400, color: "var(--fg-muted)" }}>{what}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

window.Dashboard = Dashboard;
window.Clientes = Clientes;
window.ClienteDetalhe = ClienteDetalhe;
window.Casos = Casos;
window.CasoDetalhe = CasoDetalhe;
