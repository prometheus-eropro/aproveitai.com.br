// api/[tabela].js
export default async function handler(req, res) {
  // CORS básico (permite GET de qualquer origem)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const token = process.env.AIRTABLE_TOKEN;
  const base = "appMQwMQMQz7dLISZ"; // já sabe né
  const { tabela, view, fields, maxRecords, filterByFormula, pageSize, offset } = req.query;

  if (!token || !base || !tabela) {
    return res.status(400).json({ error: "Faltando token/base/tabela." });
  }

  // Monta querystring opcional pra Airtable
  const qs = new URLSearchParams();
  if (view) qs.set("view", view);
  if (maxRecords) qs.set("maxRecords", maxRecords);
  if (pageSize) qs.set("pageSize", pageSize);
  if (offset) qs.set("offset", offset);
  if (filterByFormula) qs.set("filterByFormula", filterByFormula);
  // fields=Nome,Beneficio,Cidade
  if (fields) for (const f of String(fields).split(",")) qs.append("fields[]", f.trim());

  const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(tabela)}${qs.toString() ? "?" + qs.toString() : ""}`;

  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return res.status(r.status).json({ error: "Airtable falhou." });
    const data = await r.json();

    // 🧽 Saneamento: remova campos perigosos automaticamente
    const blacklist = new Set(["token", "cpf", "email", "telefone", "celular", "whatsapp"]);
    const safe = {
      ...data,
      records: (data.records || []).map(rec => ({
        id: rec.id,
        createdTime: rec.createdTime,
        fields: Object.fromEntries(
          Object.entries(rec.fields || {}).filter(([k]) => !blacklist.has(k.toLowerCase()))
        )
      }))
    };

    return res.status(200).json(safe);
  } catch (e) {
    return res.status(500).json({ error: "Erro interno", detail: e.message });
  }
}
