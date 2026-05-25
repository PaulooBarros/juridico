// Vetor Jurídico — App shell: router, theme, sidebar, topbar.

const { useState, useEffect, useMemo, useRef, createContext, useContext } = React;

// ----- Router (in-memory) -----
const RouteCtx = createContext({ path: "/dashboard", go: () => {} });
function useRoute() { return useContext(RouteCtx); }

function RouterProvider({ children, initial = "/dashboard" }) {
  const [path, setPath] = useState(() => {
    return localStorage.getItem("vj.route") || initial;
  });
  const go = (p) => {
    setPath(p);
    localStorage.setItem("vj.route", p);
    // Reset scroll on nav
    requestAnimationFrame(() => {
      const el = document.querySelector(".page");
      if (el) el.scrollTop = 0;
    });
  };
  return <RouteCtx.Provider value={{ path, go }}>{children}</RouteCtx.Provider>;
}

// ----- Theme -----
const ThemeCtx = createContext({ theme: "light", setTheme: () => {} });
function useTheme() { return useContext(ThemeCtx); }

function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem("vj.theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("vj.theme", theme);
  }, [theme]);
  return <ThemeCtx.Provider value={{ theme, setTheme: setThemeState }}>{children}</ThemeCtx.Provider>;
}

// ----- Sidebar nav definition -----
const NAV = [
  { section: "Operação" },
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/casos", label: "Casos", icon: "briefcase", meta: "12" },
  { path: "/clientes", label: "Clientes", icon: "users" },
  { path: "/calendario", label: "Calendário", icon: "calendar" },
  { path: "/notificacoes", label: "Notificações", icon: "bell", meta: "3" },

  { section: "Conteúdo" },
  { path: "/documentos", label: "Documentos", icon: "file" },
  { path: "/modelos", label: "Modelos", icon: "template" },

  { section: "Escritório" },
  { path: "/equipe", label: "Equipe", icon: "users" },
  { path: "/financeiro", label: "Financeiro", icon: "wallet" },
  { path: "/escritorio", label: "Perfil do escritório", icon: "building" },
  { path: "/planos", label: "Plano", icon: "card" },
  { path: "/configuracoes", label: "Configurações", icon: "cog" },
];

function Sidebar({ collapsed, setCollapsed }) {
  const { path, go } = useRoute();
  const matches = (p) => path === p || path.startsWith(p + "/");

  return (
    <aside className="sidebar">
      <div className="sb-brand" onClick={() => go("/dashboard")} style={{ cursor: "pointer" }}>
        <div className="sb-brand-mark">V</div>
        <div className="sb-brand-name">Vetor <em>Jurídico</em></div>
      </div>

      <div className="sb-office" onClick={() => go("/escritorios")}>
        <div className="sb-office-mark">CFW</div>
        <div className="sb-office-info">
          <div className="sb-office-name">Costa, Furtado & Werneck</div>
          <div className="sb-office-plan">Plano Pro · 5 membros</div>
        </div>
        <Icon name="chevD" size={12} style={{ color: "var(--fg-subtle)" }} />
      </div>

      <nav style={{ overflowY: "auto", flex: 1, paddingBottom: 12 }}>
        {NAV.map((item, i) => {
          if (item.section) return <div key={"s" + i} className="sb-section">{item.section}</div>;
          const active = matches(item.path);
          return (
            <div key={item.path} className="sb-nav">
              <div className={"sb-item" + (active ? " active" : "")} onClick={() => go(item.path)}>
                <Icon name={item.icon} size={15} className="sb-icon" />
                <span className="sb-label">{item.label}</span>
                {item.meta && <span className="sb-meta">{item.meta}</span>}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sb-bottom">
        <div className="sb-user" onClick={() => go("/perfil")}>
          <div className="avatar">MC</div>
          <div className="sb-user-info">
            <div className="sb-user-name">Marina Costa</div>
            <div className="sb-user-role">Sócia titular</div>
          </div>
          <Icon name="chevR" size={12} style={{ color: "var(--fg-subtle)" }} />
        </div>
      </div>
    </aside>
  );
}

// Crumbs per route
const CRUMBS = {
  "/dashboard": ["Dashboard"],
  "/casos": ["Casos"],
  "/clientes": ["Clientes"],
  "/calendario": ["Calendário"],
  "/documentos": ["Documentos"],
  "/modelos": ["Modelos"],
  "/equipe": ["Equipe"],
  "/financeiro": ["Financeiro"],
  "/notificacoes": ["Notificações"],
  "/configuracoes": ["Configurações"],
  "/perfil": ["Perfil"],
  "/escritorio": ["Escritório"],
  "/planos": ["Plano"],
};

function Topbar() {
  const { path } = useRoute();
  const { theme, setTheme } = useTheme();
  let crumbs;
  if (path.startsWith("/casos/")) crumbs = ["Casos", path.replace("/casos/", "")];
  else if (path.startsWith("/clientes/")) crumbs = ["Clientes", path.replace("/clientes/", "")];
  else if (path.startsWith("/documentos/")) crumbs = ["Documentos", path.replace("/documentos/", "")];
  else crumbs = CRUMBS[path] || ["—"];

  return (
    <header className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevR" size={12} className="crumb-sep" />}
            <span className={i === crumbs.length - 1 ? "crumb-now" : ""}>{c}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="topbar-right">
        <div className="icon-btn" title="Buscar">
          <Icon name="search" size={15} />
        </div>
        <div className="icon-btn" title="Notificações">
          <Icon name="bell" size={15} />
          <span className="badge-dot"></span>
        </div>
        <div className="icon-btn" title="Alternar tema" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          <Icon name={theme === "light" ? "moon" : "sun"} size={15} />
        </div>
        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 6px" }}></div>
        <div className="icon-btn" style={{ width: "auto", padding: "0 6px", gap: 8, display: "flex" }}>
          <div className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>MC</div>
        </div>
      </div>
    </header>
  );
}

// ----- App entry -----
function App() {
  const { path } = useRoute();

  // Public/unauthenticated routes (no sidebar)
  const isPublic = path === "/landing" || path.startsWith("/auth") || path === "/gateway" || path === "/onboarding" || path === "/escritorios";

  if (isPublic) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }} key={path}>
        {renderRoute(path)}
        <DemoSwitcher />
      </div>
    );
  }

  return (
    <div className="app-shell" key={path.split("/")[1]}>
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="page fade-in">
          {renderRoute(path)}
        </div>
      </main>
      <DemoSwitcher />
    </div>
  );
}

function renderRoute(path) {
  if (path === "/landing") return <Landing />;
  if (path === "/auth/login") return <Login />;
  if (path === "/auth/cadastro") return <Cadastro />;
  if (path === "/gateway") return <Gateway />;
  if (path === "/onboarding") return <Onboarding />;
  if (path === "/escritorios") return <EscritoriosSelect />;

  if (path === "/dashboard") return <Dashboard />;
  if (path === "/clientes") return <Clientes />;
  if (path.startsWith("/clientes/")) return <ClienteDetalhe id={path.split("/")[2]} />;
  if (path === "/casos") return <Casos />;
  if (path.startsWith("/casos/")) return <CasoDetalhe id={path.split("/")[2]} />;
  if (path === "/calendario") return <Calendario />;
  if (path === "/documentos") return <Documentos />;
  if (path.startsWith("/documentos/")) return <DocumentoDetalhe id={path.split("/")[2]} />;
  if (path === "/modelos") return <Modelos />;
  if (path === "/equipe") return <Equipe />;
  if (path === "/financeiro") return <Financeiro />;
  if (path === "/notificacoes") return <Notificacoes />;
  if (path === "/configuracoes") return <Configuracoes />;
  if (path === "/perfil") return <Perfil />;
  if (path === "/escritorio") return <EscritorioPerfil />;
  if (path === "/planos") return <Planos />;
  return <Dashboard />;
}

// Demo switcher: a discreet floating dock to jump between key screens
function DemoSwitcher() {
  const { path, go } = useRoute();
  const [open, setOpen] = useState(false);
  const groups = [
    { label: "Público", items: [
      ["/landing", "Landing"],
      ["/auth/login", "Login"],
      ["/auth/cadastro", "Cadastro"],
      ["/gateway", "Gateway"],
      ["/onboarding", "Onboarding"],
      ["/escritorios", "Escritórios"],
    ]},
    { label: "App", items: [
      ["/dashboard", "Dashboard"],
      ["/casos", "Casos"],
      ["/casos/p-2024-00481", "Caso · Detalhe"],
      ["/clientes", "Clientes"],
      ["/clientes/c-001", "Cliente · Detalhe"],
      ["/calendario", "Calendário"],
      ["/documentos", "Documentos"],
      ["/documentos/d-006", "Documento · Detalhe"],
      ["/modelos", "Modelos"],
      ["/equipe", "Equipe"],
      ["/financeiro", "Financeiro"],
      ["/notificacoes", "Notificações"],
      ["/configuracoes", "Configurações"],
      ["/perfil", "Perfil"],
      ["/escritorio", "Escritório"],
      ["/planos", "Planos"],
    ]},
  ];
  return (
    <>
      <div className="demo-bar" style={{ flexDirection: "column", alignItems: "stretch", padding: open ? 4 : 3, borderRadius: open ? 10 : 999, gap: 0, maxWidth: 220 }}>
        <button onClick={() => setOpen(!open)} style={{ justifyContent: "space-between", display: "flex", alignItems: "center", gap: 6, padding: "5px 10px" }}>
          <span>{open ? "Demo · navegar" : "Demo"}</span>
          <Icon name={open ? "chevU" : "chevD"} size={10} />
        </button>
        {open && groups.map(g => (
          <div key={g.label} style={{ padding: "6px 4px 0", borderTop: "1px solid var(--border)", marginTop: 4 }}>
            <div style={{ fontSize: 9, color: "var(--fg-subtle)", padding: "2px 8px 4px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>{g.label}</div>
            {g.items.map(([p, label]) => (
              <button
                key={p}
                onClick={() => { go(p); }}
                className={path === p ? "active" : ""}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "4px 8px", borderRadius: 4 }}
              >
                {label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// Helper: Find by id
const findClient = (id) => window.MOCK.CLIENTES.find(c => c.id === id);
const findCase = (id) => window.MOCK.CASOS.find(c => c.id === id);
const findDoc = (id) => window.MOCK.DOCUMENTOS.find(c => c.id === id);

// Format BRL
const brl = (n) => "R$ " + (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

window.useRoute = useRoute;
window.useTheme = useTheme;
window.RouterProvider = RouterProvider;
window.ThemeProvider = ThemeProvider;
window.App = App;
window.findClient = findClient;
window.findCase = findCase;
window.findDoc = findDoc;
window.brl = brl;
