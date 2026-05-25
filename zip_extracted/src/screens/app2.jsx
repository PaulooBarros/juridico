// App screens — Calendário, Documentos, Modelos, Equipe

// ============== CALENDÁRIO ==============
function Calendario() {
  // Static May 2026 view. 25 May 2026 is a Monday.
  // 1 May 2026 = Friday. So calendar starts on Sun 26 Apr.
  const events = {
    "2026-05-04": [["task", "Reunião · CFW"]],
    "2026-05-06": [["hearing", "Audiência · Bittencourt"]],
    "2026-05-08": [["task", "Status · Vale Itajaí"]],
    "2026-05-12": [["deadline", "Recolher custas · Salles"]],
    "2026-05-14": [["task", "Call cliente · Coop. Cerrado"]],
    "2026-05-18": [["deadline", "Resposta · Atlântico"]],
    "2026-05-22": [["hearing", "Conciliação · TechBras"], ["task", "Faturamento mensal"]],
    "2026-05-25": [["task", "Today: revisar prazos"]],
    "2026-05-27": [["deadline", "Manifestação · Vale Itajaí"], ["hearing", "Audiência · Móveis Serra"]],
    "2026-05-28": [["deadline", "Contrarrazões · TechBras"]],
    "2026-05-29": [["deadline", "Impugnação · Vale Itajaí"]],
    "2026-05-30": [["hearing", "Conciliação · Salles"]],
    "2026-06-02": [["deadline", "Resposta · Atlântico"]],
    "2026-06-04": [["deadline", "Inicial · Andrade"]],
    "2026-06-05": [["deadline", "Réplica · Vieira"]],
  };

  // Generate cells for May 2026 view
  // Sun=0 in JS, 1 May 2026 was Friday (5).
  // Cells: 26 Apr → 6 Jun (6 weeks)
  const cells = [];
  const start = new Date("2026-04-26");
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({ date: d, iso, day: d.getDate(), month: d.getMonth(), inMonth: d.getMonth() === 4, isToday: iso === "2026-05-25" });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendário</h1>
          <p className="page-sub">Maio de 2026 · 8 prazos · 4 audiências · 12 tarefas</p>
        </div>
        <div className="page-actions">
          <div style={{ display: "flex", gap: 1, border: "1px solid var(--border-strong)", borderRadius: 6, overflow: "hidden" }}>
            <button className="btn btn-ghost btn-sm" style={{ borderRadius: 0 }}>Dia</button>
            <button className="btn btn-ghost btn-sm" style={{ borderRadius: 0, borderLeft: "1px solid var(--border)" }}>Semana</button>
            <button className="btn btn-sm" style={{ borderRadius: 0, borderLeft: "1px solid var(--border)", background: "var(--fg)", color: "var(--bg)" }}>Mês</button>
          </div>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Novo evento</button>
        </div>
      </div>

      <div className="page-body" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="icon-btn"><Icon name="chevL" size={14} /></button>
              <button className="icon-btn"><Icon name="chevR" size={14} /></button>
              <div className="serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em" }}>maio · <span style={{ color: "var(--fg-subtle)" }}>2026</span></div>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--danger)" }}></span>Prazo</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent)" }}></span>Audiência</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--info)" }}></span>Tarefa</span>
            </div>
          </div>
          <div className="cal-grid">
            {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map(d => <div key={d} className="cal-head">{d}</div>)}
            {cells.map((c, i) => {
              const evs = events[c.iso] || [];
              return (
                <div key={i} className={"cal-cell" + (!c.inMonth ? " muted" : "") + (c.isToday ? " today" : "")}>
                  <div className="cal-day">{c.day}</div>
                  {evs.map(([t, label], j) => (
                    <div key={j} className={"cal-evt " + t}>{label}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card">
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 500 }}>Próximos eventos</div>
            <div style={{ padding: 4 }}>
              {[
                ["27 mai", "qua", "deadline", "Manifestação · Vale Itajaí", "expira em 2 dias"],
                ["27 mai", "qua", "hearing", "Audiência · Móveis Serra", "14:00 — 3ª VT"],
                ["28 mai", "qui", "deadline", "Contrarrazões · TechBras", "expira em 3 dias"],
                ["30 mai", "sáb", "hearing", "Conciliação · Salles", "10:30 — JEC"],
                ["02 jun", "ter", "deadline", "Resposta · Atlântico", "Marina Costa"],
                ["04 jun", "qui", "deadline", "Inicial · Andrade", "André Furtado"],
              ].map(([d, dw, t, title, sub], i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8, padding: 10, borderRadius: 4, alignItems: "center", cursor: "pointer" }}>
                  <div style={{ textAlign: "center" }}>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{d.split(" ")[0]}</div>
                    <div style={{ fontSize: 9, color: "var(--fg-subtle)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{d.split(" ")[1]} · {dw}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                      <span className={"dot " + (t === "deadline" ? "danger" : t === "hearing" ? "accent" : "info")}></span>{title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============== DOCUMENTOS ==============
function Documentos() {
  const { go } = useRoute();
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("todos");
  const items = window.MOCK.DOCUMENTOS.filter(d => {
    if (tipo !== "todos" && d.tipo !== tipo) return false;
    if (search && !d.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Documentos</h1>
          <p className="page-sub">20 documentos · 84 MB · busca por conteúdo disponível</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="folder" size={13} /> Nova pasta</button>
          <button className="btn btn-primary"><Icon name="upload" size={13} /> Subir documento</button>
        </div>
      </div>

      <div className="page-body" style={{ padding: 0 }}>
        <div className="card" style={{ borderRadius: 0, border: "none", borderBottom: "1px solid var(--border)" }}>
          <div className="toolbar">
            <div className="search">
              <Icon name="search" size={13} style={{ color: "var(--fg-subtle)" }} />
              <input placeholder="Buscar por nome ou conteúdo..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select" style={{ maxWidth: 140 }} value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="todos">Todos os tipos</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="EML">E-mail</option>
            </select>
            <div style={{ flex: 1 }}></div>
            <button className="btn btn-ghost btn-sm"><Icon name="filter" size={12} /> Filtros</button>
            <span style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>{items.length} arquivos</span>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Caso vinculado</th>
                <th>Autor</th>
                <th>Atualizado</th>
                <th>Versão</th>
                <th className="num">Tamanho</th>
              </tr>
            </thead>
            <tbody>
              {items.map(d => (
                <tr key={d.id} onClick={() => go(`/documentos/${d.id}`)}>
                  <td><Icon name="file" size={15} style={{ color: "var(--fg-muted)" }} /></td>
                  <td><div style={{ fontSize: 13, fontWeight: 500 }}>{d.nome}</div></td>
                  <td><span className="tag">{d.tipo}</span></td>
                  <td style={{ fontSize: 12, color: "var(--fg-muted)" }}>{d.casoNome}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <div className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{d.autor.split(" ").map(s => s[0]).slice(0, 2).join("")}</div>
                      {d.autor}
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{d.data}</td>
                  <td className="mono" style={{ fontSize: 12 }}>v{d.versao}</td>
                  <td className="num" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{d.tamanho}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ============== DOCUMENTO — DETALHE ==============
function DocumentoDetalhe({ id }) {
  const { go } = useRoute();
  const d = findDoc(id) || window.MOCK.DOCUMENTOS[0];

  return (
    <>
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
            <span className="tag">{d.tipo}</span>
            <span className="tag accent">v{d.versao}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{d.id}</span>
          </div>
          <h1 className="page-title">{d.nome}</h1>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "var(--fg-muted)" }}>
            <span><Icon name="briefcase" size={12} /> {d.casoNome}</span>
            <span><Icon name="user" size={12} /> {d.autor}</span>
            <span><Icon name="clock" size={12} /> {d.data}</span>
            <span><Icon name="archive" size={12} /> {d.tamanho}</span>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="download" size={13} /> Baixar</button>
          <button className="btn btn-secondary"><Icon name="copy" size={13} /> Nova versão</button>
          <button className="btn btn-primary"><Icon name="send" size={13} /> Compartilhar</button>
        </div>
      </div>

      <div className="page-body" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div className="doc-preview">
          <h2>Manifestação sobre laudo pericial</h2>
          <p><strong>EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 12ª VARA DO TRABALHO DA COMARCA DO RIO DE JANEIRO</strong></p>
          <p style={{ textIndent: 0, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-subtle)", textAlign: "right" }}>
            Processo nº 0008142-29.2024.8.19.0001
          </p>
          <p><strong>CONSTRUTORA MARÍTIMA ATLÂNTICO LTDA.</strong>, já qualificada nos autos do processo em epígrafe, por intermédio de seus procuradores que esta subscrevem, vem, respeitosamente, à presença de Vossa Excelência, em atenção ao despacho de fls. retro, apresentar sua MANIFESTAÇÃO SOBRE O LAUDO PERICIAL acostado às fls. ___, pelos fatos e fundamentos de direito a seguir expostos.</p>
          <p>I. DA CONCLUSÃO PERICIAL — O laudo pericial elaborado pelo i. Perito Judicial concluiu, em síntese, pela existência parcial de horas extras não pagas no período compreendido entre janeiro de 2022 e março de 2024, no valor total de R$ 184.000,00 (cento e oitenta e quatro mil reais), conforme se observa às fls. 84-86 do laudo apresentado.</p>
          <p>II. DA IMPUGNAÇÃO PARCIAL — A despeito do esforço técnico do i. Perito, a Manifestante entende que algumas premissas adotadas merecem reparo, especialmente no que tange ao cálculo do divisor aplicado e ao reflexo das horas extras no DSR, conforme passa a demonstrar.</p>
          <p style={{ color: "var(--fg-subtle)", fontStyle: "italic" }}>[continua nas próximas 18 páginas...]</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ padding: 14, borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 500 }}>Metadados</div>
            <div style={{ padding: 14, display: "grid", gap: 10, fontSize: 12 }}>
              <div><div className="eyebrow" style={{ fontSize: 9 }}>Vinculado a</div><a style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => go(`/casos/${d.caso}`)}>{d.casoNome}</a></div>
              <div><div className="eyebrow" style={{ fontSize: 9 }}>Cliente</div>Construtora Marítima Atlântico</div>
              <div><div className="eyebrow" style={{ fontSize: 9 }}>Criado por</div>{d.autor}</div>
              <div><div className="eyebrow" style={{ fontSize: 9 }}>Última edição</div><span className="mono">{d.data}</span></div>
              <div><div className="eyebrow" style={{ fontSize: 9 }}>Visibilidade</div>Equipe do escritório · 5 pessoas</div>
            </div>
          </div>

          <div className="card">
            <div style={{ padding: 14, borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 500 }}>Versões</div>
            <div>
              {[
                ["v4", "Atual", d.data, d.autor],
                ["v3", "", "2026-05-02", "Marina Costa"],
                ["v2", "", "2026-04-28", "Júlia Werneck"],
                ["v1", "Original", "2024-02-11", d.autor],
              ].map(([v, tag, date, who], i) => (
                <div key={v} style={{ padding: "10px 14px", borderBottom: i < 3 ? "1px solid var(--border)" : "none", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><span className="mono">{v}</span> {tag && <span className="tag accent">{tag}</span>}</div>
                    <div style={{ fontSize: 10, color: "var(--fg-subtle)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{date} · {who}</div>
                  </div>
                  <Icon name="moreH" size={13} style={{ color: "var(--fg-subtle)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============== MODELOS ==============
function Modelos() {
  const items = window.MOCK.MODELOS;
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Modelos</h1>
          <p className="page-sub">{items.length} modelos · variáveis automáticas a partir do caso</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="upload" size={13} /> Importar .docx</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Novo modelo</button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {items.map(m => (
            <div key={m.id} className="card" style={{ padding: 0, cursor: "pointer", overflow: "hidden" }}>
              <div className="placeholder-img" style={{ height: 140, borderRadius: 0, border: "none", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: 16, alignItems: "stretch" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, opacity: 0.7 }}>
                  <div style={{ height: 8, background: "var(--fg-faint)", width: "70%", borderRadius: 2 }}></div>
                  <div style={{ height: 4, background: "var(--fg-faint)", width: "100%", borderRadius: 2, opacity: 0.5 }}></div>
                  <div style={{ height: 4, background: "var(--fg-faint)", width: "90%", borderRadius: 2, opacity: 0.5 }}></div>
                  <div style={{ height: 4, background: "var(--fg-faint)", width: "95%", borderRadius: 2, opacity: 0.5 }}></div>
                  <div style={{ height: 4, background: "var(--fg-faint)", width: "85%", borderRadius: 2, opacity: 0.5 }}></div>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span className="tag">{m.area}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)" }}>{m.usos} usos</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{m.nome}</div>
                <div style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>{m.autor} · {m.atualizado}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============== EQUIPE ==============
function Equipe() {
  const items = window.MOCK.EQUIPE;
  const ROLES = { owner: ["danger", "Titular"], admin: ["accent", "Admin"], lawyer: ["info", "Advogado"], assistant: ["", "Assistente"] };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipe</h1>
          <p className="page-sub">5 membros · 1 convite pendente · plano Pro permite até 15</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="shield" size={13} /> Permissões</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> Convidar membro</button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
          {[["Membros ativos", "4"], ["Convites pendentes", "1"], ["Casos por advogado (média)", "6,5"], ["Última entrada", "agora"]].map(([l, v], i) => (
            <div key={i} className="metric" style={{ borderRight: i < 3 ? "1px solid var(--border)" : "none", background: "var(--bg-card)" }}>
              <div className="metric-label">{l}</div>
              <div className="metric-value" style={{ fontSize: 24 }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Membro</th>
                <th>E-mail</th>
                <th>OAB</th>
                <th>Função</th>
                <th>Casos atribuídos</th>
                <th>Status</th>
                <th>Último acesso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => {
                const [rc, rl] = ROLES[u.role];
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar">{u.iniciais}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{u.nome}</div>
                          <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{u.roleNome}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--fg-muted)" }}>{u.email}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{u.oab}</td>
                    <td><span className={"tag " + rc}>{rl}</span></td>
                    <td className="num">{u.casos}</td>
                    <td>
                      <span className="status">
                        <span className={"dot " + (u.status === "ativo" ? "success" : "warning")}></span>
                        {u.status === "ativo" ? "Ativo" : "Convidado"}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{u.ultimoLogin}</td>
                    <td><button className="icon-btn" style={{ width: 24, height: 24 }}><Icon name="moreH" size={13} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ marginTop: 20, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Matriz de permissões</div>
          <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16 }}>O que cada função pode fazer no Vetor Jurídico.</div>
          <table className="tbl" style={{ borderTop: "1px solid var(--border)" }}>
            <thead>
              <tr>
                <th style={{ background: "transparent" }}>Permissão</th>
                <th style={{ background: "transparent", textAlign: "center" }}>Titular</th>
                <th style={{ background: "transparent", textAlign: "center" }}>Admin</th>
                <th style={{ background: "transparent", textAlign: "center" }}>Advogado</th>
                <th style={{ background: "transparent", textAlign: "center" }}>Assistente</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Ver todos os casos", true, true, false, false, "Apenas atribuídos"],
                ["Criar e editar casos", true, true, true, false],
                ["Gerenciar equipe", true, true, false, false],
                ["Ver financeiro", true, true, false, false],
                ["Gerar petições e documentos", true, true, true, true],
                ["Excluir registros", true, true, false, false],
                ["Configurar plano e cobrança", true, false, false, false],
              ].map(([perm, a, b, c, d, note], i) => (
                <tr key={i} style={{ cursor: "default" }}>
                  <td style={{ fontSize: 13 }}>{perm}</td>
                  {[a, b, c, d].map((v, j) => (
                    <td key={j} style={{ textAlign: "center" }}>
                      {v ? <Icon name="check" size={14} style={{ color: "var(--success)" }} /> : <Icon name="x" size={14} style={{ color: "var(--fg-faint)" }} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

window.Calendario = Calendario;
window.Documentos = Documentos;
window.DocumentoDetalhe = DocumentoDetalhe;
window.Modelos = Modelos;
window.Equipe = Equipe;
