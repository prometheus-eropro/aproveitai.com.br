export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ erro: "Método não permitido" });

  const id = String(req.query.id || "").trim();
  if (!id) return res.status(400).json({ erro: "ID ausente" });

  const API_KEY = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE = process.env.AIRTABLE_CLIENTES || "clientes";

  try {
    const formula = `{idPublico}="${id}"`;
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;

    const r = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
    if (!r.ok) return res.status(502).json({ erro: "Falha na consulta" });

    const data = await r.json();
    const rec = (data.records || [])[0];
    if (!rec) return res.status(404).json({ erro: "Não encontrado" });

    const f = rec.fields || {};
    const payload = {
      nome: f.nome || "-",
      idPublico: f.idPublico || id,
      grupo: f.grupo || "-",
      cidade: f.cidade || "-",
      dataCadastro: f.dataCadastro || "",
      qrURL: f.qrURL || "",
      ativo: f.ativo || "NÃO"
    };

    return res.status(200).json(payload);
  } catch (e) {
    return res.status(500).json({ erro: "Erro interno", detalhes: e.message });
  }
}
