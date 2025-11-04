import React, { useMemo, useState } from "react";

// Credenciales únicas permitidas
const FIXED_EMAIL = "cliente.demo@empresa.com";
const FIXED_PASSWORD = "Demo1234!";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;
const NIT_RE = /^[0-9]{5,12}(-[0-9Xx])?$/; // NIT simple (sin cálculo de dígito verificación)

function cn(...classes) { return classes.filter(Boolean).join(" "); }

function Field({ label, children, required }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-sm text-red-600">{msg}</p>;
}

function PasswordMeter({ value }) {
  const score = useMemo(() => {
    let s = 0;
    if (!value) return 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[a-z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return Math.min(s, 4); // 0..4
  }, [value]);

  const labels = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"];
  const width = ["w-0", "w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"][score];
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-gray-200 rounded">
        <div className={cn("h-1.5 rounded bg-emerald-600 transition-all", width)} />
      </div>
      <p className="text-xs text-gray-500 mt-1">Seguridad: {labels[score]}</p>
    </div>
  );
}

export default function PortalClientesAuth() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [scrollY, setScrollY] = useState(0);
  React.useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
<div className="relative min-h-screen bg-transparent flex items-center justify-center p-4">

  {/* Fondo institucional (marca de agua INGETES) */}
  <div className="absolute inset-0 z-0 pointer-events-none select-none" aria-hidden>
    <img
      src={`${import.meta.env.BASE_URL}ingetes.jpg`}
      onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}ingetes.png`; }}
      alt="Marca de agua INGETES"
      className="absolute left-1/2 top-1/2 -translate-x-1/2"
      style={{
        transform: `translateY(calc(-50% + ${scrollY * 0.25}px))`,
        width: "min(1300px, 90vw)",
        opacity: 0.18,
        filter: "grayscale(20%)",
        transition: "transform 0.2s ease-out",
        willChange: "transform",
      }}
    />
  </div>
  
  <div className="relative z-10 w-full max-w-5xl mx-auto">
<div className="w-full max-w-5xl mx-auto">
  {/* Contenido principal: grid de 2 columnas */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Branding / Lado izquierdo */}
    <div className="hidden md:flex flex-col justify-between rounded-2xl bg-[linear-gradient(135deg,#059669,rgba(5,150,105,0.8))] text-white p-8 shadow-xl">
      <div>
        <div className="flex items-center gap-3">
          <div className="bg-white/15 rounded-xl p-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M12 2c-.8 0-1.6.3-2.2.9L3 9.7V22h18V9.7l-6.8-6.8C13.6 2.3 12.8 2 12 2zM9 20H5v-8l7-7 7 7v8h-4v-6H9v6z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold leading-tight">Portal de Clientes INGETES</h1>
        </div>
        <p className="mt-6 text-white/90 leading-relaxed">
          Accede a documentación, herramientas de selección, cotizadores y beneficios exclusivos de nuestro ecosistema.
        </p>
      </div>
      <div className="text-sm text-white/80">
        <p>¿Aún no tienes acceso? Crea tu cuenta y nuestro equipo validará la información de tu empresa.</p>
      </div>
    </div>

    {/* Panel derecho dinámico */}
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
      {mode === "login" && <LoginView onChangeMode={setMode} />}
      {mode === "signup" && <SignupView onChangeMode={setMode} />}
      {mode === "forgot" && <ForgotView onChangeMode={setMode} />}
    </div>
  </div>
</div>
  );
}

function LoginView({ onChangeMode }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState({ email: "", password: "" });

  // Autorrelleno SOLO para la demo de redirección
  React.useEffect(() => {
    setEmail("cliente.demo@empresa.com");
    setPassword("Demo1234!");
  }, []);

const handleSubmit = (e) => {
  e.preventDefault();
  const nextErrors = {
    email: email.trim() ? "" : "Ingresa un correo",
    password: password.trim() ? "" : "Ingresa tu contraseña",
  };
  setErrors(nextErrors);
  if (nextErrors.email || nextErrors.password) return;

  // Validación estricta: SOLO este usuario/contraseña entran
  if (
    email.trim().toLowerCase() !== FIXED_EMAIL.toLowerCase() ||
    password !== FIXED_PASSWORD
  ) {
    alert("Usuario o contraseña no válidos.");
    return;
  }

  // Guardar sesión y entrar
  localStorage.setItem("isLoggedIn", "true");
  window.location.hash = "#home";
};

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <header className="mb-2">
        <h2 className="text-xl font-semibold text-gray-900">Inicia sesión</h2>
        <p className="text-sm text-gray-500 mt-1">
          Accede con tu correo corporativo y contraseña.
        </p>
      </header>

      <Field label="Correo electrónico" required>
        <input
          type="email"
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          placeholder="tucorreo@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        {errors.email && <ErrorMsg msg={errors.email} />}
      </Field>

      <Field label="Contraseña" required>
        <input
          type="password"
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {errors.password && <ErrorMsg msg={errors.password} />}
      </Field>

{/*
<div className="flex items-center justify-between text-sm">
  <button
    type="button"
    onClick={() => onChangeMode("forgot")}
    className="text-emerald-700 hover:underline"
  >
    ¿Olvidaste tu contraseña?
  </button>
  <button
    type="button"
    onClick={() => onChangeMode("signup")}
    className="text-gray-700 hover:underline"
  >
    Solicitar creación de cuenta
  </button>
</div>
*/}


      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-600 text-white py-2.5 font-medium shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
      >
        Ingresar
      </button>
    </form>
  );
}

function SignupView({ onChangeMode }) {
  const [form, setForm] = useState({
    empresa: "",
    nit: "",
    nombres: "",
    telefono: "",
    cargo: "",
    email: "",
    pass: "",
    pass2: "",
    acepta: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.empresa.trim()) e.empresa = "Requerido";
    if (!NIT_RE.test(form.nit)) e.nit = "NIT inválido (solo dígitos y opcional -dígito)";
    if (!form.nombres.trim()) e.nombres = "Requerido";
    if (!PHONE_RE.test(form.telefono)) e.telefono = "Teléfono inválido";
    if (!form.cargo.trim()) e.cargo = "Requerido";
    if (!EMAIL_RE.test(form.email)) e.email = "Correo inválido";
    if (form.pass.length < 8) e.pass = "Mínimo 8 caracteres";
    if (form.pass !== form.pass2) e.pass2 = "Las contraseñas no coinciden";
    if (!form.acepta) e.acepta = "Debes aceptar el tratamiento de datos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      // TODO: Reemplaza por tu endpoint real, por ejemplo:
      // await api.post('/auth/register', form)
      await new Promise((r) => setTimeout(r, 800));
      alert("Solicitud enviada (demo). Te notificaremos por correo cuando sea aprobada.");
      onChangeMode("login");
    } catch (err) {
      alert("No fue posible completar el registro. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <header className="mb-2">
        <h2 className="text-xl font-semibold text-gray-900">Crear cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">Completa los datos para validar tu acceso como cliente.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nombre de la empresa" required>
          <input
            type="text" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={form.empresa} onChange={(e) => set("empresa", e.target.value)} required
          />
          <ErrorMsg msg={errors.empresa} />
        </Field>

        <Field label="NIT de la empresa" required>
          <input
            type="text" inputMode="numeric" placeholder="Ej: 900123456-7"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={form.nit} onChange={(e) => set("nit", e.target.value)} required
          />
          <ErrorMsg msg={errors.nit} />
        </Field>

        <Field label="Nombre y apellido" required>
          <input
            type="text" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={form.nombres} onChange={(e) => set("nombres", e.target.value)} required
          />
          <ErrorMsg msg={errors.nombres} />
        </Field>

        <Field label="Teléfono" required>
          <input
            type="tel" placeholder="Ej: +57 310 123 4567"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={form.telefono} onChange={(e) => set("telefono", e.target.value)} required
          />
          <ErrorMsg msg={errors.telefono} />
        </Field>

        <Field label="Cargo" required>
          <input
            type="text" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={form.cargo} onChange={(e) => set("cargo", e.target.value)} required
          />
          <ErrorMsg msg={errors.cargo} />
        </Field>

        <Field label="Correo electrónico" required>
          <input
            type="email" placeholder="tucorreo@empresa.com"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={form.email} onChange={(e) => set("email", e.target.value)} required
          />
          <ErrorMsg msg={errors.email} />
        </Field>

        <Field label="Crear contraseña" required>
          <input
            type="password" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={form.pass} onChange={(e) => set("pass", e.target.value)} required minLength={8}
          />
          <PasswordMeter value={form.pass} />
          <ErrorMsg msg={errors.pass} />
        </Field>

        <Field label="Repetir contraseña" required>
          <input
            type="password" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={form.pass2} onChange={(e) => set("pass2", e.target.value)} required minLength={8}
          />
          <ErrorMsg msg={errors.pass2} />
        </Field>
      </div>

      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" checked={form.acepta} onChange={(e) => set("acepta", e.target.checked)} />
        <span>Acepto el tratamiento de datos y la política de privacidad de INGETES S.A.S.</span>
      </label>
      <ErrorMsg msg={errors.acepta} />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className={cn("rounded-xl bg-emerald-600 text-white px-5 py-2.5 font-medium shadow-md hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100", loading && "opacity-70 cursor-not-allowed")}
        >
          {loading ? "Enviando…" : "Solicitar creación de cuenta"}
        </button>
        <button type="button" onClick={() => onChangeMode("login")} className="text-gray-700 hover:underline text-sm">
          Volver al inicio de sesión
        </button>
      </div>
    </form>
  );
}

function ForgotView({ onChangeMode }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Ingresa un correo válido");
      return;
    }
    setError("");
    try {
      setLoading(true);
      // TODO: Llama tu endpoint real:
      // await api.post('/auth/recover', { email })
      await new Promise((r) => setTimeout(r, 700));
      alert("Si el correo existe, enviaremos instrucciones para restablecer tu contraseña.");
      onChangeMode("login");
    } catch (err) {
      alert("No fue posible procesar la solicitud. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <header className="mb-2">
        <h2 className="text-xl font-semibold text-gray-900">Recuperar contraseña</h2>
        <p className="text-sm text-gray-500 mt-1">Ingresa el correo electrónico con el que te registraste.</p>
      </header>

      <Field label="Correo electrónico" required>
        <input
          type="email"
          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          placeholder="tucorreo@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <ErrorMsg msg={error} />
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className={cn("rounded-xl bg-emerald-600 text-white px-5 py-2.5 font-medium shadow-md hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100", loading && "opacity-70 cursor-not-allowed")}
        >
          {loading ? "Enviando…" : "Enviar enlace de recuperación"}
        </button>
        <button type="button" onClick={() => onChangeMode("login")} className="text-gray-700 hover:underline text-sm">
          Volver al inicio de sesión
        </button>
      </div>
    </form>
  );
}
