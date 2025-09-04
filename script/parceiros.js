export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const API_KEY = process.env.AIRTABLE_TOKEN;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE = process.env.AIRTABLE_PARTNERS_TABLE || 'parceiros';

    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?maxRecords=100&view=Grid%20view`;

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!r.ok) {
      return res.status(500).json({ erro: 'Erro ao consultar o Airtable' });
    }

    const data = await r.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
