export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const id = (req.body?.id || "").trim();
  if (!id) return res.status(400).json({ erro: "ID obrigatório" });

  const API_KEY = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE = process.env.AIRTABLE_CLIENTES || "clientes";

  const formula = `OR({cpf}="${id}", {idPublico}="${id}")`;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;

  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
    const data = await r.json();
    const rec = data.records?.[0];

    if (!rec) return res.status(404).json({ erro: "Cliente não encontrado" });

    const ativo = String(rec.fields.ativo || "").toLowerCase() === "sim";
    if (!ativo) return res.status(403).json({ erro: "Cliente inativo" });

    const cliente = {
      nome: rec.fields.nome || "Sem nome",
      cpf: rec.fields.cpf || "00000000000",
      id: rec.id
    };

    res.status(200).json(cliente);
  } catch (e) {
    res.status(500).json({ erro: "Erro interno" });
  }
}
