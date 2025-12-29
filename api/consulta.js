export default async function handler(req, res) {
  try {
    const { tabela, filtro, campo, valor } = req.query;

    if (!tabela) {
      return res.status(400).json({ erro: "Tabela não informada" });
    }

    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const API_KEY = process.env.AIRTABLE_API_KEY;

    let url = `https://api.airtable.com/v0/${BASE_ID}/${tabela}`;

    if (campo && valor) {
      url += `?filterByFormula=${encodeURIComponent(`{${campo}}='${valor}'`)}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ erro: text });
    }

    const data = await response.json();

    const registros = data.records.map(r => ({
      id: r.id,
      ...r.fields
    }));

    res.status(200).json(registros);

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}
