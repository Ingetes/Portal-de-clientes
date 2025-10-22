import React, { useEffect, useState } from "react";
const logoIngetes = `${import.meta.env.BASE_URL}ingetes.jpg`;
const logoIngecap = `${import.meta.env.BASE_URL}ingecap.jpg`;

import PortalClientesAuth from "./portal_de_acceso_clientes.jsx";

const BASE = import.meta.env.BASE_URL;
const DOCS = {
  siemens: `${BASE}Listaprecios2025.pdf`,
  innomotics: `${BASE}Listapreciosinnomotics.pdf`,
  inventario: `${BASE}INFORME%20BALANCE%20DE%20INVENTARIO.xlsx`, // espacio codificado
  promo: `${BASE}inventario-promocion.xlsx`,
  liner: `${BASE}Siemens%Liner%Full%New.pdf`,
  chemical: `${BASE}Chemical_Resistance_Chart_202106.pdf`,
  celdas: `${BASE}manual%de%celdas%y%MODULOS%DE%PESAJE%RICE%LAKE%en%español.pdf`,
};

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
  const [route, setRoute] = useState(typeof window !== 'undefined' ? window.location.hash || '#home' : '#home');
  // Control de acceso a INGECAP (placeholder, luego se conectará a backend/auth)
  const [hasIngecapAccess, setHasIngecapAccess] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#home');
    window.addEventListener('hashchange', onHash);
    // contar sesión local para KPIs
    const key = 'trk:session_count';
    const curr = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, String(curr));
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

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
      { label: 'Abrir', href: 'https://www.pia-portal.automation.siemens.com/SIE(cz1TSUQlM2FBTk9OJTNhYWV1YzFjMDI1MjA3eF9SM1BfMDIlM2FkTncybW1RNzlFUEpmbWxIOEs1ZlR6c1UzZmtxNnJKQnRlRnc0UFFaLUFUVA==)/Z3_PIA_PORTAL#tab-selection', external: true }
    ]},
    { title: 'Configurador de variadores y servomotores SIEMENS', actions: [
      { label: 'Abrir', href: 'https://mall.industry.siemens.com/spice/cloudcm/dashboard?caller=SPC', external: true }
    ]},
    { title: 'Compatibilidad de liner', actions: [
      { label: 'Abrir documento', href: '/herramientas/Siemens%20Liner%20Full%20New.pdf', modal: true }
    ]},
    { title: 'Tabla de compatibilidad de materiales', actions: [
      { label: 'Abrir', href: 'https://www.coleparmer.com/chemical-resistance', external: true },
      { label: 'Abrir documento', href: '/herramientas/Chemical_Resistance_Chart_202106.pdf', modal: true }
    ]},
    { title: 'Guía de selección de celdas de carga', actions: [
      { label: 'Abrir documento', href: '/herramientas/manual%20de%20celdas%20y%20MODULOS%20DE%20PESAJE%20RICE%20LAKE%20en%20espa%C3%B1ol.pdf', modal: true }
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
      window.open('https://www.pia-portal.automation.siemens.com/SIE(cz1TSUQlM2FBTk9OJTNhYWV1YzFjMDI1MjA3eF9SM1BfMDIlM2FkTncybW1RNzlFUEpmbWxIOEs1ZlR6c1UzZmtxNnJKQnRlRnc0UFFaLUFUVA==)/Z3_PIA_PORTAL#tab-selection', '_blank', 'noopener');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      {route === '#ingresar' ? (
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
        className="fixed bottom-6 right-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg px-5 py-3"
        aria-label="Abrir asistente virtual"
      >
        {chatOpen ? 'Cerrar Asistente' : 'Asistente'}
      </button>

      {/* Panel del Chatbot con comandos */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] max-w-[92vw] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
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
                    {showDocsMenu && (
                      <div className="w-full mt-2 border border-slate-200 rounded-xl p-2 bg-white">
                        <p className="text-xs text-slate-600 mb-2">Descargas rápidas:</p>
                        <div className="flex flex-col gap-2">
                          {docsMenu.map((d, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (d.locked) { window.location.hash = '#ingecap'; alert('Inventario en Promoción requiere membresía INGECAP.'); return; }
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

      <Footer />
    </div>
  );
}

// ==========================================================
// Header
// ==========================================================
function Header() {
  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoIngetes} alt="INGETES" className="h-10 w-auto" />
          <div className="hidden md:block">
            <p className="text-xs uppercase tracking-widest text-slate-500">Portal para Canales de Distribucion</p>
            <p className="text-sm font-medium text-slate-800">Fidelizacion - Cotizaciones - Listas de Precios</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a className="text-slate-600 hover:text-emerald-700" href="#proposito">Próposito</a>
          <a className="text-slate-600 hover:text-emerald-700" href="#beneficios">Beneficios</a>
          <a className="text-slate-600 hover:text-emerald-700" href="#como-empezar">Cómo empezar</a>
          <a className="text-slate-600 hover:text-emerald-700" href="#herramientas">Herramientas</a>
          <a className="text-slate-600 hover:text-emerald-700" href="#stats">Estadisticas</a>
        </nav>
      </div>
    </header>
  );
}

// ==========================================================
// Landing (home)
// ==========================================================
function Landing({ setChatOpen, chatOpen }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <svg viewBox="0 0 1200 600" className="w-full h-full opacity-10">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="100" r="200" fill="url(#g)" />
            <circle cx="1000" cy="500" r="240" fill="url(#g)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">Portal de Canales INGETES</h1>
            <p className="mt-4 text-lg text-slate-700" id="proposito">Este portal es un espacio exclusivo para clientes que mantienen una relación comercial con INGETES. Aquí encontrarás documentación que facilita la elaboración de ofertas, herramientas para la selección de equipos y el diseño de tus proyectos, un cotizador para crear propuestas rápidas a tus clientes y acceso a privilegios exclusivos para miembros de INGECAP.</p>
            </div>
          <div className="relative">
            <div className="rounded-3xl bg-white/70 backdrop-blur shadow-xl p-6 lg:p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Qué puedes hacer aquí?</h3>
              <ul className="mt-4 space-y-3 text-slate-700">
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />Descargar y consultar listas de precios Siemens.</li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />Generar cotizaciones con plantillas estandarizadas de INGETES.</li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />Hacer seguimiento a oportunidades y documentación clave.</li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />Acumular y redimir <strong>INGEPUNTOS</strong> por tus compras.</li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />Recibir soporte de nuestro <strong>Asistente Virtual</strong>.</li>
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-4" id="beneficios">
                {(() => { 
                  // KPI 1: Tiempo a 1ª respuesta (min) - promedio local
                  let avg = null;
                  try { const arr = JSON.parse(localStorage.getItem('kpi:cot_durations')||'[]'); if (Array.isArray(arr) && arr.length) { avg = arr.reduce((a,b)=>a+b,0)/arr.length; } } catch {}
                  // KPI 3: Uso de herramientas por sesión
                  let tools = 0; let sessions = parseInt(localStorage.getItem('trk:session_count')||'1',10) || 1;
                  for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i)||''; if(k.startsWith('trk:tool_click')||k.startsWith('trk:chat_tool_action')){ tools += parseInt(localStorage.getItem(k)||'0',10)||0; } }
                  const perSess = tools / sessions;
                  return (
                    <>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-600">Tiempo a 1ª respuesta (min)</p>
                        <p className="text-2xl font-extrabold text-slate-900">{avg!==null ? avg.toFixed(1) : '—'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-600">Herramientas por sesión</p>
                        <p className="text-2xl font-extrabold text-slate-900">{perSess ? perSess.toFixed(1) : '0.0'}</p>
                      </div>
                    </>
                  ); })()}
              </div>
              <p className="mt-4 text-xs text-slate-500">*KPIs calculados localmente con base en el uso del portal en este navegador.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como empezar */}
      <section id="como-empezar" className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-6">
          {[
            { title: '1. Ingresar a INGECAP', desc: 'Centro de experiencia e innovación.', cta: 'Ingresar', href: '#ingecap' },
            { title: '2. Descarga listas y documentos', desc: 'Encuentra listas de precios Siemens, plantillas y guias de cotizacion.', cta: 'Ir a documentos', href: '#documentos' },
            { title: '3. Herramientas comerciales para los canales', desc: 'Accede a utilidades de seleccion, compatibilidad y configuradores.', cta: 'Abrir herramientas', href: '#herramientas' },
            { title: '4. Cotizador Rapido', desc: 'Crea cotizaciones sencillas, aplica descuentos e impuestos, y exporta.', cta: 'Ingresar', href: '#cotizador' }
          ].map((card, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
              <h4 className="text-lg font-bold text-slate-900">{card.title}</h4>
              <p className="mt-2 text-slate-700">{card.desc}</p>
              <a href={card.href} className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700">{card.cta}</a>
            </div>
          ))}
        </div>
      </section>
    </>
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
    { k: 'outsourcing', title: 'Outsourcings autorizados', desc: 'Listado de aliados y proveedores certificados para servicios de automatización y control.' },
    { k: 'bloques', title: 'Venta de bloques técnicos de programación', desc: 'Paquetes de bloques de programación y librerías listas para usar.' }
  ];

  useEffect(() => { console.assert(features.length === 5, 'INGECAP debe tener 5 accesos'); }, []);

  const goHome = () => window.location.hash = '#home';

  return (
    <section id="ingecap" className="min-h-[70vh] border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <img src={logoIngecap} alt="INGECAP" className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">INGECAP</h1>
            <p className="mt-1 text-sm font-semibold text-emerald-700">Centro de experiencia e innovación</p>
            <p className="mt-2 text-slate-700 max-w-2xl">Bienvenido a la membresía de <strong>INGECAP</strong>. Desde aquí podrás acceder a servicios exclusivos que potencian tus proyectos y ventas. Esta sección se mostrará completa únicamente a usuarios con acceso habilitado.</p>
          </div>
          <a onClick={goHome} className="cursor-pointer hidden md:inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Volver</a>
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

// ==========================================================
// Documentos
// ==========================================================
function DocumentosScreen() {
  const [preview, setPreview] = React.useState(null); // { item, src }
  const [term, setTerm] = React.useState('');
  const [usePdfJs, setUsePdfJs] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

const items = [
  {
    title: 'Lista de precios Siemens',
    desc: 'Tarifas vigentes de productos Siemens para canales de distribución.',
    badge: 'Actualizado',
    href: DOCS.siemens,
    updated: '2025',
    size: '—',
  },
  {
    title: 'Lista de precios Innomotics',
    desc: 'Motores, variadores y soluciones de movimiento Innomotics.',
    badge: 'Nuevo',
    href: DOCS.innomotics,
    updated: '—',
    size: '—',
  },
  {
    title: 'Inventario INGETES',
    desc: 'Stock disponible por referencia con fechas de reposición.',
    badge: 'Actualizable',
    href: DOCS.inventario,
    updated: '—',
    size: '—',
  },
  {
    title: 'Inventario en Promoción',
    desc: 'Lotes en promoción con descuentos y fechas límite.',
    badge: 'Promoción',
    href: DOCS.promo,
    locked: true,                 // ← se marca como restringido
    updated: '-',
    size: '-',
  },
];

  useEffect(() => {
    console.assert(items.length >= 4, 'Deben existir al menos 4 documentos');
    items.forEach((it, idx) => { console.assert(!!it.title && !!it.href, `Item invalido en posicion ${idx}`); });
    console.assert(!items.some(it => it.title.toLowerCase().includes('lista de precios ingetes')), 'No debe existir "Lista de precios INGETES"');
    console.assert(items.some(it => it.title === 'Inventario INGETES'), 'Debe existir Inventario INGETES');
  }, []);

  const fileNameFromUrl = (url, fallback = 'documento') => {
    try { const clean = url.split('#')[0].split('?')[0]; const last = clean.substring(clean.lastIndexOf('/') + 1) || fallback; return decodeURIComponent(last);} catch { return fallback; }
  };

  const downloadFile = async (url, suggestedName) => {
    const encoded = encodeURI(url); const name = suggestedName || fileNameFromUrl(encoded);
    track('doc_download_click', { href: encoded, name });
    try { const res = await fetch(encoded, { mode: 'cors', credentials: 'omit' }); if (!res.ok) throw new Error('HTTP ' + res.status); const blob = await res.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },0); return; } catch {}
    try { const iframe = document.createElement('iframe'); iframe.style.display='none'; iframe.src=encoded; document.body.appendChild(iframe); setTimeout(()=>iframe.remove(),20000); return; } catch {}
    window.open(encoded, '_blank', 'noopener');
  };

const buildViewerSrc = (href, q, usePdf) => {
  if (usePdf) {
    const viewer = `${BASE}pdfjs/web/viewer.html`;
    const fileParam = `?file=${encodeURIComponent(href)}`;
    const hash = q ? `#search=${encodeURIComponent(q)}` : '';
    return `${viewer}${fileParam}${hash}`;
  }
  const base = href.split('#')[0];
  const hash = q ? `#search=${encodeURIComponent(q)}` : `#toolbar=1`;
  return `${base}${hash}`;
};

  useEffect(() => { const testSrc = buildViewerSrc('/a/b.pdf', 'xyz', true); console.assert(testSrc.includes('?file=') && testSrc.includes('search=xyz'), 'buildViewerSrc debe construir URL de pdf.js'); }, []);

  const openPreview = (item, q = '') => {
    track('doc_preview_open', { title: item.title, href: item.href });
    const src = buildViewerSrc(item.href, q || term, usePdfJs);
    if (q) setTerm(q); else setTerm('');
    setPreview({ item, src }); setCopied(false);
  };

  const applySearch = () => { if (!preview) return; const src = buildViewerSrc(preview.item.href, term, usePdfJs); setPreview({ ...preview, src }); };
  const copyReference = async () => { try { await navigator.clipboard.writeText(term || ''); setCopied(true); setTimeout(()=>setCopied(false),1500);} catch {} };

  const [zipProgress, setZipProgress] = React.useState({ current: 0, total: 0, status: 'idle' });
  const downloadAllZip = async () => { track('zip_all_click', { total: items.length }); 
                                      try { setZipProgress({ current:0, total: items.length, status:'preparando' }); 
                                           const [{ default: JSZip }, { saveAs }] = await Promise.all([
                                              import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm'),
                                              import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm'),
                                            ]);
                                           const zip = new JSZip(); const folder = zip.folder('documentos'); let processed=0; 
                                           for (const it of items){ try { const encoded = encodeURI(it.href); 
                                                                         const res = await fetch(encoded, { mode:'cors', credentials:'omit' }); 
                                                                         if(!res.ok) throw new Error('HTTP '+res.status); 
                                                                         const blob = await res.blob(); 
                                                                         const name = fileNameFromUrl(encoded); 
                                                                         folder.file(name, blob);} catch(e){ folder.file(`ERROR_${Date.now()}_${Math.random().toString(36).slice(2)}.txt`, `No se pudo agregar: ${it.title} -> ${it.href}`);} finally { processed += 1; setZipProgress({ current: processed, total: items.length, status: 'descargando' }); } } setZipProgress(p=>({...p, status:'comprimendo'})); 
                                           const blobZip = await zip.generateAsync({ type:'blob' }); 
                                           const fecha = new Date().toISOString().slice(0,10); saveAs(blobZip, `Documentos_Precios_Inventario_${fecha}.zip`); 
                                           setZipProgress({ current: items.length, total: items.length, status: 'listo' }); } catch (e) { setZipProgress({ current:0, total:0, status:'error' }); 
                                                                                                                                         items.forEach(it => window.open(it.href,'_blank','noopener')); } finally { setTimeout(()=>setZipProgress({ current:0, total:0, status:'idle' }), 4000); } };

  // --- Event listeners (desde chatbot) ---
  useEffect(() => {
    const onOpen = (e) => {
      const d = e.detail || {};
      if (d.section !== 'documentos') return;
      const item = items.find(it => it.title.toLowerCase().includes('siemens')) || items[0];
      if (!item) return;
      openPreview(item, d.search || '');
    };
    const onZip = () => downloadAllZip();
    window.addEventListener('portal:openPreview', onOpen);
    window.addEventListener('portal:zipAll', onZip);
    return () => {
      window.removeEventListener('portal:openPreview', onOpen);
      window.removeEventListener('portal:zipAll', onZip);
    };
  }, []);

  return (
    <section id="documentos" className="min-h-[70vh] border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Documentos & Listas de Precios</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">Descarga las listas de precios y archivos de inventario. Mantendremos esta seccion actualizada para que puedas cotizar mas rapido y con informacion confiable.</p>
          </div>
          <a href="#home" className="hidden md:inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Volver</a>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
<article key={i} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Overlay de restricción (solo para locked) */}
  {item.locked && (
    <div className="absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">🔒</div>
        <p className="text-xs text-slate-600">Requiere membresía INGECAP</p>
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
    <button
      onClick={() => {
        if (item.locked) { window.location.hash = '#ingecap'; alert('Inventario en Promoción requiere membresía INGECAP.'); return; }
        downloadFile(item.href);
      }}
      className={`rounded-xl px-4 py-2 font-semibold ${item.locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
      disabled={item.locked}
    >
      Descargar
    </button>

    <button
      onClick={() => {
        if (item.locked) { window.location.hash = '#ingecap'; alert('Inventario en Promoción requiere membresía INGECAP.'); return; }
        openPreview(item);
      }}
      className={`rounded-xl px-4 py-2 font-semibold ring-1 ring-inset ${item.locked ? 'bg-slate-50 text-slate-400 ring-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
      disabled={item.locked}
    >
      Ver detalles
    </button>
  </div>
</article>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <a href="#home" className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Volver al inicio</a>
          <button onClick={downloadAllZip} className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-white font-semibold hover:bg-black">
            {zipProgress.status === 'idle' && 'Descargar todo (.zip)'}
            {zipProgress.status !== 'idle' && zipProgress.status !== 'error' && `Preparando... ${zipProgress.current}/${zipProgress.total}`}
            {zipProgress.status === 'error' && 'Reintentando...'}
          </button>
        </div>
      </div>

      {/* Indicador de progreso */}
      {zipProgress.status !== 'idle' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-white/90 backdrop-blur border border-slate-200 shadow px-4 py-2 text-sm"><span className="font-semibold mr-2">ZIP:</span><span>{zipProgress.status}</span>{zipProgress.total > 0 && <span> - {zipProgress.current}/{zipProgress.total}</span>}</div>
      )}

      {/* Modal de previsualizacion PDF + Buscador */}
      {preview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{preview.item.title}</h3>
                <p className="text-xs text-slate-500">{preview.item.updated} • {preview.item.size}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 mr-3 text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={usePdfJs} onChange={(e) => setUsePdfJs(e.target.checked)} />Usar visor pdf.js</label>
                </div>
                <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar referencia (ej. 3RT2016-1AN21)" className="w-64 md:w-72 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                <button onClick={applySearch} className="rounded-xl bg-emerald-600 px-3 py-2 text-white text-sm font-semibold hover:bg-emerald-700">Buscar</button>
                <button onClick={async()=>{ try{ await navigator.clipboard.writeText(term||'');}catch{} }} disabled={!term} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-40">Copiar referencia</button>
                <button onClick={() => downloadFile(preview.item.href, fileNameFromUrl(preview.item.href))} className="rounded-xl bg-slate-900 px-3 py-2 text-white text-sm font-semibold hover:bg-black">Descargar</button>
                <button onClick={() => setPreview(null)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Cerrar</button>
              </div>
            </div>
            <div className="h-[75vh]"><iframe title="Visor PDF" src={preview.src} className="w-full h-full" /></div>
          </div>
        </div>
      )}
    </section>
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
    const roundedUnit = saleAfter != null ? roundUpTo(saleAfter, 100) : null;
    const roundedTotal = roundedUnit != null ? Math.max(0, roundUpTo((roundedUnit * Q) + Number(shipping || 0), 100)) : null;

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
Precio unitario: ${moneyCOP(roundedUnit)}
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
    try {
      const url = `${API_BASE}/api/industry-mall?mlfb=${encodeURIComponent(q)}`;
      const r = await fetch(url, { method: 'GET' });
      const j = await r.json().catch(()=>({}));
      if (!r.ok) { alert(`No se pudo consultar (${r.status}). Abre el Industry Mall y copia manualmente.`); return; }
      const d = (j && j.description || '').trim();
      setDesc(d ? cleanDesc(d) : `Referencia: ${q}. Ver ficha: ${j.source || 'N/A'}`);
    } catch (e) {
      alert("Error consultando la API. Revisa el backend.");
      // opcional: console.error(e);
    }
  };

  // ----- UI (misma estética del portal) -----
return (
  <section id="cotizador" className="min-h-[70vh] border-t border-slate-100 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Cotizador Rápido</h1>
          <p className="mt-2 text-slate-700 max-w-2xl">
            Calcula precio de venta con descuento, factor de utilidad y envío.
            Puedes <strong>agregar</strong> varias referencias a un bloque acumulado y copiarlo.
          </p>
        </div>
        <a
          href="#home"
          className="hidden md:inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
            <a
              href={mallHref}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold px-3 py-2 text-sm"
            >
              🔎 Industry Mall ↗
            </a>
            <button
              onClick={fetchMallDescription}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 text-sm"
            >
              ✨ Traer descripción
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
// Herramientas (con visor interno PDF clonado)
// ==========================================================
function HerramientasScreen() {
  const [preview, setPreview] = React.useState(null); // { item, src }
  const [term, setTerm] = React.useState('');
  const [usePdfJs, setUsePdfJs] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const fileNameFromUrl = (url, fallback = 'documento') => { try { const clean = url.split('#')[0].split('?')[0]; const last = clean.substring(clean.lastIndexOf('/') + 1) || fallback; return decodeURIComponent(last);} catch { return fallback; } };
  const downloadFile = async (url, suggestedName) => { const encoded = encodeURI(url); const name = suggestedName || fileNameFromUrl(encoded); track('tool_doc_download_click', { href: encoded, name }); try { const res = await fetch(encoded, { mode: 'cors', credentials: 'omit' }); if (!res.ok) throw new Error('HTTP ' + res.status); const blob = await res.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0); return; } catch (e) {} window.open(encoded, '_blank', 'noopener'); };
const buildViewerSrc = (href, q, usePdf) => {
  if (usePdf) {
    const viewer = `${BASE}pdfjs/web/viewer.html`;
    const fileParam = `?file=${encodeURIComponent(href)}`;
    const hash = q ? `#search=${encodeURIComponent(q)}` : '';
    return `${viewer}${fileParam}${hash}`;
  }
  const base = href.split('#')[0];
  const hash = q ? `#search=${encodeURIComponent(q)}` : `#toolbar=1`;
  return `${base}${hash}`;
};

  const openPreview = (item) => { track('tool_doc_preview_open', { title: item.title, href: item.href }); const src = buildViewerSrc(item.href, term, usePdfJs); setTerm(''); setPreview({ item, src }); setCopied(false); };
  const applySearch = () => { if (!preview) return; const src = buildViewerSrc(preview.item.href, term, usePdfJs); setPreview({ ...preview, src }); };
  const copyReference = async () => { try { await navigator.clipboard.writeText(term || ''); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };

  // Lista de herramientas (con orden definido)
  const tools = [
    { title: 'TIA SELECTION TOOL', desc: 'Seleccion de equipos para TIA Portal: CPUs, IOs, comunicaciones y accesorios.', badge: 'Siemens', actions: [ { label: 'Descargar software', href: 'https://www.siemens.com/tia-selection-tool-standalone' }, { label: 'Abrir en Nube', href: 'https://www.siemens.com/tstcloud' } ] },
    { title: 'PIA SELECTION TOOL', desc: 'Seleccion para instrumentacion y analitica de procesos.', badge: 'Siemens', actions: [ { label: 'Abrir', href: 'https://www.pia-portal.automation.siemens.com/SIE(cz1TSUQlM2FBTk9OJTNhYWV1YzFjMDI1MjA3eF9SM1BfMDIlM2FkTncybW1RNzlFUEpmbWxIOEs1ZlR6c1UzZmtxNnJKQnRlRnc0UFFaLUFUVA==)/Z3_PIA_PORTAL#tab-selection' } ] },
    // Configurador antes de la tabla de compatibilidad
    { title: 'Configurador de variadores y servomotores SIEMENS', desc: 'Configura variadores, motores y servos segun requerimientos.', badge: 'Siemens', actions: [ { label: 'Abrir', href: 'https://mall.industry.siemens.com/spice/cloudcm/dashboard?caller=SPC' } ] },
    { title: 'Compatibilidad de liner', desc: 'Guia para elegir liner adecuado segun fluido y condiciones.', badge: 'Referencia', actions: [ { label: 'Abrir documento', href: '/herramientas/Siemens%20Liner%20Full%20New.pdf', openInModal: true } ] },
    { title: 'Tabla de compatibilidad de materiales', desc: 'Consulta rapida para compatibilidades quimicas y de proceso.', badge: 'Referencia', actions: [ { label: 'Abrir', href: 'https://www.coleparmer.com/chemical-resistance' }, { label: 'Abrir documento', href: '/herramientas/Chemical_Resistance_Chart_202106.pdf', openInModal: true } ] },
    { title: 'Guia de seleccion de celdas de carga', desc: 'Criterios de seleccion para celdas de carga por aplicacion.', badge: 'Guia', actions: [ { label: 'Abrir documento', href: '/herramientas/manual%20de%20celdas%20y%20MODULOS%20DE%20PESAJE%20RICE%20LAKE%20en%20espa%C3%B1ol.pdf', openInModal: true } ] }
  ];

  // Tests de estructura y orden
  useEffect(() => {
    const tia = tools.find(t => t.title.includes('TIA')); console.assert(tia && tia.actions?.length === 2, 'TIA debe tener 2 acciones');
    console.assert(tools.length === 6, 'Deben existir 6 herramientas');
    const pia = tools.find(t => t.title.includes('PIA')); console.assert(pia?.actions?.[0]?.href?.includes('pia-portal'), 'PIA URL debe ser del portal oficial');
    const liner = tools.find(t => t.title.toLowerCase().includes('liner')); console.assert(liner?.actions?.[0]?.label === 'Abrir documento', 'Liner debe usar Abrir documento');
    const mat = tools.find(t => t.title.toLowerCase().includes('compatibilidad de materiales')); console.assert(mat?.actions?.length >= 2, 'Materiales debe tener 2 acciones'); console.assert(mat?.actions?.some(a => (a.href || '').includes('/herramientas/Chemical_Resistance_Chart_202106.pdf')), 'Materiales debe apuntar al PDF local');
    const idxCfg = tools.findIndex(t => t.title.toLowerCase().includes('configurador')); const idxMat = tools.findIndex(t => t.title.toLowerCase().includes('compatibilidad de materiales')); console.assert(idxCfg > -1 && idxMat > -1 && idxCfg < idxMat, 'Configurador debe estar antes que la tabla de compatibilidad');
    const tSrc = buildViewerSrc('/x.pdf', 'PTFE', true); console.assert(tSrc.includes('?file=') && tSrc.includes('search=PTFE'), 'buildViewerSrc (herramientas) ok');
  }, []);

  // --- Event listeners (desde chatbot) ---
  useEffect(() => {
    const onOpen = (e) => {
      const d = e.detail || {};
      if (d.section !== 'herramientas') return;
      if (!d.href) return;
      const src = buildViewerSrc(d.href, d.search || '', true);
      setTerm(d.search || '');
      setPreview({ item: { title: d.title || 'Documento' }, src });
    };
    window.addEventListener('portal:openPreview', onOpen);
    return () => window.removeEventListener('portal:openPreview', onOpen);
  }, []);

  return (
    <section id="herramientas" className="min-h-[70vh] border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Herramientas comerciales para los canales</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">Accede a utilidades tecnicas y de seleccion que agilizan tu preingenieria y cotizacion.</p>
          </div>
          <a href="#home" className="hidden md:inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Volver</a>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => (
            <article key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">{t.badge}</span>
              </div>
              <p className="mt-2 text-slate-700 text-sm">{t.desc}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {t.actions?.map((a, idx) => (
                  a.openInModal ? (
                    <button key={idx} onClick={() => { track('tool_click', { tool: t.title, action: a.label, href: a.href }); openPreview({ title: t.title, href: a.href }); }} className={`rounded-xl px-4 py-2 text-sm font-semibold ${idx === 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'}`}>{a.label}</button>
                  ) : (
                    <a key={idx} href={a.href} target="_blank" rel="noopener" onClick={() => track('tool_click', { tool: t.title, action: a.label, href: a.href })} className={`rounded-xl px-4 py-2 text-sm font-semibold ${idx === 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'}`}>{a.label}</a>
                  )
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8"><a href="#home" className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Volver al inicio</a></div>
      </div>

      {/* Modal de previsualizacion PDF + Buscador */}
      {preview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{preview.item.title}</h3>
                <p className="text-xs text-slate-500">Visor interno • Herramientas</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 mr-3 text-xs text-slate-600"><label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={usePdfJs} onChange={(e) => setUsePdfJs(e.target.checked)} />Usar visor pdf.js</label></div>
                <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar (ej. PTFE, 3RT...)" className="w-64 md:w-72 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                <button onClick={applySearch} className="rounded-xl bg-emerald-600 px-3 py-2 text-white text-sm font-semibold hover:bg-emerald-700">Buscar</button>
                <button onClick={copyReference} disabled={!term} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-40">Copiar</button>
                <button onClick={() => downloadFile(preview.item.href, fileNameFromUrl(preview.item.href))} className="rounded-xl bg-slate-900 px-3 py-2 text-white text-sm font-semibold hover:bg-black">Descargar</button>
                <button onClick={() => setPreview(null)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Cerrar</button>
              </div>
            </div>
            <div className="h-[75vh]"><iframe title="Visor PDF" src={buildViewerSrc(preview.item.href, term, usePdfJs)} className="w-full h-full" /></div>
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
    <section id="stats" className="min-h-[70vh] border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Estadisticas de uso (local)</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">Resumen simple basado en <code>localStorage</code>. Ideal para validar adopcion antes de conectar a backend.</p>
          </div>
          <a href="#home" className="hidden md:inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Volver</a>
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
    <footer className="bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-400">INGETES S.A.S.</p>
          <p className="mt-2 text-sm text-slate-300">Soluciones de automatizacion industrial. Bogota, Colombia.</p>
        </div>
        <div className="md:text-right text-sm text-slate-300">
          <p>Soporte: <a href="mailto:soporte@ingetes.com" className="underline underline-offset-4">soporte@ingetes.com</a></p>
          <p className="mt-1">Comercial: <a href="mailto:jgarzon@ingetes.com" className="underline underline-offset-4">jgarzon@ingetes.com</a></p>
        </div>
      </div>
    </footer>
  );
}
