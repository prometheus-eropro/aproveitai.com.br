export default async function handler(req, res){
  if (req.method!=='POST') return res.status(405).end();
  const { cnpj, token: tk } = req.body;
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE;
  const table = 'parceiros';

  const formula = `AND({cnpj}='${cnpj}', {token}='${tk}')`;
  const url = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;

  const r = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
  if (!r.ok) return res.status(500).json({erro:true});
  const j = await r.json();
  const f = j.records?.[0]?.fields;
  if (!f) return res.status(404).json({erro:true});

  if ((f.ativo||'').toString().toLowerCase()!=='sim')
    return res.status(403).json({erro:true, motivo:'inativo'});

  return res.status(200).json({
    nome: f.nome || f.nomeFantasia || f.razao || 'Sem nome',
    cnpj: f.cnpj || cnpj,
    whatsapp: f.whatsapp || '',
    instagram: f.instagram || '',
    grupo: f.grupo || '',
    idPublico: f.idPublico || '',
    logoUrl: f.logoUrl || ''
  });
}
