// /api/upload.js  — Vercel Serverless Function (Node 18+)
// NOTA: no uses "node-fetch". fetch es global.

export default async function handler(req, res) {
  // --- CORS (permite llamadas desde GitHub Pages) ---
  res.setHeader('Access-Control-Allow-Origin', 'https://ingetes.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, msg: 'Use POST' });
  }

  try {
    // Verificación rápida de envs
    const missing = ['GH_TOKEN3','GH_OWNER3','GH_REPO3','GH_BRANCH3','ADMIN_KEY_CLIENTES']
      .filter(k => !process.env[k]);
    if (missing.length) {
      return res.status(500).json({ ok: false, msg: `Env faltantes: ${missing.join(', ')}` });
    }

    const { adminKey, fileBase64, path, message } = req.body || {};
    if (!adminKey || !fileBase64 || !path) {
      return res.status(400).json({ ok: false, msg: 'Campos requeridos: adminKey, fileBase64, path' });
    }
    if (adminKey !== process.env.ADMIN_KEY_CLIENTES) {
      return res.status(401).json({ ok: false, msg: 'Clave incorrecta' });
    }

    const owner  = process.env.GH_OWNER3;
    const repo   = process.env.GH_REPO3;
    const branch = process.env.GH_BRANCH3;
    const token  = process.env.GH_TOKEN3;

    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

    // 1) Consultar SHA actual (si existe)
    let sha;
    const metaRes = await fetch(`${apiBase}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ingetes-portal-clientes'
      }
    });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      sha = meta.sha;
    }

    // 2) Hacer PUT con el archivo en base64 (SIN data URL)
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ingetes-portal-clientes'
      },
      body: JSON.stringify({
        message: message || `Update ${path} via Portal Clientes`,
        content: fileBase64,
        branch,
        sha
      })
    });

    const data = await putRes.json();
    if (!putRes.ok) {
      console.error('GitHub error:', data);
      return res.status(502).json({ ok: false, msg: data.message || 'GitHub PUT failed' });
    }

    return res.status(200).json({
      ok: true,
      msg: 'Subido a GitHub',
      path,
      commit: data.commit?.sha || null
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, msg: e.message || 'Server error' });
  }
}
