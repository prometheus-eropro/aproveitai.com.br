// /pages/api/promocoes.js
export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'appMQwMQMQz7dLISZ';
  const tableName = 'promocoes';

  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?view=Grid%20view`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro na requisição Airtable');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error('Erro na API:', e);
    res.status(500).json({ erro: 'Erro ao buscar promoções' });
  }
}
