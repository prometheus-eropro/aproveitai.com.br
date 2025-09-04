export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { parceiro, cnpj, idCliente, status } = req.body || {};
  if (!parceiro || !cnpj || !idCliente || !status)
    return res.status(400).json({ erro: "Dados incompletos" });

  const API_KEY = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE = process.env.AIRTABLE_LOG || "log";

  try {
    const r = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          parceiro,
          cnpj,
          idCliente,
          status,
          data: new Date().toISOString()
        }
      })
    });

    if (!r.ok) return res.status(502).json({ erro: "Erro ao registrar log" });

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: "Erro interno" });
  }
}
