export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  try {
    const { cnpj, token } = req.body || {};
    if (!cnpj || !token) return res.status(400).json({ erro: 'Dados faltando' });

    // Sanitização
    const cnpjNum = String(cnpj).replace(/\D/g,'').slice(0,14);

    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE   = process.env.AIRTABLE_PARTNERS_TABLE || 'parceiros';
    const API_KEY = process.env.AIRTABLE_TOKEN;

    // Consulta com filterByFormula feita NO SERVIDOR
    const formula = `AND({cnpj}="${cnpjNum}", {token}="${String(token).trim()}")`;
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;

    const r = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` }});
    if (!r.ok) return res.status(502).json({ erro: 'Falha ao consultar base' });

    const data = await r.json();
    const rec = (data.records || [])[0];
    if (!rec) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const f = rec.fields || {};
    const ativo = String(f.ativo || '').trim().toLowerCase() === 'sim';
    if (!ativo) return res.status(423).json({ erro: 'Parceiro inativo' });

    // Monte a resposta mínima necessária para o front
    const payload = {
      nome: f.nome || f.nomeFantasia || f.razao || 'Sem nome',
      cnpj: f.cnpj || cnpjNum,
      grupo: f.grupo || '',
      idPublico: f.idPublico || '',
      logoUrl: f.logoUrl || '',
      whatsapp: f.whatsapp || '',
      instagram: f.instagram || ''
    };

    return res.status(200).json(payload);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro interno' });
  }
}
