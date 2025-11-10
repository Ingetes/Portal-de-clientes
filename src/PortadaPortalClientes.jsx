import React, { useEffect, useState } from 'react';

const logoIngecap = `${import.meta.env.BASE_URL}ingecap.jpg`;
// cerca de los otros const de imágenes, al inicio del archivo:
const logoIngetes = `${import.meta.env.BASE_URL}ingetes.png`;

const BASE = import.meta.env.BASE_URL;
const DOCS = {
  siemens:    `${BASE}Listaprecios2025.pdf`,
  innomotics: `${BASE}Listapreciosinnomotics.pdf`,
  inventario: `${BASE}INVENTARIO.xlsx`,
  promo:      `${BASE}inventario-promocion.xlsx`,
  liner:      `${BASE}Siemens%20Liner%20Full%20New.pdf`,
  chemical:   `${BASE}Chemical_Resistance_Chart_202106.pdf`,
  celdas:     `${BASE}manual%20de%20celdas%20y%20MODULOS%20DE%20PESAJE%20RICE%20LAKE%20en%20español.pdf`,
};
// === Archivos editables desde "Ajustes" (coinciden con los que sirves en GH Pages)
const EDITABLE_FILES = [
  { key: 'siemens',    label: 'Lista de precios Siemens (PDF)',     path: 'public/Listaprecios2025.pdf',                                  url: `${import.meta.env.BASE_URL}Listaprecios2025.pdf` },
  { key: 'innomotics', label: 'Lista de precios Innomotics (PDF)',  path: 'public/Listapreciosinnomotics.pdf',                            url: `${import.meta.env.BASE_URL}Listapreciosinnomotics.pdf` },
  { key: 'inventario', label: 'Inventario INGETES (XLSX)',          path: 'public/INVENTARIO.xlsx',                                       url: `${import.meta.env.BASE_URL}INVENTARIO.xlsx` },
  { key: 'promo',      label: 'Inventario en Promoción (XLSX)',     path: 'public/inventario-promocion.xlsx',                             url: `${import.meta.env.BASE_URL}inventario-promocion.xlsx` },
  { key: 'liner',      label: 'Siemens Liner (PDF)',                path: 'public/Siemens%20Liner%20Full%20New.pdf',                      url: `${import.meta.env.BASE_URL}Siemens%20Liner%20Full%20New.pdf` },
  { key: 'chemical',   label: 'Chemical Resistance Chart (PDF)',    path: 'public/Chemical_Resistance_Chart_202106.pdf',                  url: `${import.meta.env.BASE_URL}Chemical_Resistance_Chart_202106.pdf` },
  { key: 'celdas',     label: 'Guía celdas de carga (PDF)',         path: 'public/manual%20de%20celdas%20y%20MODULOS%20DE%20PESAJE%20RICE%20LAKE%20en%20español.pdf', url: `${import.meta.env.BASE_URL}manual%20de%20celdas%20y%20MODULOS%20DE%20PESAJE%20RICE%20LAKE%20en%20español.pdf` },
];

// === ENDPOINT del repo de Vercel que hará el commit al repositorio CORRESPONDIENTE
// (cámbialo por tu URL real)
const UPLOAD_ENDPOINT = 'https://portal-de-clientes.vercel.app/api/upload';

// === GitHub repo info (main y gh-pages)
const REPO = { owner: 'ingetes', repo: 'Portal-de-clientes', main: 'main', pages: 'gh-pages' };

// saca el "path" del archivo dentro del repo a partir de la URL pública
function pathFromUrl(u) {
  try {
    const base = import.meta.env.BASE_URL; // p.ej. /Portal-de-clientes/
    const url  = new URL(u, window.location.origin);
    const root = new URL(base, window.location.origin);
    // /Portal-de-clientes/Listaprecios2025.pdf  ->  public/Listaprecios2025.pdf
    let p = url.pathname.replace(root.pathname, '');
    p = decodeURIComponent(p);
    if (!p.startsWith('public/')) p = 'public/' + p;
    return p;
  } catch {
    return '';
  }
}

// Único helper para construir el src del visor (PDF.js o nativo)
function buildViewerSrc(href, q = '', usePdf = true) {
  // Asegurar URL ABSOLUTA del PDF (importante cuando el visor está en otro dominio)
  const fileUrl = (() => {
    try {
      // Si ya viene con http(s) lo dejamos; si no, lo resolvemos contra el origin
      return href.startsWith('http')
        ? href
        : new URL(href, window.location.origin).href;
    } catch {
      // fallback por si algo raro pasa
      return href;
    }
  })();

  if (usePdf) {
    // Visor PDF.js hospedado por Mozilla
    const viewer = 'https://mozilla.github.io/pdf.js/web/viewer.html';
    const fileParam = `?file=${encodeURIComponent(fileUrl)}`;
    const hash = q ? `#search=${encodeURIComponent(q)}` : '';
    return `${viewer}${fileParam}${hash}`;
  }

  // Visor nativo del navegador (la URL puede ser relativa o absoluta)
  const base = fileUrl.split('#')[0];
  const hash = q ? `#search=${encodeURIComponent(q)}` : '#toolbar=1';
  return `${base}${hash}`;
}

// Formatos útiles
function formatDateES(d) {
  if (!d) return '—';
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}
function bytesToSize(b) {
  const n = Number(b || 0);
  if (!Number.isFinite(n) || n <= 0) return '—';
  const u = ['B','KB','MB','GB','TB'];
  const i = Math.min(Math.floor(Math.log(n)/Math.log(1024)), u.length-1);
  return `${(n/Math.pow(1024,i)).toFixed(i ? 2 : 0)} ${u[i]}`;
}

// helpers de UI para estilos consistentes
const ui = {
  label: "block text-xs text-slate-600 mb-1",
  input:
    "w-full rounded-xl border border-slate-300 px-3 py-2 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600",
  select:
    "w-28 rounded-xl border border-slate-300 px-2 py-2 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600",
  textarea:
    "w-full rounded-xl border border-slate-300 px-3 py-2 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600",
  card: "rounded-2xl border border-slate-200 p-4",
  btnPrimary: "rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2",
  btnGhost:
    "rounded-xl bg-white text-slate-700 font-semibold ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
  btnOutlineGreen:
    "rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold px-3 py-2",
  pill: "text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200",
};

// ==========================================================
// Tracking helper (cliente)
// ==========================================================
function track(event, payload = {}) {
  try {
    const baseKey = `trk:${event}`;
    const count = parseInt(localStorage.getItem(baseKey) || '0', 10) + 1;
    localStorage.setItem(baseKey, String(count));

    const parts = [event, payload.tool, payload.action].filter(Boolean);
    if (parts.length > 1) {
      const detailKey = `trk:${parts.join(':')}`;
      const d = parseInt(localStorage.getItem(detailKey) || '0', 10) + 1;
      localStorage.setItem(detailKey, String(d));
    }

    const body = JSON.stringify({ event, payload, ts: Date.now(), count });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    }
  } catch (e) {
    // no-op
  }
}

// Simple event emitter for cross-component actions
const emit = (type, detail = {}) => {
  try { window.dispatchEvent(new CustomEvent(type, { detail })); } catch {}
};

// ==========================================================
// App (router por hash) + Chatbot con comandos que accionan el portal
// ==========================================================
export default function PortalDistribuidoresLanding() {
  const [chatOpen, setChatOpen] = useState(false);
  const [route, setRoute] = useState(
  typeof window !== 'undefined' ? (window.location.hash || '#ingresar') : '#ingresar'
);
  // NUEVO: estado para el modal de Ajustes
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Control de acceso a INGECAP (placeholder, luego se conectará a backend/auth)
  const [hasIngecapAccess, setHasIngecapAccess] = useState(false);

useEffect(() => {
  // si entran sin hash, forzar #ingresar
  if (!window.location.hash) window.location.hash = '#ingresar';

  const onHash = () => setRoute(window.location.hash || '#ingresar');
  window.addEventListener('hashchange', onHash);

  // contar sesión local para KPIs
  const key = 'trk:session_count';
  const curr = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, String(curr));

  return () => window.removeEventListener('hashchange', onHash);
}, []);

// Desplazamiento inteligente según la ruta
useEffect(() => {
  const isHome = route === '#home' || route === '#ingresar' || route === '' || !route;

  // Si abro una sección (no home), siempre sube al inicio
  if (!isHome) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }

  // Si estoy regresando a home desde "Volver"
  const shouldScrollToCards = sessionStorage.getItem("scrollToCards") === "true";
  if (shouldScrollToCards) {
    sessionStorage.removeItem("scrollToCards");
    const el = document.getElementById('como-empezar');
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
    return;
  }

  // Por defecto: volver al inicio
  window.scrollTo({ top: 0, behavior: 'instant' });
}, [route]);

  // ---------------- Chatbot state & handlers ----------------
  const [messages, setMessages] = useState([
    { from: 'bot', text: '¡Hola! Soy tu asistente. Puedo navegar por el portal, abrir visores PDF y ayudarte con el Cotizador Rápido. Escribe "ayuda" para ver comandos.' }
  ]);
  const [input, setInput] = useState('');
  // === Menú Documentos en el chatbot ===
const [showDocsMenu, setShowDocsMenu] = useState(false);
const docsMenu = [
  { label: 'Lista de precios Siemens',   href: DOCS.siemens },
  { label: 'Lista de precios Innomotics', href: DOCS.innomotics },
  { label: 'Inventario INGETES',         href: DOCS.inventario },
  { label: 'Inventario en Promoción',    href: DOCS.promo, locked: true }, // marcado como restringido
];
  // === Menú Herramientas en el chatbot ===
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const toolsMenu = [
    { title: 'TIA SELECTION TOOL', actions: [
      { label: 'Descargar software', href: 'https://www.siemens.com/tia-selection-tool-standalone', external: true },
      { label: 'Abrir en Nube', href: 'https://www.siemens.com/tstcloud', external: true }
    ]},
    { title: 'PIA SELECTION TOOL', actions: [
      { label: 'Abrir', href: 'https://www.pia-portal.automation.siemens.com/default.htm', external: true }
    ]},
    { title: 'Configurador de variadores y servomotores SIEMENS', actions: [
      { label: 'Abrir', href: 'https://mall.industry.siemens.com/spice/cloudcm/dashboard?caller=SPC', external: true }
    ]},
    { title: 'Compatibilidad de liner', actions: [
      { label: 'Vista previa', href: DOCS.liner, modal: true }
    ]},
    { title: 'Tabla de compatibilidad de materiales', actions: [
      { label: 'Abrir', href: 'https://www.coleparmer.com/chemical-resistance', external: true },
      { label: 'Vista previa', href: DOCS.chemical, modal: true }
    ]},
    { title: 'Guía de selección de celdas de carga', actions: [
      { label: 'Vista previa', href: DOCS.celdas, modal: true }
    ]}
  ];
  // Tests rápidos
  useEffect(() => {
    console.assert(toolsMenu.length === 6, 'El menú Herramientas debe tener 6 opciones');
  }, []);
  const chatDownload = async (url) => {
    const encoded = encodeURI(url);
    const name = (() => { try { const clean = encoded.split('#')[0].split('?')[0]; const last = clean.substring(clean.lastIndexOf('/') + 1) || 'documento'; return decodeURIComponent(last);} catch { return 'documento'; } })();
    track('chat_doc_download', { href: encoded, name });
    try { const res = await fetch(encoded, { mode: 'cors', credentials: 'omit' }); if (!res.ok) throw new Error('HTTP ' + res.status); const blob = await res.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },0); return; } catch {}
    window.open(encoded, '_blank', 'noopener');
  };
  useEffect(() => { console.assert(docsMenu.length === 4, 'DocsMenu debe tener 4 opciones'); console.assert(docsMenu[0].label.includes('Siemens'), 'Primera opción debe ser Siemens'); }, []);
  const push = (msg) => setMessages((m) => [...m, msg]);
  const go = (hash) => { window.location.hash = hash; track('chat_navigate', { to: hash }); };

  const handleCommand = (raw) => {
    const txt = (raw || '').trim();
    if (!txt) return;
    const lower = txt.toLowerCase();

    // Ayuda
    if (lower === 'ayuda' || lower === '/help') {
      push({ from: 'bot', text: [
        'Comandos disponibles:',
        '• ir documentos | ir herramientas | ir cotizador',
        '• buscar <REF> → abre la lista Siemens y busca la referencia',
        '• tia | pia | configurador',
        '• liner | materiales | guia (abre visor en modal)',
        '• zip documentos (descargar todo)'
      ].join('\n') });
      return;
    }

    // Navegación
    if (lower === 'ir documentos' || lower === '/doc') { go('#documentos'); return; }
    if (lower === 'ir herramientas' || lower === '/her') { go('#herramientas'); return; }
    if (lower === 'ir cotizador' || lower === '/cot') { go('#cotizador'); return; }

    // Accesos directos externos
    if (lower === 'tia') {
      track('chat_open', { tool: 'TIA' });
      window.open('https://www.siemens.com/tia-selection-tool-standalone', '_blank', 'noopener');
      push({ from:'bot', text:'Abriendo TIA Selection Tool en una nueva pestaña.'});
      return;
    }
    if (lower === 'pia') {
      track('chat_open', { tool: 'PIA' });
      window.open('https://www.pia-portal.automation.siemens.com/default.htm', '_blank', 'noopener');
      push({ from:'bot', text:'Abriendo PIA Selection Tool en una nueva pestaña.'});
      return;
    }
    if (lower === 'configurador') {
      track('chat_open', { tool: 'Configurador' });
      window.open('https://mall.industry.siemens.com/spice/cloudcm/dashboard?caller=SPC', '_blank', 'noopener');
      push({ from:'bot', text:'Abriendo Configurador de variadores y servomotores SIEMENS.'});
      return;
    }

    // Abrir visores en modal dentro de Herramientas
    if (lower === 'liner') {
      go('#herramientas');
      emit('portal:openPreview', { section: 'documentos', title: 'Compatibilidad de liner', href: DOCS.liner, search: '' });
      push({ from:'bot', text:'Abriendo "Compatibilidad de liner" en visor interno.'});
      return;
    }
    if (lower === 'materiales') {
      go('#herramientas');
      emit('portal:openPreview', { section: 'documentos', title: 'Tabla de compatibilidad de materiales', href: DOCS.chemical, search: '' });
      push({ from:'bot', text:'Abriendo "Tabla de compatibilidad de materiales" en visor interno.'});
      return;
    }
    if (lower === 'guia' || lower === 'guía') {
      go('#herramientas');
      emit('portal:openPreview', { section: 'documentos', title: 'Guia de seleccion de celdas de carga', href: DOCS.celdas, search: '' });
      push({ from:'bot', text:'Abriendo "Guía de selección de celdas de carga" en visor interno.'});
      return;
    }

    // Buscar referencia en la lista Siemens
    if (lower.startsWith('buscar ')) {
      const ref = txt.slice(7).trim();
      if (!ref) { push({ from:'bot', text:'Escribe: buscar <REFERENCIA> (ej. 3RT2016-1AN21)'}); return; }
      go('#documentos');
      emit('portal:openPreview', { section: 'documentos', title: 'Lista de precios Siemens', href: DOCS.siemens, search: ref, usePdfJs: true });
      push({ from:'bot', text:`Buscando "${ref}" en la Lista de precios Siemens...` });
      return;
    }

    // Descargar ZIP de Documentos
    if (lower === 'zip documentos') {
      go('#documentos');
      emit('portal:zipAll', {});
      push({ from:'bot', text:'Iniciando descarga del ZIP de documentos.'});
      return;
    }

    push({ from: 'bot', text: 'No entendí ese comando. Escribe "ayuda" para ver opciones.' });
  };

  const onSend = () => {
    const txt = input;
    if (!txt.trim()) return;
    setMessages((m) => [...m, { from: 'you', text: txt }]);
    setInput('');
    handleCommand(txt);
  };

// justo encima del return ya tienes estos estados; mantenlos:
const [scrollY, setScrollY] = useState(0);
useEffect(() => {
  const onScroll = () => setScrollY(window.scrollY || window.pageYOffset || 0);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);

// Flag global para saber si hay un visor/overlay abierto
const [overlayActive, setOverlayActive] = useState(false);
useEffect(() => {
  const onOverlay = (e) => setOverlayActive(!!(e?.detail?.active));
  window.addEventListener('portal:overlay', onOverlay);
  return () => window.removeEventListener('portal:overlay', onOverlay);
}, []);

// Guard de autenticación: si no hay sesión, solo permite #ingresar
useEffect(() => {
  const enforce = () => {
    const ok = localStorage.getItem("isLoggedIn") === "true";
    const hash = window.location.hash || "#ingresar";
    if (!ok && hash !== "#ingresar") window.location.hash = "#ingresar";
    if (ok && hash === "#ingresar") window.location.hash = "#home";
  };
  enforce();
  window.addEventListener("hashchange", enforce);
  return () => window.removeEventListener("hashchange", enforce);
}, []);
  
  return (
<div className="relative min-h-screen bg-transparent">

{/* Fondo institucional global (marca de agua INGETES solo en el cuerpo, no en header/footer) */}
<div className="absolute inset-0 z-0 pointer-events-none select-none" aria-hidden>
  <img
    src={`${import.meta.env.BASE_URL}ingetes.png`}
    onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}ingetes.png`; }}
    alt="Marca de agua INGETES"
style={{
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, calc(-62% + ${scrollY * 0.22}px))`,
  width: 'min(1300px, 90vw)',
  opacity: 0.18,
  filter: 'grayscale(20%)',
  transition: 'transform 0.10s ease-out',
  willChange: 'transform',
}}
  />
</div>

{/* Marca lateral flotante */}
<img
  src={`${import.meta.env.BASE_URL}ingetes.png`}
  alt="Logo INGETES"
  className="fixed top-1/2 right-0 w-24 opacity-20 translate-y-[-50%] pointer-events-none select-none"
/>
      <Header onOpenSettings={() => setSettingsOpen(true)} overlayActive={overlayActive} />
{route === '#marcas' ? (
  <MarcasAliadasScreen />
) : route === '#comerciales' ? (
  <ComercialesScreen />
) : route === '#outsourcing' ? (
  <OutsourcingScreen />
) : route === '#ingresar' ? (
  <PortalClientesAuth />
) : route === '#documentos' ? (
  <DocumentosScreen />
) : route === '#herramientas' ? (
  <HerramientasScreen />
) : route === '#cotizador' ? (
  <CotizadorRapidoScreen />
) : route === '#ingecap' ? (
  <IngecapScreen hasAccess={hasIngecapAccess} setHasAccess={setHasIngecapAccess} />
) : route === '#stats' ? (
  <StatsScreen />
) : (
  <Landing setChatOpen={setChatOpen} chatOpen={chatOpen} />
)}

      {/* Botón flotante del Asistente */}
<button
  onClick={() => setChatOpen(v => !v)}
  className="fixed bottom-6 right-6 z-[80] pointer-events-auto rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg px-5 py-3"
  aria-label="Abrir asistente virtual"
>
  {chatOpen ? 'Cerrar Asistente' : 'Asistente'}
</button>

      {/* Panel del Chatbot con comandos */}
{chatOpen && (
  <div className="fixed bottom-24 right-6 z-[75] w-[380px] max-w-[92vw] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="bg-emerald-600 text-white px-4 py-3 font-semibold flex items-center justify-between">
            <span>Asistente Virtual INGETES</span>
            <div className="flex gap-2 text-xs">
              <button onClick={()=>{setMessages([{ from:'bot', text:'Sesión reiniciada. Escribe "ayuda" para ver comandos.' }]); track('chat_reset');}} className="underline">Reiniciar</button>
              <button onClick={()=>{window.location.hash='#stats'; setChatOpen(false);}} className="underline">Ver stats</button>
            </div>
          </div>

          <div className="p-3 h-80 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'bot' ? 'bg-slate-50 border border-slate-200 rounded-xl p-2.5' : 'text-right'}>
                {m.from === 'you' ? <span className="inline-block bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">{m.text}</span> : m.text.split('\n').map((line, idx)=> <p key={idx}>{line}</p>)}
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              {/* Acceso directo al Cotizador Rápido */}
              <button
                onClick={() => { track('chat_quick_cotizador'); window.location.hash = '#cotizador'; }}
                className="px-3 py-1 rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs"
              >
                Cotizador Rápido
              </button>

              {/* Toggle del menú Documentos */}
              <button onClick={() => { setShowDocsMenu(s => !s); track('chat_toggle_docs', { open: !showDocsMenu }); }} className="px-3 py-1 rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs">{showDocsMenu ? 'Ocultar Documentos' : 'Documentos'}</button>

              {/* Menú de documentos (descarga directa) */}
                  {showDocsMenu && (
                    <div className="w-full mt-2 border border-slate-200 rounded-xl p-2 bg-white">
                      <p className="text-xs text-slate-600 mb-2">Descargas rápidas:</p>
                      <div className="flex flex-col gap-2">
                        {docsMenu.map((d, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (d.locked) {
                                window.location.hash = '#ingecap';
                                alert('Inventario en Promoción.');
                                return;
                              }
                              chatDownload(d.href);
                            }}
                            className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200"
                          >
                            {d.label}{d.locked ? ' · Requiere membresía' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                    )}

              {/* Toggle del menú Herramientas */}
              <button onClick={() => { setShowToolsMenu(s => !s); track('chat_toggle_tools', { open: !showToolsMenu }); }} className="px-3 py-1 rounded-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs">{showToolsMenu ? 'Ocultar Herramientas' : 'Herramientas'}</button>

              {/* Menú de Herramientas */}
              {showToolsMenu && (
                <div className="w-full mt-2 border border-slate-200 rounded-xl p-2 bg-white">
                  <p className="text-xs text-slate-600 mb-2">Accesos y visores:</p>
                  <div className="flex flex-col gap-2">
                    {toolsMenu.map((t, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {t.actions.map((a, j) => (
                            a.modal ? (
                              <button key={j} onClick={() => { track('chat_tool_action', { tool: t.title, action: a.label }); window.location.hash = '#herramientas'; emit('portal:openPreview', { section: 'herramientas', title: t.title, href: a.href, search: '' }); }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5">{a.label}</button>
                            ) : (
                              <a key={j} href={a.href} target="_blank" rel="noopener" onClick={() => track('chat_tool_action', { tool: t.title, action: a.label })} className="rounded-xl bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5">{a.label}</a>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-slate-200 p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter') onSend(); }}
              placeholder="Escribe un comando"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button onClick={onSend} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2">Enviar</button>
          </div>
        </div>
      )}
{/* === Modal de Ajustes (subida con clave) === */}
<SettingsModal
  open={settingsOpen}
  onClose={() => setSettingsOpen(false)}
  files={EDITABLE_FILES}
  endpoint={UPLOAD_ENDPOINT}
  onUpdated={(results) => {
    // results: [{ key, ok, msg, bust }]
    // Notificamos a las pantallas para que rompan caché de los archivos cambiados
    emit('portal:filesUpdated', { results });
  }}
/>
      <Footer />
    </div>
  );
}

// ==========================================================
// Header
// ==========================================================
function Header({ onOpenSettings, overlayActive }) {
  return (
    <>
      {/* Franja corporativa superior */}
      <div className="w-full h-2 bg-emerald-700" />

<header  className={`w-full sticky top-0 ${overlayActive ? 'z-0' : 'z-40'} backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoIngetes} alt="INGETES" className="h-10 w-auto" />
          <div className="hidden md:block">
            <p className="text-xs uppercase tracking-widest text-slate-500">Portal para Canales de Distribucion</p>
            <p className="text-sm font-medium text-slate-800">Fidelizacion - Cotizaciones - Listas de Precios</p>
          </div>
        </div>

{/* NAV + Botones principales */}
<nav className="flex items-center gap-3 text-sm overflow-x-auto md:overflow-visible whitespace-nowrap">
  {/* Botón Inicio */}
  <a
    className="text-slate-600 hover:text-emerald-700 px-3 py-1.5 font-semibold"
    href="#home"
  >
    Inicio
  </a>

  {/* Botón Cerrar sesión */}
  <button
    onClick={() => {
      localStorage.clear(); // limpia sesión local
      window.location.href = 'https://ingetes.github.io/Portal-de-clientes/#ingresar';
    }}
    className="text-slate-600 hover:text-red-700 px-3 py-1.5 font-semibold"
  >
    Cerrar sesión
  </button>

  {/* Botón Ajustes */}
  <button
    type="button"
    onClick={onOpenSettings}
    className="ml-2 rounded-xl bg-white text-slate-700 font-semibold ring-1 ring-inset ring-slate-300 hover:bg-slate-50 px-3 py-1.5"
    title="Ajustes (cambiar PDFs/XLSX publicados)"
  >
    ⚙️ Ajustes
  </button>
</nav>
      </div>
      </header>
    </>
  );
}

// Fotos de comerciales (en /public/)
const IMG_BASE = `${import.meta.env.BASE_URL}`;
const COM_FOTOS = {
  JSG: 'Sebastian.png',
  PCR: 'Pablo.png',
  KAC: 'Karen.png',
  LNM: 'Lizeth.png',
  HBR: 'hernan.png',   // tal como la subiste
  CPR: 'Claudia.png',
  JSO: 'Jhoan.png',
};

const COMERCIALES = {
  JSG:{ 
    nombre:"JUAN SEBASTIAN GARZON", 
    cargo:"Director Comercial", 
    email:"jgarzon@ingetes.com", 
    telefono:"311-898-2684", 
    office:"BOGOTÁ",
    especialidad:"Especialista en soluciones para industria de lácteos",
    foto: IMG_BASE + COM_FOTOS.JSG
  },
  PCR:{ 
    nombre:"PABLO CESAR RODRIGUEZ", 
    cargo:"Gerente", 
    email:"pcr@ingetes.com", 
    telefono:"311-810-5540",  // ← actualizado
    office:"BOGOTÁ",
    especialidad:"Especialista en soluciones de analítica de gases · Especialista en pesaje dinámico",
    foto: IMG_BASE + COM_FOTOS.PCR
  },
  HBR:{  
    nombre:"HERNAN ROLDAN", 
    cargo:"Ingeniero Comercial", 
    email:"hbroldan@ingetes.com.co",  
    telefono:"314-336-8795", 
    office:"BOGOTÁ",
    especialidad:"Especialista en soluciones de transformación digital",
    foto: IMG_BASE + COM_FOTOS.HBR
  },
  KAC:{  
    nombre:"KAREN ARIANA CARRILLO", 
    cargo:"Ingeniera Comercial", 
    email:"kcarrillo@ingetes.com.co",  
    telefono:"312-326-3066", 
    office:"BOGOTÁ",
    especialidad:"Especialista en soluciones de medición de caudal · Instrumentista",
    foto: IMG_BASE + COM_FOTOS.KAC
  },
  LNM:{  
    nombre:"LIZETH MARTINEZ", 
    cargo:"Ingeniera Comercial", 
    email:"lmartinez@ingetes.com.co",  
    telefono:"311-810-5540 - 317-381-0421", 
    office:"BOGOTÁ",
    especialidad:"Especialista en diseño e implementación de CCM's",
    foto: IMG_BASE + COM_FOTOS.LNM
  },
  CPR:{ 
    nombre:"CLAUDIA PATRICIA RODRIGUEZ", 
    cargo:"Ingeniera Comercial", 
    email:"crodriguez@ingetes.com", 
    telefono:"310-342-3006", 
    office:"BOGOTÁ",
    especialidad:"Especialista en diseño e implementación de SCADAs",
    foto: IMG_BASE + COM_FOTOS.CPR
  },
  JSO:{  
    nombre:"JHOAN SEBASTIAN ORTIZ", 
    cargo:"Ingeniero Comercial", 
    email:"sortiz@ingetes.com.co",  
    telefono:"312-451-9098", 
    office:"BOGOTÁ",
    especialidad:"Especialista en automatización y pesaje",
    foto: IMG_BASE + COM_FOTOS.JSO
  }
};

// ==========================================================
// Landing (home)
// ==========================================================
function Landing({ setChatOpen, chatOpen }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-slate-900">
  Portal{" "}
  <span
    className="text-[#f97316] font-semibold transition-all duration-300 ease-in-out hover:drop-shadow-[0_3px_6px_rgba(249,115,22,0.45)] hover:brightness-110"
    style={{ letterSpacing: "0.015em" }}
  >
    AFFIRMATUM PARTNERS
  </span>{" "}
  <span className="text-[#007A63] font-bold">INGETES</span>
</h1>
            <p className="mt-4 text-lg text-slate-700" id="proposito">Este portal es un espacio exclusivo para clientes que mantienen una relación comercial con INGETES. Aquí encontrarás documentación que facilita la elaboración de ofertas, herramientas para la selección de equipos y el diseño de tus proyectos, un cotizador para crear propuestas rápidas a tus clientes y acceso a privilegios exclusivos para miembros de INGECAP.</p>
            </div>
          <div className="relative">
<div className="bg-white rounded-3xl shadow-lg p-0 overflow-hidden w-full md:w-[480px] flex justify-center items-center">
  <video
    src={`${import.meta.env.BASE_URL}ingetes.mp4`} 
    controls
    autoPlay
    muted
    loop
    playsInline
    className="w-full h-full object-cover rounded-3xl"
  />
</div>
          </div>
        </div>
      </section>

{/* Como empezar */}
<section id="como-empezar" className="border-t border-slate-100 bg-transparent">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-6">
    {[
      { title: '1. Ingresar a INGECAP', desc: 'Centro de experiencia e innovación.', cta: 'Ingresar', href: '#ingecap' , locked: true },
      { title: '2. Descarga listas y documentos', desc: 'Encuentra listas de precios Siemens, plantillas y guías de cotización.', cta: 'Ir a documentos', href: '#documentos' },
      { title: '3. Herramientas comerciales para los canales', desc: 'Accede a utilidades de selección, compatibilidad y configuradores.', cta: 'Abrir herramientas', href: '#herramientas' },
      { title: '4. Cotizador Rápido', desc: 'Crea cotizaciones sencillas, aplica descuentos y visital el mall de siemens.', cta: 'Ingresar', href: '#cotizador' },
      { title: '5. Marcas aliadas', desc: 'Conoce los fabricantes y marcas que comercializa INGETES.', cta: 'Ver marcas', href: '#marcas' },
      { title: '6. Outsourcings autorizados', desc: 'Listado de aliados y proveedores certificados para servicios de automatización y control.', cta: 'Ver lista', href: '#outsourcing' },
      { title: '7. Integrantes comerciales', desc: 'Conoce al equipo comercial de INGETES y su especialización.', cta: 'Ver integrantes', href: '#comerciales' },
    ].map((card, idx) => (
      <div
        key={idx}
        className="relative rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-white"
      >
        {/* SOLO esta tarjeta queda “borrosa” y con candado */}
        {card.locked && (
          <div className="absolute inset-0 rounded-3xl bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center select-none">
              <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">🔒</div>
              <p className="text-xs text-slate-600 font-medium">EN CONSTRUCCIÓN.</p>
            </div>
          </div>
        )}

        <h4 className="text-lg font-bold text-slate-900">{card.title}</h4>
        <p className="mt-2 text-slate-700">{card.desc}</p>

        {/* Botón: deshabilitado si es la bloqueada */}
        {card.locked ? (
          <span className="mt-4 inline-block rounded-xl px-4 py-2 font-semibold bg-slate-100 text-slate-400 cursor-not-allowed select-none">
            {card.cta}
          </span>
        ) : (
          <a
            href={card.href}
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
          >
            {card.cta}
          </a>
        )}
      </div>
    ))}
  </div>
</section>
    </>
  );
}

function OutsourcingScreen() {
  return (
    <section id="outsourcing" className="min-h-[70vh] border-t border-slate-100 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700">Outsourcings autorizados</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">
              Estos son los aliados y proveedores certificados por INGETES para servicios de automatización, control e instrumentación industrial.
            </p>
          </div>
<a
  href="#home"
  onClick={() => sessionStorage.setItem("scrollToCards", "true")}
  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  ← Volver
</a>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            { name: 'AUTOMATIZAR LTDA', contact: 'contacto@automatizar.com', area: 'Control industrial' },
            { name: 'TECNIRED S.A.S.', contact: 'info@tecnired.com', area: 'Redes eléctricas y tableros' },
            { name: 'INGENIAL S.A.S.', contact: 'soporte@ingenial.co', area: 'Integración y soporte técnico' },
          ].map((p, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
              <p className="text-sm text-emerald-700 mt-1">{p.area}</p>
              <p className="text-sm text-slate-600 mt-2">✉️ <a href={`mailto:${p.contact}`} className="underline">{p.contact}</a></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComercialesScreen() {
  const data = Object.values(COMERCIALES);
  return (
<section id="comerciales" className="min-h-[70vh] border-t border-slate-100 bg-transparent relative z-10">
  {/* Marca de agua INGETES para toda la sección */}
  <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-10">
  </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700">Equipo Comercial INGETES</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">Conoce a nuestro equipo de ingeniería y ventas, su especialización y datos de contacto directo.</p>
          </div>
<a
  href="#home"
  onClick={() => sessionStorage.setItem("scrollToCards", "true")}
  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  ← Volver
</a>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.map((p, i) => (
<div
  key={i}
  className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
>
              {/* Imagen / Fallback */}
              <div className="relative -mx-2 -mt-2 mb-4 h-[273px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-slate-50">
                {/* Imagen, solo si hay ruta */}
                {p.foto && (
                  <img
                    src={p.foto}
                    alt={p.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // si falla, elimina la imagen y muestra el fallback
                      const parent = e.currentTarget.parentElement;
                      e.currentTarget.remove();
                      const fb = parent?.querySelector('[data-fallback]');
                      if (fb) fb.classList.remove('hidden');
                    }}
                  />
                )}
              
                {/* Fallback SIEMPRE renderizado: si hay foto inicia hidden; si no hay foto, visible */}
                <div
                  data-fallback
                  className={p.foto
                    ? "hidden absolute inset-0 flex items-center justify-center"
                    : "absolute inset-0 flex items-center justify-center"}
                >
                  <span className="text-5xl font-extrabold text-emerald-700/90">
                    {p.nombre
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
              </div>
        
              {/* Texto */}
              <h3 className="text-lg font-bold text-slate-900">{p.nombre}</h3>
              <p className="text-sm text-emerald-700 mt-1">{p.cargo}</p>
              {p.especialidad && (
                <p className="text-sm text-slate-600 mt-1 italic">{p.especialidad}</p>
              )}
              <p className="text-sm text-slate-600 mt-2">📍 {p.office}</p>
              <p className="text-sm text-slate-600 mt-1">📞 {p.telefono}</p>
              <p className="text-sm text-slate-600 mt-1">
                ✉️ <a href={`mailto:${p.email}`} className="underline underline-offset-2">{p.email}</a>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================================
// INGECAP (sección restringida)
// ==========================================================
function IngecapScreen({ hasAccess, setHasAccess }) {
  const features = [
    { k: 'cowork', title: 'Solicitar espacio COWORKING', desc: 'Reserva espacios colaborativos en la sede INGECAP para reuniones, pruebas o trabajo individual.' },
    { k: 'demos', title: 'Solicitar préstamo de demos', desc: 'Solicita equipos demo disponibles para pruebas, presentaciones o capacitación.' },
    { k: 'licencias', title: 'Solicitar acceso a licencias (Presencial)', desc: 'Acceso a licenciamiento para sesiones presenciales en nuestro centro de experiencia.' },
    { k: 'bloques', title: 'Venta de bloques técnicos de programación', desc: 'Paquetes de bloques de programación y librerías listas para usar.' }
  ];

  useEffect(() => { console.assert(features.length === 5, 'INGECAP debe tener 5 accesos'); }, []);

  const goHome = () => window.location.hash = '#home';

  return (
    <section id="ingecap" className="min-h-[70vh] border-t border-slate-100 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <img src={logoIngecap} alt="INGECAP" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700">INGECAP</h1>
            <p className="mt-1 text-sm font-semibold text-emerald-700">Centro de experiencia e innovación</p>
            <p className="mt-2 text-slate-700 max-w-2xl">Bienvenido a la membresía de <strong>INGECAP</strong>. Desde aquí podrás acceder a servicios exclusivos que potencian tus proyectos y ventas. Esta sección se mostrará completa únicamente a usuarios con acceso habilitado.</p>
          </div>
<a
  href="#home"
  onClick={() => sessionStorage.setItem("scrollToCards", "true")}
  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  ← Volver
</a>
        </div>

        {/* Banner de estado de acceso */}
        {!hasAccess && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <p className="font-semibold">Acceso restringido</p>
            <p className="text-sm mt-1">Para utilizar las funciones de INGECAP, solicita la habilitación a Dirección Comercial de INGETES.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => alert('Solicitud enviada (placeholder)')} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2">Solicitar habilitación</button>
              <button onClick={() => setHasAccess(true)} className="rounded-xl bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 text-sm font-semibold px-4 py-2">Simular acceso (dev)</button>
            </div>
          </div>
        )}

        {/* Grid de accesos */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <article key={f.k} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {!hasAccess && (
                <div className="absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">🔒</div>
                    <p className="text-xs text-slate-600">Requiere membresía INGECAP</p>
                  </div>
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-900">{i+1}. {f.title}</h3>
              <p className="mt-2 text-slate-700 text-sm">{f.desc}</p>
              <div className="mt-4">
                <button disabled={!hasAccess} onClick={() => alert(`${f.title} (placeholder)`)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${hasAccess ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Abrir</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarcasAliadasScreen() {
  const BASE = import.meta.env.BASE_URL;

  // Si subes logos, colócalos en /public/brands/ con estos nombres.
  // Si no existen, se muestra el nombre como chip.
const BRANDS = [
  { name: 'Siemens',       logo: `${BASE}Siemens.svg`,       href: 'https://mall.industry.siemens.com/goos/WelcomePage.aspx?language=es&regionUrl=/co' },
  { name: 'Innomotics',    logo: `${BASE}innomotics.svg`,    href: 'https://www.innomotics.com/' }, // si tienes link de catálogo específico, cámbialo aquí
  { name: 'Rice Lake',     logo: `${BASE}ricelake.png`,      href: 'https://www.ricelake.com/' },   // idem
  { name: 'Dini Argeo',    logo: `${BASE}diniargeo.png`,     href: 'https://dealer.diniargeo.es/' },
  { name: 'Conveyor Components Company', logo: `${BASE}CCC.png`, href: 'https://www.conveyorcomponents.com/catalog' },
  { name: 'Ecom',          logo: `${BASE}ecom.png`, href: 'https://spanish.ecomusa.com/ecom-product-range/' },
  { name: 'ASM Sensors',   logo: `${BASE}ASM.png`,           href: 'https://www.asm-sensor.com/en/' },
  { name: 'Neptronic',     logo: `${BASE}NEP.svg`,           href: 'https://www.neptronic.com/' },
  { name: 'INOR Transmitter', logo: `${BASE}inor.png`,       href: 'https://inor.com/' }
];

  return (
    <section id="marcas" className="min-h-[70vh] border-t border-slate-100 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700">Marcas aliadas</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">
              Estas son algunas de las marcas que comercializa INGETES. Haz clic para conocer más.
            </p>
          </div>
<a
  href="#home"
  onClick={() => sessionStorage.setItem("scrollToCards", "true")}
  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  ← Volver
</a>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {BRANDS.map((b, i) => (
            <a
              key={i}
              href={b.href}
              target="_blank"
              rel="noopener"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
              title={b.name}
            >
              {/* Logo (si existe). Si falla, ocultamos la imagen y mostramos el chip */}
              <img
                src={b.logo}
                alt={b.name}
                className="h-12 object-contain transition-opacity duration-200"
                onError={(e) => { e.currentTarget.style.display = 'none'; const next = e.currentTarget.nextElementSibling; if (next) next.classList.remove('hidden'); }}
              />
              {/* Chip fallback */}
              <span className="hidden text-sm font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {b.name}
              </span>

              <span className="pointer-events-none absolute inset-x-6 bottom-4 text-center text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Abrir sitio</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================================
// Documentos
// ==========================================================
function DocumentosScreen() {
  const [preview, setPreview] = React.useState(null);
  const [usePdfJs, setUsePdfJs] = React.useState(true);

  const [term, setTerm] = React.useState('');     // término de búsqueda para el visor pdf.js
  const [copied, setCopied] = React.useState(false); // flag para UI (lo ponemos aunque no lo muestres)

  const isPdf   = (u) => /\.pdf($|[?#])/i.test(u);
  const isExcel = (u) => /\.(xlsx?|csv)($|[?#])/i.test(u);

// URL absoluta (necesaria para el visor de Office)
const toAbsolute = (u) => {
  try { return new URL(u, window.location.origin).href; } catch { return u; }
};
// Visor online de Office para .xlsx/.xls/.csv
const buildOfficeViewerSrc = (u) =>
  `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(toAbsolute(u))}`;

// === Documentos ===
const [items, setItems] = React.useState([
  {
    key: 'siemens',
    title: 'Lista de precios Siemens',
    desc: 'Tarifas vigentes de productos Siemens para canales de distribución.',
    href: DOCS.siemens,
  },
  {
    key: 'innomotics',
    title: 'Lista de precios Innomotics',
    desc: 'Motores, variadores y soluciones de movimiento Innomotics.',
    href: DOCS.innomotics,
  },
  {
    key: 'inventario',
    title: 'Inventario INGETES',
    desc: (
      <>
        <span className="block text-slate-700">
          Stock disponible por referencia con fechas de reposición.
        </span>
        <p className="mt-3 text-sm text-slate-600 border-l-4 border-emerald-400 pl-3">
          📦 <strong>Inventario actualizado semanalmente:</strong> Los datos de stock pueden variar sin previo aviso.
          Por favor confirma la disponibilidad real con un asesor comercial antes de comprometer fechas de entrega.
        </p>
      </>
    ),
    href: DOCS.inventario,
  },
  {
    key: 'promo',
    title: 'Inventario en Promoción',
    desc: 'Lotes en promoción con descuentos y fechas límite.',
    href: DOCS.promo,
    locked: true,
  },
]);

// Actualiza fecha/tamaño y badge usando HEAD y/o último commit en GH
React.useEffect(() => {
async function fetchFileMeta(url) {
  const encoded = encodeURI((url || '').split('#')[0]);

  let updated = '—';
  let size = '—';
  let badge = '';

  // --- (A) Consultar commits desde GitHub ---
  let lastDate = null;
  let message = '';
  try {
    const pathPublic = pathFromUrl(url);
    const q = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/commits?path=${encodeURIComponent(pathPublic)}&sha=${REPO.main}&per_page=2`;
    const r = await fetch(q, { headers: { 'Accept': 'application/vnd.github+json' }, cache: 'no-store' });
    if (r.ok) {
      const arr = await r.json().catch(() => []);
      if (arr?.length) {
        const c = arr[0];
        lastDate = new Date(c.commit.committer.date);
        message = (c.commit.message || '').toLowerCase();
      }
    }
  } catch {}

  // --- (B) Tamaño ---
  try {
    const bust = (encoded.includes('?') ? '&' : '?') + 'v=' + Date.now();
    const r = await fetch(encoded + bust, { method: 'HEAD', cache: 'no-store' });
    if (r.ok) {
      const len = r.headers.get('content-length');
      if (len) size = bytesToSize(len);
    }
  } catch {}

  // --- (C) Determinar estado y fecha ---
  if (lastDate) {
    updated = formatDateES(lastDate);

    // Determinar badge según mensaje del commit
    if (message.includes('add files via upload')) {
      badge = 'Nuevo';
    } else if (message.includes('update')) {
      badge = 'Actualizado';
    } else {
      badge = '';
    }
  }

  return { updated, size, badge };
}

  async function refreshMeta() {
    const next = await Promise.all(
      items.map(async it => {
        const meta = await fetchFileMeta(it.href);
        return { ...it, ...meta };
      })
    );
    setItems(next);
  }

  refreshMeta();
  // Importante: al subir desde "Ajustes", cambiamos ?v=timestamp -> esto dispara el efecto
}, [items.map(it => it.href).join('|')]);

  const fileNameFromUrl = (url, fallback = 'documento') => {
    try {
      const clean = url.split('#')[0].split('?')[0];
      const last = clean.substring(clean.lastIndexOf('/') + 1) || fallback;
      return decodeURIComponent(last);
    } catch {
      return fallback;
    }
  };

// Reemplaza la función downloadFile por esta versión (en DocumentosScreen y HerramientasScreen)
const downloadFile = (url, suggestedName) => {
  const encoded = encodeURI(url); // respeta %20, etc.
  const name = suggestedName || (() => {
    try {
      const clean = encoded.split('#')[0].split('?')[0];
      return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1) || 'documento');
    } catch { return 'documento'; }
  })();

  const a = document.createElement('a');
  a.href = encoded;
  a.download = name;            // sugiere el nombre
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// Abrir modal (PDF con pdf.js o Excel con Office Viewer)
const openPreview = (item, q = '') => {
  // Romper caché para refrescar si acabas de subir el archivo
  let href = item.href;
  try {
    const u = new URL(item.href, window.location.origin);
    if (!u.search.includes('v=')) u.search = `?v=${Date.now()}`;
    href = u.pathname + u.search;
  } catch {}

  if (isPdf(href)) {
    const src = buildViewerSrc(href, q || term, usePdfJs);
    if (q) setTerm(q); else setTerm('');
    setPreview({ item: { ...item, href }, src });
    setCopied(false);
    emit('portal:overlay', { active: true });   // ← añade esta línea
    return;
  }

  if (isExcel(href)) {
    const src = buildOfficeViewerSrc(href);
    setTerm('');
    setPreview({ item: { ...item, href, key: item.key }, src });
    setCopied(false);
    return;
  }

  // Otros tipos: descargar
  alert('Este archivo no puede previsualizarse. Se descargará.');
  downloadFile(href);
};

  // ZIP (opcional: igual al que ya tenías; omito por brevedad)
  const [zipProgress, setZipProgress] = React.useState({ current: 0, total: 0, status: 'idle' });
// dentro de DocumentosScreen() — reemplaza TODA la función downloadAllZip por esto:
const downloadAllZip = async () => {
  try {
    setZipProgress({ current: 0, total: 0, status: 'loading' });

    // Cargamos librerías solo cuando se necesiten
    const [{ default: JSZip }, { saveAs }] = await Promise.all([
      import('jszip'),
      import('file-saver'),
    ]);

    const zip = new JSZip();

    // Toma los mismos items que renderizas en las tarjetas
    const files = items
      .filter((it) => !it.locked)  // no incluimos los bloqueados
      .map((it) => it.href);

    setZipProgress({ current: 0, total: files.length, status: 'fetching' });

    // Helper para nombre de archivo
    const toName = (url) => {
      try {
        const clean = url.split('#')[0].split('?')[0];
        return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1) || 'archivo');
      } catch { return 'archivo'; }
    };

    let done = 0;
    for (const href of files) {
      // usa la misma lógica que tus descargas individuales: respeta espacios, etc.
      const encoded = encodeURI(href);
      const res = await fetch(encoded, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error(`No se pudo obtener ${encoded} (HTTP ${res.status})`);
      const buf = await res.arrayBuffer();
      zip.file(toName(encoded), buf);
      done += 1;
      setZipProgress({ current: done, total: files.length, status: 'adding' });
    }

    setZipProgress((p) => ({ ...p, status: 'zipping' }));
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

    // nombre del zip (puedes cambiarlo)
    saveAs(blob, 'Documentos_INGETES.zip');
    setZipProgress({ current: files.length, total: files.length, status: 'done' });
  } catch (err) {
    console.error(err);
    alert('No se pudo crear el ZIP. Revisa la consola.');
    setZipProgress({ current: 0, total: 0, status: 'idle' });
  }
};

  // Eventos desde el chatbot (opcional)
  React.useEffect(() => {
    const onOpen = (e) => {
      const d = e.detail || {};
      if (d.section !== 'documentos') return;
      const item = items.find(it => it.title.toLowerCase().includes('siemens')) || items[0];
      if (!item) return;
      openPreview(item, d.search || '');
    };
    window.addEventListener('portal:openPreview', onOpen);
    return () => window.removeEventListener('portal:openPreview', onOpen);
  }, []);

// Al final de DocumentosScreen(), antes del return, agrega:
React.useEffect(() => {
  const onFilesUpdated = (e) => {
    const { results = [] } = e.detail || {};
    if (!Array.isArray(results) || results.length === 0) return;

    // Para cada archivo OK, agregamos ?v=timestamp a su href
    setItems(prev => prev.map(it => {
      const hit = results.find(r => r.ok && r.key === it.key && r.bust);
      if (!hit) return it;

      // Limpia query previa y aplica bust nuevo
      try {
        const u = new URL(it.href, window.location.origin);
        u.search = hit.bust; // e.g. "?v=1699999999999"
        return { ...it, href: u.pathname + u.search };
      } catch {
        return { ...it, href: it.href + hit.bust };
      }
    }));
  };
  window.addEventListener('portal:filesUpdated', onFilesUpdated);
  return () => window.removeEventListener('portal:filesUpdated', onFilesUpdated);
}, []);

  return (
    <section id="documentos" className="min-h-[70vh] border-t border-slate-100 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700">Documentos & Listas de Precios</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">
              Descarga las listas de precios y archivos de inventario. Puedes previsualizar PDFs y buscar referencias.
            </p>
          </div>
 <a
  href="#home"
  onClick={() => sessionStorage.setItem("scrollToCards", "true")}
  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  ← Volver
</a>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
{items.map((item, i) => (
  <article
    key={i}
    className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
  >
              {item.locked && (
                <div className="absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">🔒</div>
                    <p className="text-xs text-slate-600">EN CONSTRUCCIÓN.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{item.badge}</span>
              </div>

              <p className="mt-2 text-slate-700 text-sm">{item.desc}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                <div>
                  <dt className="uppercase tracking-wider">Actualización</dt>
                  <dd className="mt-1">{item.updated}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Tamaño</dt>
                  <dd className="mt-1">{item.size}</dd>
                </div>
              </dl>

              <div className="mt-5 flex gap-3">
                {/* Mostrar botón Descargar solo si NO es Inventario INGETES */}
                {item.key !== 'inventario' && (
                  <button
                    onClick={() => {
                      if (item.locked) { 
                        window.location.hash = '#ingecap'; 
                        alert('Inventario en Promoción.'); 
                        return; 
                      }
                      downloadFile(item.href);
                    }}
                    className={`rounded-xl px-4 py-2 font-semibold ${
                      item.locked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                    disabled={item.locked}
                  >
                    Descargar
                  </button>
                )}
              
                {/* Mostrar botón Vista previa para PDFs o Excel */}
                {(isPdf(item.href) || isExcel(item.href)) && !item.locked && (
                  <button
                    onClick={() => openPreview(item)}
                    className="rounded-xl px-4 py-2 font-semibold bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  >
                    Vista previa
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <button onClick={downloadAllZip} className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-white font-semibold hover:bg-black">
            Descargar todo (.zip)
          </button>
        </div>
      </div>

      {/* Modal visor */}
      {preview && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{preview.item.title}</h3>
                <p className="text-xs text-slate-500">{preview.item.updated} • {preview.item.size}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Checkbox pdf.js -> recalcula el src al vuelo */}
                  {isPdf(preview.item.href) && (
                    <label className="hidden md:inline-flex items-center gap-2 mr-3 text-xs text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={usePdfJs}
                        onChange={(e) => {
                          const v = e.target.checked;
                          setUsePdfJs(v);
                          setPreview(p => p ? ({ ...p, src: buildViewerSrc(p.item.href, term, v) }) : p);
                        }}
                      />
                      Usar visor pdf.js
                    </label>
                  )}
                  {/* Mostrar botón Descargar solo si NO es Inventario INGETES */}
                  {preview.item.key !== 'inventario' && (
                    <button
                      onClick={() => downloadFile(preview.item.href, fileNameFromUrl(preview.item.href))}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-white text-sm font-semibold hover:bg-black"
                    >
                      Descargar
                    </button>
                  )}
                  
                  <button
                    onClick={() => { setPreview(null); emit('portal:overlay', { active: false }); }}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cerrar
                  </button>
              </div>
            </div>
            <div className="h-[75vh]">
              <iframe title="Visor PDF" src={preview.src} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SettingsModal({ open, onClose, files, endpoint, onUpdated }) {
  const [logged, setLogged] = React.useState(false);
  const [adminKey, setAdminKey] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [rows, setRows] = React.useState(() =>
    (files || []).map(f => ({ ...f, file: null, status: '' }))
  );

  React.useEffect(() => {
    // reinicia selección y estados cada vez que se vuelve a abrir
    if (open) {
      setLogged(false);
      setAdminKey('');
      setBusy(false);
      setRows((files || []).map(f => ({ ...f, file: null, status: '' })));
    }
  }, [open, files]);

  if (!open) return null;

  const close = () => {
    if (busy) return;
    onClose?.();
  };

  const onPick = (idx, file) => {
    setRows(r => r.map((row, i) => i === idx ? { ...row, file, status: file ? `Seleccionado: ${file.name}` : '' } : row));
  };

  async function fileToBase64(f) {
    const buf = await f.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function uploadOne(row) {
    const res = { key: row.key, ok: false, msg: '' };
    if (!row.file) { res.msg = 'Sin archivo'; return res; }

    try {
      setRows(prev => prev.map(r => r.key === row.key ? { ...r, status: 'Subiendo…' } : r));
      const body = {
        adminKey: adminKey.trim(),              // la clave que escribe el usuario (tu backend validará)
        fileBase64: await fileToBase64(row.file),
        path: row.path,                         // ruta/archivo exacto en el repo GH Pages de este portal
        message: `Update ${row.path} desde PortadaPortalClientes`,
      };
      const r = await fetch(String(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) {
        res.msg = j?.msg || `HTTP ${r.status}`;
        setRows(prev => prev.map(rr => rr.key === row.key ? { ...rr, status: `❌ ${res.msg}` } : rr));
        return res;
      }
      res.ok = true;
      res.msg = 'OK';
      setRows(prev => prev.map(rr => rr.key === row.key ? { ...rr, status: '✅ Subido. Puede tardar ~5 min en reflejarse para todos.' } : rr));
      return res;
    } catch (e) {
      res.msg = 'Error de red';
      setRows(prev => prev.map(rr => rr.key === row.key ? { ...rr, status: '❌ Error de red' } : rr));
      return res;
    }
  }

  async function doUploadAll() {
    if (!logged) return;
    if (!adminKey.trim()) { alert('Ingresa la clave de administrador.'); return; }

    const toSend = rows.filter(r => !!r.file);
    if (toSend.length === 0) { alert('No seleccionaste archivos.'); return; }

    setBusy(true);
    const results = [];
    for (const row of toSend) {
      // eslint-disable-next-line no-await-in-loop
      const r = await uploadOne(row);
      results.push(r);
    }
    setBusy(false);

    const report = results.map(r => `${r.key}: ${r.ok ? 'OK' : 'ERROR'}${r.msg ? ` (${r.msg})` : ''}`).join('\n');
    alert(report);

    // Romper caché de los que subieron OK para que se refresquen en la grilla
    if (typeof onUpdated === 'function') {
      const bust = `?v=${Date.now()}`;
      onUpdated(results.map(r => ({ ...r, bust })));
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Ajustes · Archivos publicados</h3>
          <button onClick={close} className="rounded-md px-3 py-1 border">Cerrar</button>
        </div>

        {!logged ? (
          <div className="p-4 space-y-3 overflow-y-auto">
            <p className="text-sm text-slate-600">
              Ingresa la clave de administrador para habilitar la sesión.
            </p>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Clave de administrador"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={() => setLogged(true)}
                className="rounded-lg bg-emerald-600 text-white px-4 py-2"
              >
                Entrar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4 overflow-y-auto pr-2 grow">
            {rows.map((row, idx) => (
              <div key={row.key} className="border rounded-xl p-3">
                <div className="font-medium">{row.label}</div>
                <div className="text-xs text-slate-500 break-all">{row.path}</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    accept={row.path.toLowerCase().endsWith('.xlsx') ? '.xlsx,.xls' : 'application/pdf'}
                    onChange={e => onPick(idx, e.target.files?.[0] || null)}
                    className="flex-1"
                    disabled={busy}
                  />
                  <button
                    onClick={() => uploadOne(rows[idx]).then(r => {
                      if (r.ok && typeof onUpdated === 'function') {
                        const bust = `?v=${Date.now()}`;
                        onUpdated([{ ...r, bust }]);
                      }
                    })}
                    className="rounded-lg border px-3 py-1"
                    disabled={busy || !rows[idx].file}
                  >
                    Subir
                  </button>
                </div>
                {row.status && <div className="text-xs text-slate-600 mt-1">{row.status}</div>}
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={() => { setLogged(false); setAdminKey(''); }}
                className="rounded-lg px-3 py-1 border"
                disabled={busy}
              >
                Cerrar sesión
              </button>
              <button
                onClick={doUploadAll}
                className="rounded-lg bg-emerald-600 text-white px-4 py-2 disabled:opacity-50"
                disabled={busy}
              >
                {busy ? 'Subiendo…' : 'Subir seleccionados'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// Cotizador Rapido (independiente del portal de cotizaciones)
// ==========================================================
function CotizadorRapidoScreen() {
  // ----- Estado (equivalentes al HTML) -----
  const [ref, setRef] = useState("");
  const [desc, setDesc] = useState("");
  const [priceMode, setPriceMode] = useState("COP"); // COP | USD
  const [price, setPrice] = useState("");            // num
  const [trm, setTrm] = useState("4250");            // num (si USD)
  const [discount, setDiscount] = useState("0");     // %
  const [util, setUtil] = useState("1.00");          // factor
  const [shipping, setShipping] = useState("0");     // COP
  const [qty, setQty] = useState("1");               // unidades
  const [lead, setLead] = useState("");              // disponibilidad (libre)
  const [notes, setNotes] = useState("");            // texto libre
  const [preview, setPreview] = useState("");        // acumulado
  const [lockPreview, setLockPreview] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [loadingDesc, setLoadingDesc] = useState(false);
const openMall = (e) => {
  e.preventDefault();
  const q = (ref || '').trim().toUpperCase();
  if (!q) {
    alert('Escribe una referencia (MLFB) primero.');
    return;
  }
  const url = `https://mall.industry.siemens.com/mall/es/ww/Catalog/Product/?mlfb=${encodeURIComponent(q)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

  useEffect(() => {
    localStorage.setItem('ts:cot_open', String(Date.now()));
  }, []);

  // Backend para “Traer descripción”
  const API_BASE = 'https://portal-api-nine.vercel.app';

  // ----- Helpers (idénticos al HTML) -----
  const moneyCOP = (v) =>
    v == null || isNaN(v) ? "—"
      : Number(v).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  const cleanDesc = (text) => {
    if (!text) return "";
    let s = String(text);
    s = s.replace(/\r\n|\r|\n/g, "\n");
    s = s.replace(/\\+n/gi, "\n");
    s = s.replace(/&#10;|&#x0a;|%0a/gi, "\n");
    s = s.replace(/\\+t/gi, " ");
    s = s.split("\n").map(line => line.trim()).join("\n").replace(/ {2,}/g, " ").trim();
    return s;
  };

  const roundUpTo = (v, step = 100) => {
    if (v == null || isNaN(v)) return null;
    const s = Math.max(1, Number(step) || 100);
    return Math.ceil(Number(v) / s) * s;
  };

  const normalizeAvailability = (input) => {
    const raw = (input || "").trim();
    if (!raw) return "(sin confirmar)";
    const n = (raw.match(/\d+/)?.[0]) ? parseInt(raw.match(/\d+/)[0], 10) : NaN;
    if (!Number.isFinite(n)) return raw;
    if (n >= 1 && n <= 5) return "3-5 días. (Salvo venta previa)";
    if (n >= 30 && n <= 45) return "30-45 días. (Salvo venta previa)";
    if (n >= 46 && n <= 60) return "6 - 8 semanas";
    if (n >= 61 && n <= 80) return "8 - 10 semanas";
    if (n >= 81 && n <= 90) return "10 - 12 semanas";
    return raw;
  };

  const mallHref = ref.trim()
    ? `https://mall.industry.siemens.com/mall/es/ww/Catalog/Product/?mlfb=${encodeURIComponent(ref.trim().toUpperCase())}`
    : "#";

  // ----- Cálculo principal (calc tarjetas + bloque de texto) -----
  const compute = () => {
    const Q = Math.max(1, parseInt(qty || 1, 10));
    const baseCOP = priceMode === "USD"
      ? (Number(price || 0) * Number(trm || 0))
      : Number(price || 0);

    const afterDisc = baseCOP ? baseCOP * (1 - Number(discount || 0) / 100) : null;
    const saleAfter = afterDisc != null ? afterDisc * (Number(util || 1) || 1) : null;
// costo del envío total dividido entre unidades
const shippingPerUnit = Q > 0 ? Number(shipping || 0) / Q : 0;

// precio unitario sin envío
const roundedUnit = saleAfter != null ? roundUpTo(saleAfter, 100) : null;

// precio unitario con envío prorrateado
const finalUnitWithShipping =
  roundedUnit != null ? roundUpTo(roundedUnit + shippingPerUnit, 100) : null;

// total final considerando el envío
const roundedTotal =
  finalUnitWithShipping != null
    ? Math.max(0, roundUpTo(finalUnitWithShipping * Q, 100))
    : null;

    const availability = normalizeAvailability(lead);
    const notesPart = notes.trim() ? `\n\nNOTAS: ${notes.trim()}` : "";

    let block = "(Completa referencia, descripción y valores para ver el bloque final)";
    const REF = ref.trim().toUpperCase();
    const DESC = cleanDesc(desc);

if (REF && DESC && roundedTotal != null) {
  if (Q === 1) {
    block = `${REF}
${DESC}
Costo total: ${moneyCOP(roundedTotal)} + IVA
Disponibilidad: ${availability}${notesPart}`;
  } else {
    block = `${REF}
${DESC}
Cantidad: ${Q}
Precio unitario: ${moneyCOP(finalUnitWithShipping)}
Costo total: ${moneyCOP(roundedTotal)} + IVA
Disponibilidad: ${availability}${notesPart}`;
  }
}
    
    return {
      baseCOP,
      roundedUnit,
      roundedTotal,
      block,
    };
  };

  const { baseCOP, roundedUnit, roundedTotal, block } = compute();

  // ----- Acciones -----
  const addReference = () => {
    if (!block || block.includes("Completa referencia")) return;
    setPreview(prev => prev ? `${prev}\n\n${block}` : block);
    setLockPreview(true);
    // limpia campos (como el HTML)
    setRef("");
    setDesc("");
    setPrice("");
    // conservamos modo precio y TRM
    setDiscount("0");
    setUtil("1.00");
    setShipping("0");
    setLead("");
    setNotes("");
    setQty("1");
    // tarjetas a “—” se derivan del estado vacío
  };

  const copyBlock = async () => {
    const txt = (preview || block || "").trim();
    if (!txt || txt.includes("Completa referencia")) return;
    try {
      await navigator.clipboard.writeText(txt);
      setCopyMsg("✅ Copiado");
      setTimeout(() => setCopyMsg(""), 1500);
    } catch {
      setCopyMsg("⚠️ Copia manual (Ctrl/Cmd+C)");
      setTimeout(() => setCopyMsg(""), 2000);
    }
    // KPI tiempo 1ª respuesta
    try {
      const tsKey = 'ts:cot_open';
      const arrKey = 'kpi:cot_durations';
      const start = parseInt(localStorage.getItem(tsKey) || '0', 10);
      if (start) {
        const mins = (Date.now() - start) / 60000;
        const arr = JSON.parse(localStorage.getItem(arrKey) || '[]');
        const next = Array.isArray(arr) ? arr.concat([Number(mins)]) : [Number(mins)];
        localStorage.setItem(arrKey, JSON.stringify(next.slice(-100)));
      }
    } catch {}
  };

  const resetAll = () => {
    setRef(""); setDesc(""); setPriceMode("COP"); setPrice("");
    setTrm("4250"); setDiscount("0"); setUtil("1.00"); setShipping("0");
    setQty("1"); setLead(""); setNotes(""); setCopyMsg("");
    setPreview(""); setLockPreview(false);
  };

const fetchMallDescription = async () => {
  const q = ref.trim().toUpperCase();
  if (!q) { alert("Escribe una referencia (MLFB) primero."); return; }

  setLoadingDesc(true);
  try {
    const url = `${API_BASE}/api/industry-mall?mlfb=${encodeURIComponent(q)}`;
    const r = await fetch(url, { method: 'GET' });
    const j = await r.json().catch(()=>({}));
    if (!r.ok) {
      alert(`No se pudo consultar (${r.status}). Abre el Industry Mall y copia manualmente.`);
      return;
    }
    const d = (j && j.description || '').trim();
    setDesc(d ? cleanDesc(d) : `Referencia: ${q}. Ver ficha: ${j.source || 'N/A'}`);
  } catch (e) {
    alert("Error consultando la API. Revisa el backend.");
  } finally {
    setLoadingDesc(false);
  }
};

  // ----- UI (misma estética del portal) -----
return (
<section
  id="cotizador"
  className="relative min-h-[70vh] border-t border-slate-100 bg-transparent z-10"
>
<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700">Cotizador Rápido</h1>
          <p className="mt-2 text-slate-700 max-w-2xl">
            Calcula precio de venta con descuento, factor de utilidad y envío.
            Puedes <strong>agregar</strong> varias referencias a un bloque acumulado y copiarlo.
          </p>
          <p className="mt-4 text-sm text-slate-600 border-l-4 border-amber-400 pl-3">
            ⚠️ <strong>Nota importante:</strong> Los valores generados por este cotizador son de carácter informativo y pueden variar.
            INGETES S.A.S. no se hace responsable por errores de digitación o interpretación de precios, descuentos o valores de envío.
            Se recomienda verificar siempre los valores finales antes de emitir una oferta formal.
          </p>
        </div>
<a
  href="#home"
  onClick={() => sessionStorage.setItem("scrollToCards", "true")}
  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  ← Volver
</a>
      </div>

      {/* Fila referencia + descripción */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
        {/* Referencia */}
        <div>
          <label className={ui.label}>Referencia (MLFB)</label>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            className={ui.input}
            placeholder="6ES7131-6BH01-0BA0"
          />
<div className="flex gap-2 mt-2">
  <button
    onClick={openMall}
    className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold px-3 py-2 text-sm"
  >
    🔎 Industry Mall ↗
  </button>
<button
  onClick={fetchMallDescription}
  disabled={loadingDesc}
  aria-busy={loadingDesc}
  className={
    "inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 text-sm " +
    (loadingDesc ? "opacity-60 cursor-wait" : "")
  }
>
  {loadingDesc ? (
    <>
      {/* Spinner */}
      <span
        className="inline-block h-4 w-4 rounded-full border-2 border-white border-r-transparent animate-spin"
        aria-hidden
      />
      Consultando…
    </>
  ) : (
    <>✨ Traer descripción</>
  )}
</button>
</div>
        </div>

        {/* Descripción */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className={ui.label}>Descripción del producto</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className={ui.textarea}
            placeholder="Pega aquí la descripción completa"
          />
        </div>
      </div>

      {/* Parámetros principales */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
        <div>
          <label className={ui.label}>Precio de lista</label>
          <div className="flex gap-2">
            <select
              value={priceMode}
              onChange={(e) => setPriceMode(e.target.value)}
              className={ui.select}
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
            </select>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={ui.input}
            />
          </div>
        </div>
        <div>
          <label className={ui.label}>TRM (si precio en USD)</label>
          <input
            type="number"
            value={trm}
            onChange={(e) => setTrm(e.target.value)}
            className={ui.input}
          />
        </div>
        <div>
          <label className={ui.label}>Descuento (%)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className={ui.input}
          />
        </div>
        <div>
          <label className={ui.label}>Factor de utilidad</label>
          <input
            type="number"
            step="0.01"
            value={util}
            onChange={(e) => setUtil(e.target.value)}
            className={ui.input}
          />
        </div>
        <div>
          <label className={ui.label}>Envío (COP)</label>
          <input
            type="number"
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            className={ui.input}
          />
        </div>
        <div>
          <label className={ui.label}>Cantidad</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className={ui.input}
          />
        </div>
      </div>

      {/* Disponibilidad y notas */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
        <div>
          <label className={ui.label}>Disponibilidad</label>
          <input
            value={lead}
            onChange={(e) => setLead(e.target.value)}
            className={ui.input}
            placeholder="Ej. 30-45 días"
          />
        </div>
        <div className="lg:col-span-2">
          <label className={ui.label}>Notas</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={ui.input}
            placeholder="Texto adicional para la cotización"
          />
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="rounded-2xl border border-emerald-100 p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Precio base COP</div>
          <div className="text-base mt-1 font-semibold text-slate-800">{moneyCOP(baseCOP)}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Precio unitario (redondeado)</div>
          <div className="text-base mt-1 font-semibold text-slate-800">{moneyCOP(roundedUnit)}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">+ Envío</div>
          <div className="text-base mt-1 font-semibold text-slate-800">{moneyCOP(Number(shipping || 0))}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Total antes de IVA</div>
          <div className="text-base mt-1 font-semibold text-slate-800">{moneyCOP(roundedTotal)}</div>
        </div>
      </div>

      {/* Previsualización y acciones */}
      <div className="mt-10">
        <div className="text-sm font-medium mb-2">Previsualización (formato final)</div>
        <pre className="text-sm whitespace-pre-wrap leading-6 border border-emerald-100 rounded-2xl p-4 bg-emerald-50/30">
          {lockPreview ? preview || block : block}
        </pre>

        <div className="flex flex-wrap gap-3 items-center mt-4">
          <button
            onClick={addReference}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold"
          >
            ➕ Agregar referencia
          </button>
          <button
            onClick={copyBlock}
            className="rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-4 py-2 font-semibold"
          >
            📋 Copiar
          </button>
          <button
            onClick={resetAll}
            className="rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 font-semibold"
          >
            🔄 Reiniciar
          </button>
          <span className="text-sm ml-auto">{copyMsg}</span>
        </div>
      </div>
    </div>
  </section>
);
}

// ==========================================================
// Herramientas (con visor interno PDF)
// ==========================================================
function HerramientasScreen() {
  const [preview, setPreview]   = React.useState(null); // { item:{title,href}, src }
  const [term, setTerm]         = React.useState('');
  const [usePdfJs, setUsePdfJs] = React.useState(true);
  const [copied, setCopied]     = React.useState(false);

  const isPdf = (u) => /\.pdf($|[?#])/i.test(u);

  const fileNameFromUrl = (url, fallback = 'documento') => {
    try {
      const clean = url.split('#')[0].split('?')[0];
      const last = clean.substring(clean.lastIndexOf('/') + 1) || fallback;
      return decodeURIComponent(last);
    } catch { return fallback; }
  };

// Reemplaza la función downloadFile por esta versión (en DocumentosScreen y HerramientasScreen)
const downloadFile = (url, suggestedName) => {
  const encoded = encodeURI(url); // respeta %20, etc.
  const name = suggestedName || (() => {
    try {
      const clean = encoded.split('#')[0].split('?')[0];
      return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1) || 'documento');
    } catch { return 'documento'; }
  })();

  const a = document.createElement('a');
  a.href = encoded;
  a.download = name;            // sugiere el nombre
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

  const openPreview = (item, q = '') => {
    if (!isPdf(item.href)) {
      alert('Este archivo no puede previsualizarse. Se descargará.');
      downloadFile(item.href);
      return;
    }
    const src = buildViewerSrc(item.href, q || '', usePdfJs);
    setPreview({ item, src });
    setCopied(false);
    emit('portal:overlay', { active: true });  // ← añade
  };

  const applySearch = () => {
    if (!preview) return;
    const src = buildViewerSrc(preview.item.href, term, usePdfJs);
    setPreview({ ...preview, src });
  };

// Mapa de bust por clave editable
const [bustMap, setBustMap] = React.useState({});

// Escucha actualizaciones desde Ajustes
React.useEffect(() => {
  const onFilesUpdated = (e) => {
    const { results = [] } = e.detail || {};
    const next = { ...bustMap };
    results.filter(r => r.ok && r.bust && r.key).forEach(r => { next[r.key] = r.bust; });
    setBustMap(next);
  };
  window.addEventListener('portal:filesUpdated', onFilesUpdated);
  return () => window.removeEventListener('portal:filesUpdated', onFilesUpdated);
}, [bustMap]);

// Helper para aplicar bust por key
const withBust = (key, url) => {
  const q = bustMap[key];
  if (!q) return url;
  try { const u = new URL(url, window.location.origin); u.search = q; return u.pathname + u.search; }
  catch { return url + q; }
};

// …y en el array "tools", donde uses DOCS.liner / DOCS.chemical / DOCS.celdas:
actions: [{ label: 'Vista previa', href: withBust('liner', DOCS.liner), openInModal: true }]
// idem para 'chemical' y 'celdas'

const tools = [
  {
    title: 'TIA SELECTION TOOL',
    desc: 'Selección de equipos para TIA Portal: CPUs, IOs, comunicaciones y accesorios.',
    badge: 'Siemens',
    actions: [
      { label: 'Descargar software', href: 'https://www.siemens.com/tia-selection-tool-standalone' },
      { label: 'Abrir en Nube', href: 'https://www.siemens.com/tstcloud' },
    ],
  },
  {
    title: 'PIA SELECTION TOOL',
    desc: 'Selección para instrumentación y analítica de procesos.',
    badge: 'Siemens',
    actions: [
      { label: 'Abrir', href: 'https://www.pia-portal.automation.siemens.com/default.htm' },
    ],
  },
  {
    title: 'Configurador de variadores y servomotores SIEMENS',
    desc: 'Configura variadores, motores y servos según requerimientos.',
    badge: 'Siemens',
    actions: [
      { label: 'Abrir', href: 'https://mall.industry.siemens.com/spice/cloudcm/dashboard?caller=SPC' },
    ],
  },
  {
    title: 'Manual de selección de materiales y recubrimientos internos',
    desc: 'Documento de referencia para elegir el liner adecuado según fluido y condiciones.',
    badge: 'Referencia',
    actions: [
      { label: 'Vista previa', href: withBust('liner', DOCS.liner), openInModal: true },
    ],
  },
  {
    title: 'Tabla de compatibilidad de materiales',
    desc: 'Consulta rápida para compatibilidades químicas y de proceso.',
    badge: 'Referencia',
    actions: [
      { label: 'Abrir', href: 'https://www.coleparmer.com/chemical-resistance' },
      { label: 'Vista previa', href: withBust('chemical', DOCS.chemical), openInModal: true },
    ],
  },
  {
    title: 'Guía de selección de celdas de carga',
    desc: 'Criterios de selección para celdas de carga por aplicación.',
    badge: 'Guía',
    actions: [
      { label: 'Vista previa', href: withBust('celdas', DOCS.celdas), openInModal: true },
    ],
  },
  // --- NUEVAS HERRAMIENTAS AÑADIDAS ---
  {
    title: 'Herramientas de selección de fuentes',
    desc: 'Selector para elegir fuentes de alimentación adecuadas según carga y aplicación.',
    badge: 'Utilidad',
    actions: [
      { label: 'Abrir', href: 'https://mall.industry.siemens.com/tia-selection-tool-standalone' },
    ],
  },
  {
    title: 'Switch de comunicación',
    desc: 'Configurador de switches industriales y soluciones de comunicación.',
    badge: 'Utilidad',
    actions: [
      { label: 'Abrir', href: 'https://mall.industry.siemens.com/mall/en/ww/Catalog/Product/6GK5' },
    ],
  },
  {
    title: 'Configuración de servos',
    desc: 'Asistente para la parametrización de servomotores y controladores de movimiento.',
    badge: 'Utilidad',
    actions: [
      { label: 'Abrir', href: 'https://mall.industry.siemens.com/spice/cloudcm/dashboard?caller=SPC' },
    ],
  },
  {
    title: 'Configurador de PC',
    desc: 'Herramienta para configurar PCs industriales Siemens según requisitos del proyecto.',
    badge: 'Utilidad',
    actions: [
      { label: 'Abrir', href: 'https://mall.industry.siemens.com/mall/en/ww/Catalog/Product/6ES7677' },
    ],
  },
  {
    title: 'Software de instrumentación',
    desc: 'Acceso a herramientas y software de instrumentación para configuración y diagnóstico.',
    badge: 'Software',
    actions: [
      { label: 'Abrir', href: 'https://support.industry.siemens.com/' },
    ],
  },
];


  // Desde el chatbot
  React.useEffect(() => {
    const onOpen = (e) => {
      const d = e.detail || {};
      if (d.section !== 'herramientas' || !d.href) return;
      const src = buildViewerSrc(d.href, d.search || '', usePdfJs);
      setTerm(d.search || '');
      setPreview({ item: { title: d.title || 'Documento', href: d.href }, src });
    };
    window.addEventListener('portal:openPreview', onOpen);
    return () => window.removeEventListener('portal:openPreview', onOpen);
  }, [usePdfJs]);

  return (
    <section id="herramientas" className="min-h-[70vh] border-t border-slate-100 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700">Herramientas comerciales para los canales</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">Accede a utilidades tecnicas y de seleccion que agilizan tu preingenieria y cotizacion.</p>
          </div>
<a
  href="#home"
  onClick={() => sessionStorage.setItem("scrollToCards", "true")}
  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  ← Volver
</a>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => (
            <article key={i} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">{t.badge}</span>
              </div>
              <p className="mt-2 text-slate-700 text-sm">{t.desc}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {t.actions?.map((a, idx) =>
                  a.openInModal ? (
                    <button
                      key={idx}
                      onClick={() => openPreview({ title: t.title, href: a.href })}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${idx === 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'}`}
                    >
                      {a.label}
                    </button>
                  ) : (
                    <a
                      key={idx}
                      href={a.href}
                      target="_blank"
                      rel="noopener"
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${idx === 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'}`}
                    >
                      {a.label}
                    </a>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal visor */}
      {preview && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{preview.item.title}</h3>
                <p className="text-xs text-slate-500">Visor interno • Herramientas</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Mostrar checkbox solo para PDFs */}
                {isPdf(preview.item.href) && (
                  <label className="hidden md:inline-flex items-center gap-2 mr-3 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={usePdfJs}
                      onChange={(e) => {
                        const v = e.target.checked;
                        setUsePdfJs(v);
                        setPreview(p => p ? ({ ...p, src: buildViewerSrc(p.item.href, term, v) }) : p);
                      }}
                    />
                    Usar visor pdf.js
                  </label>
                )}
              
                {/* Mostrar botón Descargar solo si NO es Inventario INGETES */}
                {preview.item.key !== 'inventario' && (
                  <button
                    onClick={() => downloadFile(preview.item.href, fileNameFromUrl(preview.item.href))}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-white text-sm font-semibold hover:bg-black"
                  >
                    Descargar
                  </button>
                )}
              
                <button
                  onClick={() => { setPreview(null); emit('portal:overlay', { active: false }); }}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="h-[75vh]">
              <iframe title="Visor PDF" src={preview.src} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ==========================================================
// Estadisticas
// ==========================================================
function StatsScreen() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const all = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('trk:')) all.push({ key: k, count: parseInt(localStorage.getItem(k) || '0', 10) });
    }
    all.sort((a, b) => b.count - a.count);
    setRows(all);
  }, []);

  return (
    <section id="stats" className="min-h-[70vh] border-t border-slate-100 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700">Estadisticas de uso (local)</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">Resumen simple basado en <code>localStorage</code>. Ideal para validar adopcion antes de conectar a backend.</p>
          </div>
<a
  href="#home"
  onClick={() => sessionStorage.setItem("scrollToCards", "true")}
  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  ← Volver
</a>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left text-slate-600"><th className="py-2 pr-6">Evento</th><th className="py-2 pr-6">Conteo</th></tr></thead>
            <tbody>
              {rows.length === 0 && (<tr><td className="py-3 pr-6 text-slate-500" colSpan={2}>Sin datos aun. Interactua con los botones del portal y regresa.</td></tr>)}
              {rows.map(r => (<tr key={r.key} className="border-t border-slate-100"><td className="py-2 pr-6 font-mono text-xs">{r.key}</td><td className="py-2 pr-6">{r.count}</td></tr>))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => { localStorage.clear(); setRows([]); }} className="rounded-xl bg-white px-4 py-2 text-slate-700 font-semibold ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Limpiar</button>
          <a href="#herramientas" className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700">Ir a Herramientas</a>
        </div>
      </div>
    </section>
  );
}

// ==========================================================
// Footer
// ==========================================================
function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-[#0a0a0a] to-[#111827] text-slate-100 overflow-hidden">
  <img
    src={`${import.meta.env.BASE_URL}ingetes.png`}
    alt="Marca de agua INGETES"
    className="absolute right-10 bottom-10 w-40 opacity-10 pointer-events-none select-none"
  />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-8">
        {/* Columna 1: Empresa */}
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-400">INGETES S.A.S.</p>
          <p className="mt-2 text-sm text-slate-300">
            Carrera 16 No. 148 - 19<br/>
            Bogotá - Colombia
          </p>
          <p className="mt-2 text-sm text-slate-300">
            PBX: (57)+1 259 3679<br/>
            (57) + 311 8105540
          </p>
        </div>

        {/* Columna 2: Contactos */}
        <div className="text-sm text-slate-300">
          <p className="font-semibold text-slate-200">Contactos</p>
          <p className="mt-2">
            Facturación: <a href="mailto:achamorro@ingetes.com" className="underline underline-offset-4">achamorro@ingetes.com;</a>
          </p>
          <p className="mt-1">
            Soporte: <a href="mailto:jgarzon@ingetes.com" className="underline underline-offset-4">jgarzon@ingetes.com;</a>
          </p>
        </div>

        {/* Columna 3: Acciones rápidas */}
        <div className="md:text-right text-sm">
          <p className="mt-3 text-slate-400">© {new Date().getFullYear()} INGETES S.A.S.</p>
        </div>
      </div>
    </footer>
  );
}
