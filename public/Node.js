// /pages/api/consulta.js
export default async function handler(req, res) {
  const { id } = req.query;

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = 'appMQwMQMQz7dLISZ';

  const url = `https://api.airtable.com/v0/${baseId}/clientes?filterByFormula=({idPublico}="${id}")`;

  const resposta = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const dados = await resposta.json();

  res.status(200).json(dados);
}
if (!id) return res.status(400).json({ error: 'ID obrigatório' });
if (!resposta.ok) {
  return res.status(500).json({ error: 'Erro ao consultar Airtable' });
}
res.setHeader('Access-Control-Allow-Origin', '*');
GET /api/parceiros -> responde JSON dos parceiros
