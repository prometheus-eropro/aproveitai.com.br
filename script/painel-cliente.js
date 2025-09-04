// /pages/api/painel-cliente.js
export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'appMQwMQMQz7dLISZ';

  const id = req.query.id;
  if (!id) return res.status(400).json({ erro: "ID não enviado" });

  const fetchBase = async (table) => {
    const url = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula={idPublico}='${id}'`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.json();
  };

  try {
    const promocoes = await fetchBase("promocoes");
    const beneficios = await fetchBase("beneficios");

    res.status(200).json({
      promocoes: promocoes.records || [],
      beneficios: beneficios.records || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar dados" });
  }
}
