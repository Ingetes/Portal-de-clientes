import React, { useMemo, useState, useEffect, createContext, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, LogIn, LogOut, ShieldCheck, User2 } from "lucide-react";
import { motion } from "framer-motion";

// Portal de ingreso al Administrador de Usuarios del Portal de Clientes
// Acceso permitido solo a SUPER_ADMIN y ADMIN

const USERS = [
  { email: "jgarzon@ingetes.com", password: "Ing830#1", role: "SUPER_ADMIN", name: "Juan Sebastián Garzón" },
] as const;

const mockAuth = {
  login: async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const found = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error("Credenciales inválidas");
    return { email: found.email, role: found.role, name: found.name };
  },
};

interface Session { email: string; role: "SUPER_ADMIN" | "ADMIN"; name: string }
interface AuthCtx {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthCtx | null>(null);

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext no disponible");
  return ctx;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("ingetes_admin_session");
    if (raw) setSession(JSON.parse(raw));
  }, []);
  useEffect(() => {
    if (session) sessionStorage.setItem("ingetes_admin_session", JSON.stringify(session));
    else sessionStorage.removeItem("ingetes_admin_session");
  }, [session]);

  const value = useMemo<AuthCtx>(() => ({
    session,
    login: async (email, password) => {
      const user = await mockAuth.login(email, password);
      setSession(user);
    },
    logout: () => setSession(null),
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function LoginCard() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-6">
            <img src="/ingetes-logo.svg" alt="INGETES" className="h-12 w-auto mb-3" />
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <h1 className="text-2xl font-semibold text-emerald-700 text-center">PORTAL ADMINISTRADOR DE USUARIOS</h1>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm mb-4">
              <AlertCircle className="h-4 w-4 mt-0.5 text-red-600" />
              <div>
                <p className="font-medium text-red-700">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="usuario@ingetes.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="focus-visible:ring-green-500" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="focus-visible:ring-green-500" />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-emerald-700 text-white" disabled={loading}>
              <LogIn className="h-4 w-4 mr-2" /> {loading ? "Validando…" : "Ingresar"}
            </Button>
            <p className="text-xs text-center text-gray-500">
              Acceso restringido al <strong>SUPER_ADMIN</strong>.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RoleGate({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) return null;
  const allowed = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
  if (!allowed) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-4 border border-emerald-300 bg-emerald-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-emerald-700">Acceso denegado</h2>
        </div>
        <p className="text-sm text-emerald-700">
          Tu rol actual (<strong>{session.role}</strong>) no tiene permisos para ingresar al Administrador de Usuarios.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

function AdminDashboard() {
  const { session, logout } = useAuth();
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User2 className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-semibold text-emerald-700">Administrador de Usuarios</h2>
            <p className="text-sm text-gray-600">Bienvenido, {session?.name} — Rol: <strong>{session?.role}</strong></p>
          </div>
        </div>
        <Button variant="outline" onClick={logout} className="border-green-600 text-emerald-700 hover:bg-emerald-50">
          <LogOut className="h-4 w-4 mr-2" /> Salir
        </Button>
      </div>
      <Card className="shadow-sm border border-emerald-200">
        <CardContent className="p-5">
          <h3 className="font-medium mb-1 text-emerald-700">Acceso concedido</h3>
          <p className="text-sm text-gray-600">El módulo de <strong>Administrador de Usuarios</strong> aún no está enlazado. Aquí se conectará el programa cuando esté listo.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminAccessPortal() {
  const [mounted, setMounted] = useState(false);
  const { session } = useAuthSafe();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-white to-emerald-50 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          {!sessionProxy() ? <LoginCardWrapper /> : <RoleGate><AdminDashboard /></RoleGate>}
        </div>
      </div>
    </AuthProvider>
  );
}

function useAuthSafe() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("ingetes_admin_session");
    if (raw) setSession(JSON.parse(raw));
  }, []);
  return { session } as { session: Session | null };
}

function sessionProxy() {
  try {
    const raw = sessionStorage.getItem("ingetes_admin_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function LoginCardWrapper() {
  return (
    <AuthProvider>
      <LoginCard />
    </AuthProvider>
  );
}
