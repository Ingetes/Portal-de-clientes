import { useMemo, useState } from "react";

// INGETES – Admin Portal UI (fresh & friendly)
// - App-like layout, soft cards, rounded corners, subtle gradients
// - Tabs: Panel, Usuarios, Solicitudes, INGECAP
// - Mock data + interactions (ready to wire to APIs)

// Types
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "CLIENTE" | string;
export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  active: boolean;
  logins: number;
};

export default function AdminPortal() {
  const TABS = ["panel", "usuarios", "solicitudes", "ingecap"] as const;
  const [tab, setTab] = useState<(typeof TABS)[number]>("panel");
  const [q, setQ] = useState("");

  // 🔐 Rol del usuario autenticado (DEMO). En producción, leer de sesión.
  const currentUserRole: UserRole = "SUPER_ADMIN"; // ← Cambia para probar permisos

  // --- Mock data (sustituir por fetch a /api/users, etc.)
  const [users, setUsers] = useState<UserRow[]>([
    { id: "u1", name: "María Pérez", email: "maria@acme.co", role: "ADMIN",      company: "ACME S.A.S.",      active: true,  logins: 14 },
    { id: "u2", name: "Juan López",  email: "juan@ingetes.com", role: "ADMIN",      company: "INGETES S.A.S.",   active: true,  logins:  8 },
    { id: "u3", name: "Ana Gómez",   email: "ana@metalco.co",  role: "CLIENTE",    company: "METALCO S.A.",     active: false, logins:  2 },
    { id: "u4", name: "Carlos Ruiz", email: "carlos@betel.com", role: "CLIENTE",    company: "BETEL LTDA.",      active: true,  logins: 23 },
  ]);

  const filteredUsers = useMemo(() => {
    if (!q.trim()) return users;
    const s = q.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.company.toLowerCase().includes(s)
    );
  }, [q, users]);

  const stats = {
    pendingRequests: 5,
    usersTotal: users.length,
    usersInactive: users.filter(u => !u.active).length,
    ingSoon: 2,
    ingAvgAge: 320,
    companies: 18,
  };

  // Crear usuario (modal)
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <TopBar />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Header onSearch={setQ} onCreateUser={() => setOpenCreate(true)} />

        <Tabs value={tab} onChange={setTab} />

        {tab === "panel" && <Dashboard stats={stats} />}
        {tab === "usuarios" && (
          <UsersTable
            users={filteredUsers}
            q={q}
            onSearch={setQ}
            currentUserRole={currentUserRole}
            onCreateUser={() => setOpenCreate(true)}
          />
        )}
        {tab === "solicitudes" && <RequestsView />}
        {tab === "ingecap" && <IngecapView />}
      </div>

      {openCreate && (
        <CreateUserModal
          onClose={() => setOpenCreate(false)}
          onCreate={(payload) => {
            // TODO: POST /api/users
            const id = `u${users.length + 1}`;
            setUsers(prev => [...prev, { id, logins: 0, active: true, company: payload.company || "—", ...payload }]);
            setOpenCreate(false);
            alert("Usuario creado (mock)\n" + JSON.stringify(payload, null, 2));
          }}
        />
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-semibold">Admin INGETES</span>
          <span className="text-xs text-neutral-500 hidden sm:inline">Portal de Clientes & INGECAP</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge text="App Router" />
          <Avatar name="OP" />
        </div>
      </div>
    </header>
  );
}

function Header({ onSearch, onCreateUser }: { onSearch: (v: string) => void; onCreateUser: () => void }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bienvenido 👋</h1>
        <p className="text-sm text-neutral-600">Gestiona usuarios, solicitudes y membresías INGECAP desde un mismo lugar.</p>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <SearchInput placeholder="Buscar por nombre, correo o empresa…" onChange={onSearch} />
        <PrimaryButton label="Crear usuario" onClick={onCreateUser}/>
      </div>
    </div>
  );
}

function Tabs({ value, onChange }: { value: string; onChange: (v: any) => void }) {
  const items: { key: string; label: string }[] = [
    { key: "panel", label: "Panel" },
    { key: "usuarios", label: "Usuarios" },
    { key: "solicitudes", label: "Solicitudes" },
    { key: "ingecap", label: "INGECAP" },
  ];
  return (
    <div className="flex gap-2 overflow-auto no-scrollbar border-b mb-6">
      {items.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`relative px-4 py-2 text-sm rounded-t-lg transition-colors ${
            value === t.key
              ? "bg-white border-x border-t -mb-px border-neutral-200 text-neutral-900"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
          aria-pressed={value === t.key}
        >
          {t.label}
          {value === t.key && <div className="absolute left-0 right-0 -bottom-px h-px bg-white"/>}
        </button>
      ))}
    </div>
  );
}

function Dashboard({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Solicitudes pendientes" value={stats.pendingRequests} accent="from-amber-100 to-amber-50" />
        <StatCard title="Usuarios" value={stats.usersTotal} accent="from-blue-100 to-blue-50" />
        <StatCard title="Usuarios inactivos" value={stats.usersInactive} accent="from-rose-100 to-rose-50" />
        <StatCard title="Empresas" value={stats.companies} accent="from-teal-100 to-teal-50" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="INGECAP por vencer (≤30 días)" value={stats.ingSoon} accent="from-violet-100 to-violet-50" />
        <StatCard title="Antigüedad promedio INGECAP (días)" value={stats.ingAvgAge} accent="from-emerald-100 to-emerald-50" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <QuickActions />
        <TipsCard />
      </div>
    </div>
  );
}

function UsersTable({ users, q, onSearch, currentUserRole, onCreateUser }: { users: UserRow[]; q: string; onSearch: (v: string) => void; currentUserRole: UserRole; onCreateUser: () => void }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-semibold">Usuarios</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <SearchInput value={q} placeholder="Buscar usuario…" onChange={onSearch} />
          <SecondaryButton label="Exportar" onClick={() => alert("Mock: exportar usuarios")}/>
          <PrimaryButton label="Crear usuario" onClick={onCreateUser} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <Th>Nombre</Th>
              <Th>Correo</Th>
              <Th>Rol</Th>
              <Th>Empresa</Th>
              <Th>Estado</Th>
              <Th>Ingresos</Th>
              <Th className="text-right pr-4">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-neutral-50/60">
                <Td>{u.name}</Td>
                <Td className="text-neutral-600">{u.email}</Td>
                <Td><RolePill role={u.role} /></Td>
                <Td>{u.company}</Td>
                <Td>
                  {u.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">● Activo</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 text-[11px] font-medium">● Inactivo</span>
                  )}
                </Td>
                <Td>{u.logins}</Td>
                <Td className="text-right pr-3">
                  <RowActions user={u} currentUserRole={currentUserRole} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ✅ FIX: RowActions con permisos y motivo de cancelación
function RowActions({ user, currentUserRole }: { user: UserRow; currentUserRole: UserRole }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");

  const canImpersonate = currentUserRole === "SUPER_ADMIN"; // 1) Solo SUPER_ADMIN

  const toggleActive = async () => {
    setBusy("toggle");
    // TODO: POST /api/users/{id}/toggle-active
    await new Promise(r => setTimeout(r, 350));
    alert(`Mock: ${user.active ? "Desactivar" : "Activar"} usuario ${user.name}`);
    setBusy(null);
  };

  const impersonate = async () => {
    if (!canImpersonate) return;
    setBusy("impersonate");
    // TODO: POST /api/users/{id}/impersonate
    await new Promise(r => setTimeout(r, 350));
    alert(`Mock: Ingresar como ${user.email}`);
    setBusy(null);
  };

  const cancelAccount = async () => {
    // 2) Requerir motivo y enviar a auditoría/aplicación
    if (!reason.trim()) {
      alert("Por favor ingresa el motivo de cancelación.");
      return;
    }
    setBusy("cancel");
    // TODO: POST /api/users/{id}/cancel-account  body: { reason }
    await new Promise(r => setTimeout(r, 350));
    alert(`Mock: Cuenta cancelada para ${user.name} – Motivo: ${reason}`);
    setBusy(null);
    setShowCancel(false);
    setReason("");
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={toggleActive}
        disabled={busy === "toggle"}
        className="px-2 py-1 text-xs rounded-lg border hover:bg-neutral-50"
        aria-label={user.active ? "Desactivar usuario" : "Activar usuario"}
      >{busy === "toggle" ? "…" : (user.active ? "Desactivar" : "Activar")}</button>

      <button
        onClick={impersonate}
        disabled={!canImpersonate || busy === "impersonate"}
        className={`px-2 py-1 text-xs rounded-lg border ${canImpersonate ? "hover:bg-neutral-50" : "opacity-40 cursor-not-allowed"}`}
        aria-label="Ingresar como"
        title={canImpersonate ? "Ingresar como este usuario" : "Solo SUPER_ADMIN"}
      >{busy === "impersonate" ? "…" : "Ingresar"}</button>

      <button
        onClick={() => setShowCancel(true)}
        className="px-2 py-1 text-xs rounded-lg border text-red-600 hover:bg-red-50"
        aria-label="Cancelar cuenta"
      >Cancelar</button>

      {showCancel && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <div className="font-medium mb-1">Cancelar cuenta</div>
            <p className="text-sm text-neutral-600 mb-3">Esto desactiva el usuario y cancela INGECAP, manteniendo histórico. Indica el motivo:</p>
            <textarea
              value={reason}
              onChange={(e)=>setReason(e.target.value)}
              placeholder="Motivo de cancelación"
              className="w-full border rounded-xl p-2 text-sm min-h-[96px]"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={()=>{ setShowCancel(false); setReason(""); }} className="px-3 py-2 text-sm rounded-xl border">Cerrar</button>
              <button onClick={cancelAccount} disabled={busy === "cancel"} className="px-3 py-2 text-sm rounded-xl bg-red-600 text-white">{busy === "cancel" ? "Cancelando…" : "Confirmar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestsView() {
  // Mini tests de comportamiento en tiempo de ejecución (solo consola)
  if (typeof window !== "undefined") {
    try {
      console.assert((() => { const interno=true; const role='ADMIN'; const assigned = interno ? role : 'CLIENTE'; return assigned==='ADMIN'; })(), 'Test: Interno respeta rol ADMIN');
      console.assert((() => { const interno=false; const role='SUPER_ADMIN'; const assigned = interno ? role : 'CLIENTE'; return assigned==='CLIENTE'; })(), 'Test: Externo fuerza CLIENTE');
    } catch {}
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Solicitudes de acceso</h2>
      <EmptyState
        title="Sin solicitudes nuevas"
        subtitle="Cuando un usuario solicite acceso, aparecerá aquí para aprobar o rechazar."
        cta={{ label: "Crear solicitud", onClick: () => alert("Mock: crear solicitud") }}
      />
    </section>
  );
}

function IngecapView() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Membresías INGECAP</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <ActionCard
          title="Extender membresías por vencer"
          description="Detecta y extiende 1 año las membresías que vencen en ≤30 días."
          action={{ label: "Extender ahora", onClick: () => alert("Mock: extender") }}
        />
        <ActionCard
          title="Cancelar membresía"
          description="Cancela la membresía manteniendo el histórico intacto."
          action={{ label: "Cancelar", tone: "danger", onClick: () => alert("Mock: cancelar") }}
        />
      </div>
    </section>
  );
}

// ————— UI PRIMITIVES —————
function Logo() {
  return (
    <div className="h-7 w-7 grid place-items-center rounded-xl bg-neutral-900 text-white text-xs font-bold">IN</div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase();
  return (
    <div className="h-8 w-8 grid place-items-center rounded-full bg-neutral-200 text-neutral-700 text-xs font-semibold">
      {initials}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="text-[10px] px-2 py-1 rounded-full bg-neutral-100 text-neutral-600 border">{text}</span>
  );
}

function SearchInput({ value, onChange, placeholder }:{ value?: string; onChange: (v:string)=>void; placeholder?: string }){
  return (
    <div className="relative w-full md:w-72">
      <input
        value={value ?? ""}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-3 py-2 pl-8 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
      />
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
    </div>
  );
}

function PrimaryButton({ label, onClick }:{ label: string; onClick: ()=>void }){
  return (
    <button onClick={onClick} className="rounded-xl bg-neutral-900 text-white text-sm px-3 py-2 hover:opacity-90 active:scale-[.98]">{label}</button>
  );
}

function SecondaryButton({ label, onClick }:{ label: string; onClick: ()=>void }){
  return (
    <button onClick={onClick} className="rounded-xl border text-sm px-3 py-2 hover:bg-neutral-50">{label}</button>
  );
}

function StatCard({ title, value, accent }:{ title:string; value:number; accent?: string }){
  return (
    <div className={`rounded-2xl border bg-gradient-to-b ${accent ?? "from-neutral-100 to-white"} p-4`}> 
      <div className="text-sm text-neutral-600">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}

function QuickActions(){
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="font-medium mb-2">Acciones rápidas</div>
      <div className="flex flex-wrap gap-2">
        <SecondaryButton label="Crear usuario" onClick={()=>alert("Mock: crear usuario")}/>
        <SecondaryButton label="Aprobar solicitudes" onClick={()=>alert("Mock: aprobar solicitudes")}/>
        <SecondaryButton label="Extender INGECAP" onClick={()=>alert("Mock: extender ingecap")}/>
      </div>
    </div>
  );
}

function TipsCard(){
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="font-medium mb-2">Sugerencias</div>
      <ul className="text-sm list-disc ml-5 space-y-1 text-neutral-700">
        <li>Activa usuarios y gestiona INGECAP por separado para mantener el histórico.</li>
        <li>Usa el buscador para filtrar rápidamente por nombre, correo o empresa.</li>
        <li>Prioriza membresías que vencen en ≤30 días para no perder acceso.</li>
      </ul>
    </div>
  );
}

function RolePill({ role }: { role: string }){
  const tone: Record<string, string> = {
    SUPER_ADMIN: "bg-black text-white",
    ADMIN: "bg-blue-600/10 text-blue-700",
    CLIENTE: "bg-purple-600/10 text-purple-700",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${tone[role] ?? "bg-neutral-100 text-neutral-700"}`}>{role}</span>
  );
}

function ActionCard({ title, description, action }:{ title:string; description:string; action:{ label: string; onClick: ()=>void; tone?: "danger" | "default" }}){
  const className = action.tone === "danger" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-neutral-900 hover:bg-neutral-800 text-white";
  return (
    <div className="rounded-2xl border bg-white p-4 flex flex-col gap-3 justify-between">
      <div>
        <div className="font-medium">{title}</div>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      <div>
        <button onClick={action.onClick} className={`px-3 py-2 text-sm rounded-xl ${className}`}>{action.label}</button>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle, cta }:{ title:string; subtitle:string; cta?:{label:string; onClick:()=>void} }){
  return (
    <div className="rounded-2xl border bg-white p-8 text-center">
      <div className="text-3xl mb-2">🗂️</div>
      <div className="font-semibold">{title}</div>
      <p className="text-sm text-neutral-600">{subtitle}</p>
      {cta && <div className="mt-4"><PrimaryButton label={cta.label} onClick={cta.onClick} /></div>}
    </div>
  );
}

function Th({ children, className="" }:{ children: React.ReactNode; className?: string }){
  return <th className={`text-left font-medium p-3 ${className}`}>{children}</th>;
}

function Td({ children, className="" }:{ children: React.ReactNode; className?: string }){
  return <td className={`p-3 align-middle ${className}`}>{children}</td>;
}

// ——— Crear Usuario (modal)
function CreateUserModal({ onClose, onCreate }:{ onClose: ()=>void; onCreate: (payload: { name: string; email: string; role: UserRole; company?: string; interno?: boolean })=>void }){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interno, setInterno] = useState(true); // "los que se crean desde el portal son internos"
  const [role, setRole] = useState<UserRole>("ADMIN"); // si es interno: ADMIN por defecto; si no, siempre CLIENTE
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);

  // Valida email y nombre
  const valid = name.trim() && /.+@.+\..+/.test(email);

  // Si no es interno, el rol es CLIENTE automáticamente
  const effectiveRole: UserRole = interno ? role : "CLIENTE";

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 350));
    onCreate({ name, email, role: effectiveRole, company, interno });
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Crear usuario</div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800">✕</button>
        </div>
        <div className="grid gap-3">
          <Field label="Nombre">
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Nombre completo"/>
          </Field>
          <Field label="Correo">
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="usuario@empresa.com"/>
          </Field>

          <Field label="Tipo de usuario">
            <div className="flex items-center gap-2">
              <input id="interno" type="checkbox" checked={interno} onChange={(e)=>setInterno(e.target.checked)} />
              <label htmlFor="interno" className="text-sm text-neutral-700">Interno (creado desde el portal)</label>
            </div>
          </Field>

          {interno ? (
            <Field label="Rol interno">
              <select value={role} onChange={(e)=>setRole(e.target.value as UserRole)} className="w-full border rounded-xl px-3 py-2 text-sm">
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </Field>
          ) : (
            <div className="text-sm text-neutral-600 -mt-1">Rol asignado automáticamente: <b>CLIENTE</b></div>
          )}

          <Field label="Empresa (opcional)">
            <input value={company} onChange={(e)=>setCompany(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Razón social"/>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-xl border">Cancelar</button>
          <button disabled={!valid || busy} onClick={submit} className="px-3 py-2 text-sm rounded-xl bg-neutral-900 text-white disabled:opacity-50">{busy?"Creando…":"Crear"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }:{ label: string; children: React.ReactNode }){
  return (
    <label className="text-sm">
      <div className="text-neutral-600 mb-1">{label}</div>
      {children}
    </label>
  );
}
