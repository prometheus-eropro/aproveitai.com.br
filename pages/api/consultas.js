export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tabelas = JSON.parse(process.env.AIRTABLE_TABELAS_JSON || "{}");

  const tipo = req.query.tipo;

  if (!tipo || !tabelas[tipo]) {
    return res.status(400).json({ erro: "Tipo inválido ou não fornecido" });
  }

  const tabelaId = tabelas[tipo];
  const url = `https://api.airtable.com/v0/${baseId}/${tabelaId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao consultar Airtable: ${response.status}`);
    }

    const data = await response.json();
    const registros = data.records.map(r => r.fields);

    return res.status(200).json(registros);
  } catch (err) {
    console.error("Erro API:", err.message);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
}
