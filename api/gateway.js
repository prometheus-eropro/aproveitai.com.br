export default async function handler(req, res) {
  try {
    const { tabela } = req.query;

    if (!tabela) {
      return res.status(400).json({ error: "Tabela não informada" });
    }

    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const API_KEY = process.env.AIRTABLE_API_KEY;

    if (!BASE_ID || !API_KEY) {
      return res.status(500).json({
        error: "Variáveis do Airtable não configuradas",
      });
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(
      tabela
    )}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const erro = await response.text();
      return res.status(500).json({
        error: "Erro ao acessar Airtable",
        detalhe: erro,
      });
    }

    const data = await response.json();

    const registros = data.records.map((r) => ({
      id: r.id,
      ...r.fields,
    }));

    return res.status(200).json(registros);
  } catch (err) {
    return res.status(500).json({
      error: "Erro interno na API",
      detalhe: err.message,
    });
  }
}
