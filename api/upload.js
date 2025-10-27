import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { adminKey, fileBase64, path, message } = req.body || {};

    // 1. Validar clave de administrador
    if (adminKey !== process.env.ADMIN_KEY_CLIENTES)
      return res.status(401).json({ ok: false, msg: 'Clave incorrecta' });

    // 2. Preparar commit en GitHub
    const owner  = process.env.GH_OWNER3;
    const repo   = process.env.GH_REPO3;
    const branch = process.env.GH_BRANCH3;
    const token  = process.env.GH_TOKEN3;

    // 3. Obtener SHA actual (si existe)
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`;
    const metaRes = await fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } });
    const meta = metaRes.ok ? await metaRes.json() : {};
    const sha = meta.sha;

    // 4. Subir el archivo
    const putRes = await fetch(fileUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message || `Update ${path} via Portal Clientes`,
        content: fileBase64,
        branch,
        sha,
      }),
    });

    const j = await putRes.json();
    if (!putRes.ok) throw new Error(j.message || 'Error al subir');

    return res.status(200).json({ ok: true, msg: 'Subido a GitHub', path });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, msg: e.message });
  }
}
