export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const data = req.body;
  if (!data || !data.nomeFantasia || !data.cnpj) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  const API_KEY = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE = "parceiros";

  try {
    const r = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: data }),
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ erro: "Falha ao cadastrar", detalhes: err });
    }

    const json = await r.json();
    return res.status(200).json(json);
  } catch (e) {
    return res.status(500).json({ erro: "Erro interno", detalhes: e.message });
  }
}
