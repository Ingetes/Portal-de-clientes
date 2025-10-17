import React, { useEffect, useMemo, useState, createContext, useContext } from "react";

const logoIngetes = `${import.meta.env.BASE_URL}ingetes.jpg`;

/** ========== Mock de usuarios (SOLO DEMO) ========== */
const USERS = [
  { email: "jgarzon@ingetes.com", password: "Ing830#1", role: "SUPER_ADMIN", name: "Juan Sebastián Garzón" },
];

const mockAuth = {
  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 400));
    const found = USERS.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (!found) throw new Error("Credenciales inválidas");
    return { email: found.email, role: found.role, name: found.name };
  },
};

/** ========== Auth Context (JS puro) ========== */
const AuthContext = createContext(null);
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext no disponible");
  return ctx;
}
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("ingetes_admin_session");
    if (raw) setSession(JSON.parse(raw));
  }, []);
  useEffect(() => {
    if (session) sessionStorage.setItem("ingetes_admin_session", JSON.stringify(session));
    else sessionStorage.removeItem("ingetes_admin_session");
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      login: async (email, password) => {
        const user = await mockAuth.login(email, password);
        setSession(user);
      },
      logout: () => setSession(null),
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** ========== UI Helpers (SVGs livianos) ========== */
const IconShield = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className || "w-6 h-6"}>
    <path d="M12 2c-.6 0-1.2.2-1.7.5L4 6v6c0 4.4 3.1 8.5 8 10 4.9-1.5 8-5.6 8-10V6l-6.3-3.5c-.5-.3-1.1-.5-1.7-.5zM11 16l-3-3 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6z" />
  </svg>
);
const IconUser = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className || "w-6 h-6"}>
    <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
  </svg>
);
const IconAlert = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className || "w-4 h-4"}>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-8h-2v6h2V10z" />
  </svg>
);
const IconLogout = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className || "w-4 h-4"}>
    <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </svg>
);
const IconLogin = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className || "w-4 h-4"}>
    <path d="M10 17v-3H3v-4h7V7l5 5-5 5zM21 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </svg>
);

/** ========== Login Card ========== */
function LoginCard() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto shadow-xl border border-emerald-200 rounded-2xl bg-white">
      <div className="p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logoIngetes} alt="INGETES" className="h-10 w-auto mb-3 rounded" />
          <div className="flex items-center gap-2">
            <IconShield className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-semibold text-emerald-700 text-center">
              PORTAL ADMINISTRADOR DE USUARIOS
            </h1>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm mb-4">
            <IconAlert className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-700">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="usuario@ingetes.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 transition-colors"
          >
            <IconLogin /> {loading ? "Validando…" : "Ingresar"}
          </button>
          <p className="text-xs text-center text-gray-500">
            Acceso restringido al <strong>SUPER_ADMIN</strong>.
          </p>
        </form>
      </div>
    </div>
  );
}

/** ========== Gate por Rol ========== */
function RoleGate({ children }) {
  const { session } = useAuth();
  if (!session) return null;
  const allowed = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
  if (!allowed) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-4 border border-emerald-300 bg-emerald-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <IconAlert className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-emerald-700">Acceso denegado</h2>
        </div>
        <p className="text-sm text-emerald-700">
          Tu rol actual no tiene permisos para ingresar al Administrador de Usuarios.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

/** ========== Dashboard (placeholder) ========== */
function AdminDashboard() {
  const { session, logout } = useAuth();
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconUser className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-semibold text-emerald-700">Administrador de Usuarios</h2>
            <p className="text-sm text-gray-600">
              Bienvenido, {session?.name} — Rol: <strong>{session?.role}</strong>
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-4 py-2 font-semibold"
        >
          <IconLogout /> Salir
        </button>
      </div>

      <div className="rounded-2xl shadow-sm border border-emerald-200 bg-white p-5">
        <h3 className="font-medium mb-1 text-emerald-700">Acceso concedido</h3>
        <p className="text-sm text-gray-600">
          El módulo de <strong>Administrador de Usuarios</strong> aún no está enlazado. Aquí se conectará el
          programa cuando esté listo.
        </p>
      </div>
    </div>
  );
}

/** ========== Componente principal exportado ========== */
export default function AdminAccessPortal() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-white to-emerald-50 p-6">
        {/* Volver arriba a la derecha */}
        <div className="max-w-6xl mx-auto flex justify-end mb-4">
          <a
            href="#home"
            className="inline-flex items-center rounded-xl bg-white border border-slate-300 text-slate-700 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
          >
            ← Volver
          </a>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branding */}
          <div className="hidden md:flex flex-col justify-between rounded-2xl bg-[linear-gradient(135deg,#059669,rgba(5,150,105,0.85))] text-white p-8 shadow-xl">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-white/15 rounded-xl p-2">
                  <IconShield className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-semibold leading-tight">Portal de Clientes INGETES</h1>
              </div>
              <p className="mt-6 text-white/90 leading-relaxed">
                Administra usuarios y permisos del ecosistema de clientes.
              </p>
            </div>
            <div className="text-sm text-white/80">
              <p>Solo personal autorizado puede ingresar a este módulo.</p>
            </div>
          </div>

          {/* Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <AuthBody />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

function AuthBody() {
  const { session } = useAuth();
  if (!session) return <LoginCard />;
  return (
    <RoleGate>
      <AdminDashboard />
    </RoleGate>
  );
}
