export default async function handler(req, res) {
  const API_KEY = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const fields = req.body;

  const resposta = await fetch(`https://api.airtable.com/v0/${BASE_ID}/clientes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  const json = await resposta.json();
  res.status(resposta.status).json(json);
}
