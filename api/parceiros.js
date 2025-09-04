// /api/parceiros.js
export default async function handler(req, res) {
  try {
    const BASE = process.env.AIRTABLE_BASE_ID;
    const TABLE = process.env.AIRTABLE_TABELA_PARCEIROS || 'parceiros';
    const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}?pageSize=100`;

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` }
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ erro: 'Falha ao consultar Airtable', detalhe: text });
    }

    const data = await r.json();
    // (opcional) filtre só os registros ativos no servidor
    const records = (data.records || []).filter(rec => {
      const f = rec.fields || {};
      const ativo = f.ativo === 1 || f.ativo === true || String(f.ativo || '').toLowerCase() === 'sim';
      return ativo;
    });

    return res.status(200).json({ records });
  } catch (e) {
    return res.status(500).json({ erro: 'Erro interno', detalhe: e.message });
  }
}
